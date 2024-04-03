import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {sync_models} from './models/index';
import CustomerRoute from './routes/customer.route';
import LoanRoute from './routes/loan.routes';

dotenv.config();



function main(){

    const app = express();

    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/api', CustomerRoute);
    app.use('/api', LoanRoute);

    const port = process.env.PORT || 8080;

    if(process.env.NODE_ENV !== 'production'){
        sync_models();
    }

    app.listen(port , () => {
        console.log(`Server is running on port ${port}`);
    });
}

main();