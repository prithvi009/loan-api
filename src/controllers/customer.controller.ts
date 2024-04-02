import Customer from "../models/Customer";
import CreditScore from "../models/CreditScore";
import Loan from "../models/Loan";
import { Request, Response } from "express";
import path from "path";

import { readXlsxFile } from "../utils/readXlsxFile";

export const addCustomers = async (req: Request, res: Response) => {
    try{
        const customers = readXlsxFile(path.resolve(__dirname, "../../data/customer_data.xlsx"));
        await Customer.bulkCreate(customers);
        res.status(200).send("Customers added successfully");
    }
    catch(err){
        console.log(err);
    }
};

export const addCustomer = async (req: Request, res: Response) => {
    try{
        const {first_name, last_name, age, monthly_salary, phone_number} = req.body;
        const approved_limit = Math.round(36 * monthly_salary/ 100000) * 100000;
        const current_debt = 0;
        const customer = await Customer.create({first_name, last_name, age, monthly_salary, phone_number, approved_limit, current_debt});

        //assign credit score out of 100 based on loan 
        const loan = await Loan.findAll({where: {customer_id: customer.customer_id}});
        let credit_score = 0;
        if(loan.length > 0){
            const total_loan = loan.reduce((acc, curr: any) => acc + curr.loan_amount, 0);
            credit_score = Math.round((approved_limit - total_loan) / approved_limit * 100);
        }
        else{
            credit_score = 100;
        }


        const {current_debt: _, ...newCustomer} = customer.toJSON();
        newCustomer["full_name"] = `${newCustomer.first_name} ${newCustomer.last_name}`;

        res.status(200).send(newCustomer);
    }
    catch(err){
        console.log(err);
    }
}