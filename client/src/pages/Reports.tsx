import { useEffect, useState } from 'react';
import api from '../lib/axios';
import { Loader2 } from 'lucide-react';
import DashboardWidgets from '../components/DashboardWidgets';

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

const Reports = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const { data } = await api.get('/subscriptions');
            setSubscriptions(data);
        } catch (error) {
            console.error('Failed to fetch report data:', error);
        } finally {
            setLoading(false);
        }
    };

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

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-heading text-foreground">Reports & Analytics</h1>
                <p className="text-muted-foreground mt-1">Deep dive into your spending habits</p>
            </div>

            {/* Reusing DashboardWidgets for now as they provide great analytics */}
            <DashboardWidgets subscriptions={subscriptions} />

            <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 border border-border rounded-xl bg-card">
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Spending Velocity</h3>
                    <p className="text-muted-foreground text-sm">Your spending has increased by 5.2% compared to last month.</p>
                </div>
                <div className="p-6 border border-border rounded-xl bg-card">
                    <h3 className="text-lg font-semibold mb-2 text-foreground">Subscription Churn</h3>
                    <p className="text-muted-foreground text-sm">You have cancelled 0 subscriptions this month.</p>
                </div>
            </div>
        </div>
    );
};

export default Reports;
