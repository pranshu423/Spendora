import cron from 'node-cron';
import Subscription from '../models/Subscription';
import Payment from '../models/Payment';
import { getIO } from '../socket';
import { IUser } from '../models/User';

const checkRenewals = () => {
    // Run every minute for testing/demo purposes (in production, use '0 0 * * *' for daily)
    cron.schedule('* * * * *', async () => {
        console.log('Running renewal check...');
        const today = new Date();

        try {
            // Find subscriptions that are due for renewal (nextRenewalDate <= today) AND are Active
            const dueSubscriptions = await Subscription.find({
                nextRenewalDate: { $lte: today },
                status: 'Active',
            }).populate('user');

            const io = getIO();

            for (const sub of dueSubscriptions) {
                console.log(`Processing renewal for: ${sub.name}`);

                // 1. Create Payment Record
                await Payment.create({
                    user: (sub.user as unknown as IUser)._id,
                    subscription: sub._id,
                    amount: sub.amount,
                    currency: sub.currency,
                    status: 'Completed',
                    date: new Date(),
                });

                // 2. Update Subscription Next Renewal Date
                const nextDate = new Date(sub.nextRenewalDate);
                if (sub.billingCycle === 'Monthly') {
                    nextDate.setMonth(nextDate.getMonth() + 1);
                } else if (sub.billingCycle === 'Yearly') {
                    nextDate.setFullYear(nextDate.getFullYear() + 1);
                }
                sub.nextRenewalDate = nextDate;
                await sub.save();

                // 3. Notify User via Socket.IO
                // We broadcast a 'payment_processed' event.
                // ideally we emit to a specific user room: io.to(userId).emit(...)
                // For now, we'll emit a generic event and let client filter or just refresh
                io.emit('payment_processed', {
                    subscription: sub.name,
                    amount: sub.amount,
                    date: new Date(),
                    user: (sub.user as unknown as IUser)._id
                });

                // Also emit subscription_updated so dashboard refreshes
                io.emit('subscription_updated', sub);

                console.log(`Renewed ${sub.name}. Next renewal: ${nextDate.toISOString()}`);
            }
        } catch (error) {
            console.error('Error processing renewals:', error);
        }
    });
};

export default checkRenewals;
