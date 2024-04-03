import Loan from "../models/Loan";
import CreditScore from "../models/CreditScore";
import Customer from "../models/Customer";
import { readXlsxFile } from "../utils/readXlsxFile";
import path from "path";

import { Request, Response } from "express";

export const addLoansFromXslx = async (req: Request, res: Response) => {
    try{
        const columnNames = ["customer_id", "loan_id", "loan_amount", "tenure", "interest_rate", "emi", "emis_paid_on_time", "start_date", "end_date"];
        const loans: any = readXlsxFile(path.resolve(__dirname, "../../data/loan_data.xlsx"), columnNames);

        await Loan.bulkCreate(loans);
        res.status(200).send("Loans added successfully");
    }
    catch(err){
        res.status(500).send("Internal Server Error");
    }
};

export const addLoan = async (req: Request, res: Response) => {
    try{
        const {customer_id, loan_amount, interest_rate, tenure} = req.body;
        const loan = await Loan.create({customer_id, loan_amount, interest_rate, tenure});
        res.status(200).send(loan);
    }
    catch(err){
        res.status(500).send("Internal Server Error");
    }
};

export const getLoanById = async (req: Request, res: Response) => {
    try{
        const {loan_id} = req.params;
        const loan = await Loan.findByPk(loan_id);
        res.status(200).send(loan);
    }
    catch(err){
        res.status(500).send("Internal Server Error");
    }
};


export const makePayment = async (req: Request, res: Response) => {
    try{
        const {loan_id, customer_id, amount} = req.body;
        const customerLoan: any = await Loan.findOne({where: {loan_id, customer_id}});
        if(!customerLoan){
            res.status(400).send("No loan found for this customer");
            return;
        }
        const customer = await Customer.findByPk(customer_id);
        if(!customer){
            res.status(400).send("No customer found");
            return;
        }
        if(amount > customerLoan.emi){
            const newEmi = Math.round((customerLoan.loan_amount * customerLoan.interest_rate * Math.pow(1 + customerLoan.interest_rate, customerLoan.tenure)) / (Math.pow(1 + customerLoan.interest_rate, customerLoan.tenure) - 1));
            const newEmisPaidOnTime = customerLoan.emis_paid_on_time + 1;
            const newEndDate = new Date(customerLoan.end_date);
            newEndDate.setMonth(newEndDate.getMonth() + 1);
            await Loan.update({emi: newEmi, emis_paid_on_time: newEmisPaidOnTime, end_date: newEndDate}, {where: {loan_id, customer_id}});
            res.status(200).send("Payment made successfully");
            return;
        }
        else{
            const newEmi = customerLoan.emi;
            const newEmisPaidOnTime = customerLoan.emis_paid_on_time + 1;
            const newEndDate = new Date(customerLoan.end_date);
            newEndDate.setMonth(newEndDate.getMonth() + 1);
            await Loan.update({emi:newEmi, emis_paid_on_time: newEmisPaidOnTime, end_date: newEndDate}, {where: {loan_id, customer_id}});
            res.status(200).send("Payment made successfully");
            return;

        }

    }
    catch(err){
        res.status(500).send("Internal Server Error");

    }   
};



export const checkLoanEligibility = async (req: Request, res: Response) => {
    try{
        const {customer_id, loan_amount, interest_rate, tenure} = req.body;

        /* 
           If credit score > 50, approve loan
            ▪ If 50 > credit score > 30, approve loans with interest rate
            > 12%
            ▪ If 30> credit score > 10, approve loans with interest rate
            >16%
            ▪ If 10> credit score, don’t approve any loans
            ▪ If sum of all current EMIs > 50% of monthly salary, don’t
            approve any loans
            ▪ If the interest rate does not match as per credit limit,
            correct the interest rate in the response, i.e suppose
            credit score is calculated to be 20 for a particular loan
            and the interest_rate is 8%, send a
            corrected_interest_rate = 16% (lowest of slab) in the
            response body, corrected
        */

        const credit_score = await CreditScore.findOne({where: {customer_id}});
        if(!credit_score){
            res.status(400).send("Credit score not found");
            return;
        }

        const {credit_score: score} = credit_score.toJSON();
        if(score < 10){
            return res.status(200).send("Loan not approved");
        }
        else if(score < 30){
            if(interest_rate < 16){
                res.status(200).send({corrected_interest_rate: 16});
                return;
            }
        }
        else if(score < 50){
            if(interest_rate < 12){
                res.status(200).send({corrected_interest_rate: 12});
                return;
            }
        }
        else{
            if(interest_rate < 8){
                res.status(200).send({corrected_interest_rate: 8});
                return;
            }
        }

        const loans = await Loan.findAll({where: {customer_id}}).then((loans) => loans.map((loan) => loan.toJSON()));
        const total_loan = loans.reduce((acc, curr: any) => acc + curr.loan_amount, 0);
        if(total_loan > 0.5 * 0.36 * req.body.monthly_salary){
            res.status(200).send("Loan not approved");
            return;
        }

        return res.status(200).send("Loan approved");
        
    }
    catch(err){
        console.log(err);
    }
}


export const viewStatement = async (req: Request, res: Response) => {
    try{
        const {loan_id, customer_id} = req.body;
        const customer = await Customer.findByPk(customer_id);
        if(!customer){
            res.status(400).send("Customer not found");
            return;
        }
        const loan: any = await Loan.findOne({where: {loan_id, customer_id}});
        if(!loan){
            res.status(400).send("Loan not found");
            return;
        }

        const principal_amount = loan.loan_amount;
        const interest_rate = loan.interest_rate;
        const repayments_left = loan.tenure - loan.emis_paid_on_time;
        const emi = loan.emi;
        const amount_paid = loan.emis_paid_on_time * emi;

        const statement = {
            principal_amount,
            interest_rate,
            repayments_left,
            emi,
            amount_paid
        };

        res.send(200).send(statement);

        
    }
    catch(err){
        res.status(500).send("Internal Server Error");
    }
}