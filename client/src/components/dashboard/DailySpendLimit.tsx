import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

const DailySpendLimit = () => {
    // Mock data for "GenZ" visuals - would hook up to real logic later
    const dailyLimit = 100;
    const currentSpend = 45;
    const percentage = (currentSpend / dailyLimit) * 100;

    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            className="p-6 rounded-2xl bg-card border border-white/5 relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="flex items-center justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        <Wallet size={20} />
                    </div>
                    <h3 className="font-semibold text-white">Daily Limit</h3>
                </div>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                    On Track
                </span>
            </div>

            <div className="space-y-2 relative z-10">
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Spent Today</span>
                    <span className="text-white font-bold">₹{currentSpend} / ₹{dailyLimit}</span>
                </div>

                {/* Progress Bar */}
                <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default DailySpendLimit;
