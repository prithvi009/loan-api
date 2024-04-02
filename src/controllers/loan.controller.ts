import Loan from "../models/Loan";
import CreditScore from "../models/CreditScore";

import { Request, Response } from "express";

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
            res.status(200).send("Loan not approved");
            return;
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

        const loans = await Loan.findAll({where: {customer_id}});
        const total_loan = loans.reduce((acc, curr: any) => acc + curr.loan_amount, 0);
        if(total_loan > 0.5 * 0.36 * req.body.monthly_salary){
            res.status(200).send("Loan not approved");
            return;
        }

        res.status(200).send("Loan approved");
        
    }
    catch(err){
        console.log(err);
    }
}