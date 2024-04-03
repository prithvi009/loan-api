import express from 'express';

import { addLoansFromXslx, checkLoanEligibility } from '../controllers/loan.controller';
import { makePayment, viewStatement, getLoanById } from '../controllers/loan.controller';

const router = express.Router();

router.get('/loan/addloanfromxslv', addLoansFromXslx);
router.post('/loan/check-eligibility', checkLoanEligibility);
router.post('/loan/make-payment/customer_id/loan_id', makePayment);
router.post('/loan/view-statement/customer_id/loan_id', viewStatement);
router.post('/loan/loan_id', getLoanById);

export default router;