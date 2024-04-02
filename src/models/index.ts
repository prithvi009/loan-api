import { Sequelize } from 'sequelize';

import { sequelize } from  '../config/sequelize';
import Customer from './Customer';
import Loan from './Loan';
import CreditScore from './CreditScore';

interface Database {
  sequelize: Sequelize;
  customer: typeof Customer;
  loan: typeof Loan;
  credit_score: typeof CreditScore;

}

const db: Database = {} as Database;

db.sequelize = sequelize;
db.customer = Customer;
db.loan = Loan;
db.credit_score = CreditScore;


export async function  sync_models(){
    db.sequelize.sync({ force: true, alter: true }).then(() => {
		console.log(` Database Synced...`)
    })
}

