import Customer from "../models/Customer";
import CreditScore from "../models/CreditScore";
import Loan from "../models/Loan";
import { Request, Response } from "express";
import path from "path";

import { readXlsxFile } from "../utils/readXlsxFile";

export const addCustomersFromXslx= async (req: Request, res: Response) => {
    try{
        const columnNames = ['customer_id', 'first_name', 'last_name', 'age', 'phone_number', 'monthly_salary', 'approved_limit', 'current_debt'];
        const customers = readXlsxFile(path.resolve(__dirname, "../../data/customer_data.xlsx"), columnNames);
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

        const loan: any = await Loan.findOne(customer.customer_id);

        if(!loan){
            res.status(400).send("No loan found for this customer");
            return;
        }

        let credit_score = 0;
        if(customer.current_debt > approved_limit){
            credit_score = 0;
        }
        else if(loan.emis_paid_on_time > 70 || approved_limit > 200000){
            credit_score += 100;
        }
        else if(loan.emis_paid_on_time > 50 || approved_limit > 100000){
            credit_score += 70;
        }
        else if(loan.emis_paid_on_time > 30 || approved_limit > 50000){
            credit_score += 50;
        }
        else if(loan.emis_paid_on_time > 10 || approved_limit > 10000){
            credit_score += 30;
        }

        await CreditScore.create({customer_id: customer.customer_id, credit_score});

        const {current_debt: _, ...newCustomer} = customer.toJSON();
        newCustomer["full_name"] = `${newCustomer.first_name} ${newCustomer.last_name}`;

        res.status(200).send(newCustomer);
    }
    catch(err){
        console.log(err);
    }
}