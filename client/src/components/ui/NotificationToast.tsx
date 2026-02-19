import { Toaster, toast, ToastBar } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';

const NotificationToast = () => {
    useEffect(() => {
        const handleSubscriptionAdded = (e: any) => {
            const prefs = JSON.parse(localStorage.getItem('spendora_prefs') || '{"push":true}');
            if (prefs.push) toast.success(`Subscription added: ${e.detail.name}`);
        };

        const handleSubscriptionUpdated = (e: any) => {
            // Optional: only toast if significant change? 
            // user said: "if user edits his name... it should be updated".
            // For subscription updates, maybe we don't spam toasts unless status changes.
            // But let's keep it simple for now or skip to avoid noise.
            // toast.success(`Subscription updated: ${e.detail.name}`);
        };

        const handlePaymentProcessed = (e: any) => {
            const prefs = JSON.parse(localStorage.getItem('spendora_prefs') || '{"push":true}');
            if (prefs.push) toast.success(`Payment processed: ₹${e.detail.amount} for ${e.detail.subscription}`);
        };

        const handleRenewalNotification = (e: any) => {
            // If we had a specific event for upcoming renewal, we'd handle it here.
            // The backend cron emits 'payment_processed' when it renews.
        };

        window.addEventListener('subscription_added', handleSubscriptionAdded);
        window.addEventListener('payment_processed', handlePaymentProcessed);

        return () => {
            window.removeEventListener('subscription_added', handleSubscriptionAdded);
            window.removeEventListener('payment_processed', handlePaymentProcessed);
        };
    }, []);

    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: 'transparent',
                    boxShadow: 'none',
                    padding: 0,
                    margin: 0,
                },
            }}
        >
            {(t) => (
                <ToastBar toast={t}>
                    {({ icon, message }) => (
                        <motion.div
                            initial={{ opacity: 0, x: 50, scale: 0.9 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            className="relative flex items-center w-80 p-4 mb-3 rounded-2xl bg-card border border-primary/20 shadow-lg shadow-primary/10 overflow-hidden"
                        >
                            {/* Neon Glow Line */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-secondary" />

                            <div className="flex-1 min-w-0 ml-2">
                                <div className="text-sm font-medium text-white font-heading">
                                    New Notification
                                </div>
                                <div className="mt-1 text-xs text-gray-400 font-body truncate">
                                    {message}
                                </div>
                            </div>

                            <button
                                onClick={() => toast.dismiss(t.id)}
                                className="ml-4 text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </motion.div>
                    )}
                </ToastBar>
            )}
        </Toaster>
    );
};

export default NotificationToast;
