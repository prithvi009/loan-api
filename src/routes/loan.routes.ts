import express from 'express';

import { addLoansFromXslx } from '../controllers/loan.controller';
import { makePayment, viewStatement } from '../controllers/loan.controller';

const router = express.Router();

router.get('/loan/addloanfromxslv', addLoansFromXslx);
router.post('loan/make-payment/customer_id/loan_id', makePayment);
router.get('loan/view-statement/customer_id/loan_id', viewStatement);

export default router;