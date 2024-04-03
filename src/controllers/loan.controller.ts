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
        //remove duplicates loan_id
        const uniqueLoans = loans.filter((loan: any, index: number, self: any) =>
            index === self.findIndex((t: any) => (
                t.loan_id === loan.loan_id
            ))
        );

        await Loan.bulkCreate(uniqueLoans);
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
        const loan: any = await Loan.findByPk(loan_id);
        if(!loan){
            res.status(400).send("No loan found");
            return;
        }
        const customer = await Customer.findByPk(loan.customer_id);
        if(!customer){
            res.status(400).send("No customer found");
            return;
        }
        const customerjs = customer.toJSON();
        const {current_debt: _, ...newCustomer} = customerjs;

        const loanDetails = {
            ...loan.toJSON(),
            customer: newCustomer
        }
        res.status(200).send(loanDetails);
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

        const creditScore: any = await CreditScore.findOne({where: {customer_id}});
        if(!creditScore){
            res.status(400).send("No credit score found");
            return;
        }
        if(creditScore.credit_score > 50){
            const loan = await Loan.create({customer_id, loan_amount, interest_rate, tenure});
            res.status(200).send(loan);
            return;
        }
        else if(50 > creditScore.credit_score  && creditScore.credit_score > 30){
            if(interest_rate > 12){
                const loan = await Loan.create({customer_id, loan_amount, interest_rate, tenure});
                res.status(200).send(loan);
                return;
            }
            else{
                
                return res.status(400).send("Interest rate should be greater than 12%");
            }
        }
        else if(30 > creditScore.credit_score && creditScore.credit_score > 10){
            if(interest_rate > 16){
                const loan = await Loan.create({customer_id, loan_amount, interest_rate, tenure});
                res.status(200).send(loan);
                return;
            }
            else{
                return res.status(400).send("Interest rate should be greater than 16%");
            }
        }
        else{
            return res.status(400).send("Loan not approved");
        }


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