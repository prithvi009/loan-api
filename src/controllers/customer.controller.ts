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
        
        const uniqueCustomers = customers.filter((v:any, i, a) => a.findIndex((t:any) => (t.customer_id === v.customer_id)) === i);
        await Customer.bulkCreate(uniqueCustomers);
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

        const credit_score = 100;
        await CreditScore.create({customer_id: customer.customer_id, credit_score});

        const {current_debt: _, ...newCustomer} = customer.toJSON();
        newCustomer["full_name"] = `${newCustomer.first_name} ${newCustomer.last_name}`;

        res.status(200).send(newCustomer);
    }
    catch(err){
        console.log(err);
    }
}