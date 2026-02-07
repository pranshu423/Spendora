import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import api from '../lib/axios';
import SubscriptionCard from '../components/SubscriptionCard';
import { useDashboard } from '../layouts/DashboardLayout';

interface Subscription {
    _id: string;
    name: string;
    category: string;
    amount: number;
    billingCycle: 'Monthly' | 'Yearly';
    nextRenewalDate: string;
    status: 'Active' | 'Paused' | 'Cancelled';
    logo?: string;
    paymentMethod?: string;
}

const Subscriptions = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const { openAddSubscriptionModal } = useDashboard();

    useEffect(() => {
        fetchSubscriptions();

        const handleUpdate = () => fetchSubscriptions();

        // Listen for all CRUD events dispatched by useSocket
        window.addEventListener('subscription_updated', handleUpdate);
        window.addEventListener('subscription_added', handleUpdate);
        window.addEventListener('subscription_deleted', handleUpdate);

        return () => {
            window.removeEventListener('subscription_updated', handleUpdate);
            window.removeEventListener('subscription_added', handleUpdate);
            window.removeEventListener('subscription_deleted', handleUpdate);
        };
    }, []);

    const fetchSubscriptions = async () => {
        try {
            // Don't set loading to true on updates to avoid flashing, only initial load if needed
            // But if list changes significantly, maybe. Let's keep it smooth.
            const { data } = await api.get('/subscriptions');
            setSubscriptions(data);
        } catch (error) {
            console.error('Failed to fetch subscriptions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this subscription?')) {
            try {
                await api.delete(`/subscriptions/${id}`);
                // Optimistic update
                setSubscriptions((prev) => prev.filter((sub) => sub._id !== id));
            } catch (error) {
                console.error('Failed to delete subscription:', error);
            }
        }
    };

    const handleEdit = (id: string) => {
        const subToEdit = subscriptions.find(s => s._id === id);
        if (subToEdit) {
            openAddSubscriptionModal(subToEdit);
        }
    };

    if (loading && subscriptions.length === 0) return <div className="p-8 text-center text-muted-foreground">Loading subscriptions...</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-foreground">Subscriptions</h1>
                    <p className="text-muted-foreground mt-1">Manage all your recurring payments</p>
                </div>
                <button
                    onClick={() => openAddSubscriptionModal()}
                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all hover:scale-105"
                >
                    <Plus size={16} />
                    Add Subscription
                </button>
            </div>

            {subscriptions.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-border text-center bg-card/50">
                    <h3 className="text-lg font-medium text-foreground">No subscriptions yet</h3>
                    <p className="mt-1 text-sm text-muted-foreground mb-4">Add your first subscription to get started.</p>
                    <button
                        onClick={() => openAddSubscriptionModal()}
                        className="text-primary hover:underline font-medium"
                    >
                        Add one now
                    </button>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {subscriptions.map((subscription) => (
                        <SubscriptionCard
                            key={subscription._id}
                            subscription={subscription}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Subscriptions;
