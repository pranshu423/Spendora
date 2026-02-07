import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import api from '../lib/axios';
import { Loader2 } from 'lucide-react';

interface Subscription {
    _id: string;
    name: string;
    category: string;
    amount: number;
    billingCycle: string;
    nextRenewalDate: string;
    status: string;
    logo?: string;
}

const Payments = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const { data } = await api.get('/subscriptions');
            setSubscriptions(data);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
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

    // Simulate payment history based on renewal dates for now
    const payments = subscriptions
        .filter(sub => sub.status === 'Active')
        .map(sub => ({
            id: sub._id,
            service: sub.name,
            amount: sub.amount,
            date: sub.nextRenewalDate,
            status: 'Pending',
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold font-heading text-foreground">Payments</h1>
                <p className="text-muted-foreground mt-1">Track your upcoming and past transactions</p>
            </div>

            <div className="rounded-xl border border-border bg-card">
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Payments</h2>
                    <div className="relative w-full overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase text-muted-foreground bg-secondary/30">
                                <tr>
                                    <th className="px-6 py-3 rounded-l-lg">Service</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3 rounded-r-lg">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {payments.length > 0 ? payments.map((payment) => (
                                    <tr key={payment.id} className="group hover:bg-muted/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{payment.service}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{format(parseISO(payment.date), 'MMM d, yyyy')}</td>
                                        <td className="px-6 py-4 font-bold text-foreground">${payment.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                                {payment.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No upcoming payments found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Payments;
