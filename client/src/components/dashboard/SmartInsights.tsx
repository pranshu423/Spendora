import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

interface Subscription {
    _id: string;
    name: string;
    category: string;
    amount: number;
    billingCycle: 'Monthly' | 'Yearly';
    status: 'Active' | 'Paused' | 'Cancelled';
}

interface SmartInsightsProps {
    subscriptions: Subscription[];
}

const SmartInsights = ({ subscriptions }: SmartInsightsProps) => {
    const navigate = useNavigate();

    const insights = useMemo(() => {
        const activeSubs = subscriptions.filter(s => s.status === 'Active');
        if (activeSubs.length === 0) return [];

        const tips = [];

        // 1. Find most expensive category
        const categoryTotals: Record<string, number> = {};
        activeSubs.forEach(sub => {
            const amount = sub.billingCycle === 'Monthly' ? sub.amount : sub.amount / 12;
            categoryTotals[sub.category] = (categoryTotals[sub.category] || 0) + amount;
        });
        const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];

        if (topCategory) {
            tips.push({
                icon: <TrendingUp size={16} className="text-purple-400" />,
                text: <span>Highest spending in <span className="text-white font-bold">{topCategory[0]}</span> (₹{topCategory[1].toFixed(0)}/mo)</span>,
                action: 'View',
                link: '/reports'
            });
        }

        // 2. Find most expensive subscription
        const mostExpensive = activeSubs.sort((a, b) => b.amount - a.amount)[0];
        if (mostExpensive) {
            tips.push({
                icon: <AlertCircle size={16} className="text-indigo-400" />,
                text: <span><span className="text-white font-bold">{mostExpensive.name}</span> is your costliest sub (₹{mostExpensive.amount}).</span>,
                action: 'Check Alternatives',
                link: '/reports' // Changed to reports as there is no specific subscriptions page usually, or dashboard
            });
        }

        // 3. Duplicate Category Check
        const categories = activeSubs.map(s => s.category);
        const duplicateCategory = categories.filter((item, index) => categories.indexOf(item) !== index)[0];
        if (duplicateCategory) {
            tips.push({
                icon: <Sparkles size={16} className="text-yellow-400" />,
                text: <span>You have multiple subs in <span className="text-white font-bold">{duplicateCategory}</span>. Bundle?</span>,
                action: 'Review',
                link: '/reports'
            });
        }

        return tips.slice(0, 3);
    }, [subscriptions]);

    if (insights.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20"
            >
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={20} className="text-indigo-400" />
                    <h3 className="font-semibold text-white">Smart Insights</h3>
                </div>
                <p className="text-sm text-gray-400">Add verified subscriptions to get AI-powered saving tips.</p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 relative overflow-hidden h-full flex flex-col"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Sparkles size={20} className="text-indigo-400" />
                    <h3 className="font-semibold text-white">Smart Insights</h3>
                </div>
                <span className="text-[10px] font-bold tracking-wider uppercase bg-indigo-500 text-white px-2 py-0.5 rounded-full">New</span>
            </div>

            <div className="space-y-4 flex-1">
                {insights.map((insight, idx) => (
                    <div
                        key={idx}
                        onClick={() => navigate(insight.link)}
                        className="p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                    >
                        <div className="flex items-start gap-3 mb-2">
                            <div className="mt-0.5">{insight.icon}</div>
                            <p className="text-sm text-gray-300 leading-snug">{insight.text}</p>
                        </div>
                        <div className="flex items-center text-xs text-indigo-400 font-medium group-hover:translate-x-1 transition-transform pl-7">
                            {insight.action} <ArrowRight size={12} className="ml-1" />
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default SmartInsights;
