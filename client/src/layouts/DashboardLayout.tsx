import { useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import AddSubscriptionModal from '../components/AddSubscriptionModal';
import { useSocket } from '../hooks/useSocket';

// Define the Subscription interface here or import it if shared
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

type DashboardContextType = {
    openAddSubscriptionModal: (subscription?: Subscription) => void;
};

const DashboardLayout = () => {
    useSocket(); // Initialize socket connection and listeners
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

    const openAddSubscriptionModal = (subscription?: Subscription) => {
        if (subscription) {
            setEditingSubscription(subscription);
        } else {
            setEditingSubscription(null);
        }
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingSubscription(null);
    };

    return (
        <div className="flex h-screen bg-background text-foreground font-body">
            <Toaster position="top-right" toastOptions={{
                style: {
                    background: '#1F2937',
                    color: '#fff',
                },
            }} />
            <Sidebar onAddSubscription={() => openAddSubscriptionModal()} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-y-auto p-8 bg-background">
                    <Outlet context={{ openAddSubscriptionModal } satisfies DashboardContextType} />
                </main>
            </div>

            <AddSubscriptionModal
                isOpen={isAddModalOpen}
                onClose={handleCloseModal}
                initialData={editingSubscription}
                onSuccess={() => {
                    // Triggers handled via Socket events
                }}
            />
        </div>
    );
};

export function useDashboard() {
    return useOutletContext<DashboardContextType>();
}

export default DashboardLayout;
