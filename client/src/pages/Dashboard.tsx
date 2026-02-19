import { useEffect, useState } from 'react';
import api from '../lib/axios';
import DashboardWidgets from '../components/DashboardWidgets';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import GreetingWidget from '../components/dashboard/GreetingWidget';
import DailySpendLimit from '../components/dashboard/DailySpendLimit';
import RenewalCountdown from '../components/dashboard/RenewalCountdown';
import SpendingTrends from '../components/dashboard/SpendingTrends';
import SmartInsights from '../components/dashboard/SmartInsights';

interface Subscription {
    _id: string;
    name: string;
    category: string;
    amount: number;
    billingCycle: 'Monthly' | 'Yearly';
    nextRenewalDate: string;
    status: 'Active' | 'Paused' | 'Cancelled';
    logo?: string;
}

const Dashboard = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();

        const handleUpdate = () => fetchData();
        window.addEventListener('subscription_updated', handleUpdate);
        window.addEventListener('subscription_added', handleUpdate);
        window.addEventListener('subscription_deleted', handleUpdate);

        return () => {
            window.removeEventListener('subscription_updated', handleUpdate);
            window.removeEventListener('subscription_added', handleUpdate);
            window.removeEventListener('subscription_deleted', handleUpdate);
        };
    }, []);

    const fetchData = async () => {
        try {
            const { data } = await api.get('/subscriptions');
            setSubscriptions(data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6 pb-10">
            {/* 1. Header Section */}
            <GreetingWidget />

            {/* 2. Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <DailySpendLimit />
                <RenewalCountdown subscriptions={subscriptions} />
                <SmartInsights subscriptions={subscriptions} />
            </div>

            {/* 3. Trends & Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <SpendingTrends />
                </div>
                <div className="lg:col-span-1">
                    <div className="p-6 rounded-2xl bg-card border border-white/5 h-full">
                        <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="w-full p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm font-medium text-left flex items-center gap-2"
                            >
                                <span>+</span> Add New Subscription
                            </button>
                            <button
                                onClick={() => navigate('/reports')}
                                className="w-full p-3 rounded-xl bg-secondary/10 text-white hover:bg-secondary/20 transition-colors text-sm font-medium text-left"
                            >
                                View Full Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. Recent Transactions / Active Subscriptions (Legacy Widget adjusted) */}
            <div>
                <h3 className="text-xl font-bold text-white mb-4">Your Subscriptions</h3>
                <DashboardWidgets subscriptions={subscriptions} />
            </div>

            <AddSubscriptionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={fetchData}
            />
        </div>
    );
};

export default Dashboard;
