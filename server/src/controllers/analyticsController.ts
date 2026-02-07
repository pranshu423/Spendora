import { Response } from 'express';
import Subscription from '../models/Subscription';
import { AuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

// @desc    Get analytics data
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req: AuthRequest, res: Response) => {
    const userId = new mongoose.Types.ObjectId(req.user?._id);

    // 1. Total Monthly Spend
    const totalSpend = await Subscription.aggregate([
        { $match: { user: userId, status: 'Active' } },
        {
            $group: {
                _id: null,
                total: {
                    $sum: {
                        $cond: [
                            { $eq: ['$billingCycle', 'Monthly'] },
                            '$amount',
                            { $divide: ['$amount', 12] }, // Convert yearly to monthly
                        ],
                    },
                },
            },
        },
    ]);

    // 2. Category Breakdown
    const categoryBreakdown = await Subscription.aggregate([
        { $match: { user: userId, status: 'Active' } },
        {
            $group: {
                _id: '$category',
                total: { $sum: '$amount' },
                count: { $sum: 1 },
            },
        },
    ]);

    // 3. Status Counts
    const statusCounts = await Subscription.aggregate([
        { $match: { user: userId } },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    // 4. Monthly Spending Trend (Mock data aggregation or real if we had transaction history. 
    // For now, pro-rating based on renewal dates is complex without transaction history.
    // We'll return basic stats for now.)

    res.json({
        totalMonthlySpend: totalSpend[0]?.total || 0,
        categoryBreakdown,
        statusCounts,
    });
};

export { getAnalytics };
