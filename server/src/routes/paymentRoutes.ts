import express from 'express';
import { getPayments } from '../controllers/paymentController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.route('/').get(protect, getPayments);

export default router;
