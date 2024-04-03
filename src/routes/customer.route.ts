import express from 'express';

import { addCustomersFromXslx, addCustomer } from '../controllers/customer.controller';

const router = express.Router();

router.get('/customer/addloanfromxslv', addCustomersFromXslx);
router.post('/customer', addCustomer);


export default router;