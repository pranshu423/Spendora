import { Response } from 'express';
import Subscription from '../models/Subscription';
import { AuthRequest } from '../middleware/authMiddleware';
import { getIO } from '../socket';

// @desc    Get all subscriptions
// @route   GET /api/subscriptions
// @access  Private
const getSubscriptions = async (req: AuthRequest, res: Response) => {
    const subscriptions = await Subscription.find({ user: req.user?._id });
    res.json(subscriptions);
};

// @desc    Get subscription by ID
// @route   GET /api/subscriptions/:id
// @access  Private
const getSubscriptionById = async (req: AuthRequest, res: Response) => {
    const subscription = await Subscription.findById(req.params.id);

    if (subscription && subscription.user.toString() === req.user?._id.toString()) {
        res.json(subscription);
    } else {
        res.status(404);
        throw new Error('Subscription not found');
    }
};

// @desc    Create a subscription
// @route   POST /api/subscriptions
// @access  Private
const createSubscription = async (req: AuthRequest, res: Response) => {
    const { name, category, amount, billingCycle, nextRenewalDate, paymentMethod, currency, logo } = req.body;

    if (!name || !category || !amount || !billingCycle || !nextRenewalDate) {
        res.status(400);
        throw new Error('Please fill in all required fields');
    }

    const subscription = await Subscription.create({
        user: req.user?._id,
        name,
        category,
        amount,
        billingCycle,
        nextRenewalDate,
        paymentMethod,
        currency,
        logo
    });

    try {
        const io = getIO();
        io.emit('subscription_added', subscription);
    } catch (error) {
        console.error("Socket emit failed:", error);
    }

    res.status(201).json(subscription);
};

// @desc    Update a subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
const updateSubscription = async (req: AuthRequest, res: Response) => {
    const subscription = await Subscription.findById(req.params.id);

    if (subscription && subscription.user.toString() === req.user?._id.toString()) {
        subscription.name = req.body.name || subscription.name;
        subscription.category = req.body.category || subscription.category;
        subscription.amount = req.body.amount || subscription.amount;
        subscription.billingCycle = req.body.billingCycle || subscription.billingCycle;
        subscription.nextRenewalDate = req.body.nextRenewalDate || subscription.nextRenewalDate;
        subscription.status = req.body.status || subscription.status;
        subscription.paymentMethod = req.body.paymentMethod || subscription.paymentMethod;
        subscription.currency = req.body.currency || subscription.currency;
        subscription.logo = req.body.logo || subscription.logo;

        const updatedSubscription = await subscription.save();

        try {
            const io = getIO();
            io.emit('subscription_updated', updatedSubscription);
        } catch (error) {
            console.error("Socket emit failed:", error);
        }

        res.json(updatedSubscription);
    } else {
        res.status(404);
        throw new Error('Subscription not found');
    }
};

// @desc    Delete a subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
const deleteSubscription = async (req: AuthRequest, res: Response) => {
    const subscription = await Subscription.findById(req.params.id);

    if (subscription && subscription.user.toString() === req.user?._id.toString()) {
        await subscription.deleteOne();

        try {
            const io = getIO();
            io.emit('subscription_deleted', req.params.id);
        } catch (error) {
            console.error("Socket emit failed:", error);
        }

        res.json({ message: 'Subscription removed' });
    } else {
        res.status(404);
        throw new Error('Subscription not found');
    }
};

export {
    getSubscriptions,
    getSubscriptionById,
    createSubscription,
    updateSubscription,
    deleteSubscription,
};
