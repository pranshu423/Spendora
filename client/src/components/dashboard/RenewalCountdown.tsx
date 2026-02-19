import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

interface Subscription {
    _id: string;
    name: string;
    nextRenewalDate: string;
    amount: number;
}

interface RenewalCountdownProps {
    subscriptions: Subscription[];
}

const RenewalCountdown = ({ subscriptions }: RenewalCountdownProps) => {
    // Logic to find nearest renewal
    const now = new Date();

    const upcomingRenewals = subscriptions
        .map(sub => ({
            ...sub,
            daysLeft: differenceInDays(parseISO(sub.nextRenewalDate), now)
        }))
        .filter(sub => sub.daysLeft >= 0)
        .sort((a, b) => a.daysLeft - b.daysLeft);

    const nearest = upcomingRenewals[0];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="p-6 rounded-2xl bg-card border border-white/5 relative overflow-hidden group h-full"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex items-center gap-2 mb-4 relative z-10">
                <Clock size={20} className="text-destructive" />
                <h3 className="font-semibold text-white">Next Renewal</h3>
            </div>

            {nearest ? (
                <div className="relative z-10">
                    <div className="text-4xl font-bold text-white mb-1">
                        {nearest.daysLeft} <span className="text-lg font-normal text-muted-foreground">days</span>
                    </div>
                    <p className="text-muted-foreground">
                        until <span className="text-white font-semibold">{nearest.name}</span> renews (₹{nearest.amount})
                    </p>

                    <div className="mt-4 w-full bg-secondary/30 rounded-full h-1.5 overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(0, 100 - (nearest.daysLeft * 3.3))}%` }} // Rough progress calc
                            className="h-full bg-destructive rounded-full"
                        />
                    </div>
                </div>
            ) : (
                <div className="text-muted-foreground relative z-10">No upcoming renewals nearby.</div>
            )}
        </motion.div>
    );
};

export default RenewalCountdown;
