import cron from 'node-cron';
import Subscription from '../models/Subscription';
import { getIO } from '../socket';
import { IUser } from '../models/User';
import { sendEmail } from '../services/emailService';

const checkRenewals = () => {
    // Run every day at midnight
    cron.schedule('0 0 * * *', async () => {
        console.log('Checking for upcoming renewals...');
        const today = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);

        try {
            // Find subscriptions renewing in 3 days
            const upcomingRenewals = await Subscription.find({
                nextRenewalDate: {
                    $gte: today,
                    $lt: threeDaysLater,
                },
                status: 'Active',
            }).populate('user', 'email name');

            const io = getIO();

            for (const sub of upcomingRenewals) {
                // In a real app, send email here using nodemailer
                console.log(`Reminder: ${sub.name} is renewing soon for user ${(sub.user as unknown as IUser).email}`);

                // Send Email
                await sendEmail(
                    (sub.user as unknown as IUser).email,
                    `Upcoming Renewal: ${sub.name}`,
                    `<p>Hi ${(sub.user as unknown as IUser).name},</p>
                   <p>Your subscription for <strong>${sub.name}</strong> is renewing on <strong>${sub.nextRenewalDate.toDateString()}</strong>.</p>
                   <p>Amount: ${sub.currency} ${sub.amount}</p>
                   <p>Login to Spendora to manage your subscriptions.</p>`
                );

                // Emit socket event to the user (if connected)
                // We would need a way to map user IDs to socket IDs, or use rooms.
                // For now, broadcasting to all or logic to emit to specific user room.
                // Assuming we join users to a room named after their UserID upon connection.
                const userId = (sub.user as unknown as IUser)._id as unknown as string;
                io.to(userId).emit('notification', {
                    title: 'Upcoming Renewal',
                    message: `Your subscription for ${sub.name} is renewing on ${sub.nextRenewalDate.toDateString()}`,
                });
            }
        } catch (error) {
            console.error('Error checking renewals:', error);
        }
    });
};

export default checkRenewals;
