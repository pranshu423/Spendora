import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import api from '../lib/axios';
import { Loader2 } from 'lucide-react';

interface Payment {
    _id: string;
    subscription: string; // ID
    amount: number;
    currency: string;
    date: string;
    status: 'Completed' | 'Failed' | 'Pending';
}

interface Subscription {
    _id: string;
    name: string;
    category: string;
    amount: number;
    nextRenewalDate: string;
    status: string;
}

const Payments = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [paymentsRes, subsRes] = await Promise.all([
                api.get('/payments'),
                api.get('/subscriptions')
            ]);
            setPayments(paymentsRes.data);
            setSubscriptions(subsRes.data);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const handleUpdate = () => fetchData();
        window.addEventListener('payment_processed', handleUpdate);
        window.addEventListener('subscription_updated', handleUpdate);

        return () => {
            window.removeEventListener('payment_processed', handleUpdate);
            window.removeEventListener('subscription_updated', handleUpdate);
        };
    }, []);

    const getSubscriptionName = (subId: string) => {
        const sub = subscriptions.find(s => s._id === subId);
        return sub ? sub.name : 'Unknown Subscription';
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;

    // Upcoming Payments (from Subscriptions)
    const upcoming = subscriptions
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
        <div className="space-y-6 pb-10">
            <div>
                <h1 className="text-3xl font-bold font-heading text-white">Payments</h1>
                <p className="text-muted-foreground mt-1">Track your upcoming bills and payment history.</p>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {/* Upcoming Payments */}
                <div className="rounded-2xl border border-white/5 bg-card overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <h2 className="text-lg font-semibold text-white">Upcoming Payments</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase text-muted-foreground bg-black/20">
                                <tr>
                                    <th className="px-6 py-3">Service</th>
                                    <th className="px-6 py-3">Due Date</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {upcoming.length > 0 ? upcoming.map((payment) => (
                                    <tr key={payment.id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{payment.service}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{format(parseISO(payment.date), 'MMM d, yyyy')}</td>
                                        <td className="px-6 py-4 font-bold text-white">₹{payment.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
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

                {/* Transaction History */}
                <div className="rounded-2xl border border-white/5 bg-card overflow-hidden">
                    <div className="p-6 border-b border-white/5 bg-white/5">
                        <h2 className="text-lg font-semibold text-white">Transaction History</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase text-muted-foreground bg-black/20">
                                <tr>
                                    <th className="px-6 py-3">Service</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {payments.length > 0 ? payments.map((payment) => (
                                    <tr key={payment._id} className="group hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">{getSubscriptionName(payment.subscription)}</td>
                                        <td className="px-6 py-4 text-muted-foreground">{format(parseISO(payment.date), 'MMM d, yyyy, h:mm a')}</td>
                                        <td className="px-6 py-4 font-bold text-white">₹{payment.amount.toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${payment.status === 'Completed'
                                                    ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                                    : 'bg-red-500/10 text-red-500 border-red-500/20'
                                                }`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No transaction history found.</td>
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
