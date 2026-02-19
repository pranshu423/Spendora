import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import Payment from '../models/Payment';
import { AuthRequest } from '../middleware/authMiddleware';

// @desc    Get user payments
// @route   GET /api/payments
// @access  Private
const getPayments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const payments = await Payment.find({ user: req.user?._id }).sort({ date: -1 });
    res.json(payments);
});

export { getPayments };
