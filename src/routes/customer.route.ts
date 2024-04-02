import express from 'express';

import { addCustomers } from '../controllers/customer.controller';

const router = express.Router();

router.get('/customer', addCustomers);

router.post('/customer', addCustomers);


export default router;