import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import DashboardWidgets from '../components/DashboardWidgets';
import { Loader2 } from 'lucide-react';

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
    const { user } = useAuth();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

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
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-heading text-foreground">Good morning, {user?.name?.split(' ')[0]}</h1>
                <p className="text-muted-foreground mt-2">Here's your real-time SaaS expenditure and usage overview.</p>
            </div>

            <DashboardWidgets subscriptions={subscriptions} />
        </div>
    );
};

export default Dashboard;
