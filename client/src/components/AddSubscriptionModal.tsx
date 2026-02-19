import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Loader2 } from 'lucide-react';
import api from '../lib/axios';

const schema = z.object({
    name: z.string().min(1, 'Name is required'),
    category: z.string().min(1, 'Category is required'),
    amount: z.number().min(0, 'Amount must be positive'),
    billingCycle: z.enum(['Monthly', 'Yearly']),
    nextRenewalDate: z.string().min(1, 'Next renewal date is required'),
    paymentMethod: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface Subscription extends FormData {
    _id: string;
}

interface AddSubscriptionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialData?: Subscription | null;
}

const AddSubscriptionModal = ({ isOpen, onClose, onSuccess, initialData }: AddSubscriptionModalProps) => {
    const [error, setError] = useState('');
    const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            billingCycle: 'Monthly',
            amount: 0,
        }
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    category: initialData.category,
                    amount: initialData.amount,
                    billingCycle: initialData.billingCycle,
                    nextRenewalDate: new Date(initialData.nextRenewalDate).toISOString().split('T')[0],
                    paymentMethod: initialData.paymentMethod
                });
            } else {
                reset({
                    billingCycle: 'Monthly',
                    amount: 0,
                    name: '',
                    category: '',
                    nextRenewalDate: ''
                });
            }
        }
    }, [isOpen, initialData, reset]);

    const onSubmit = async (data: FormData) => {
        try {
            setError('');
            if (initialData) {
                await api.put(`/subscriptions/${initialData._id}`, data);
            } else {
                await api.post('/subscriptions', data);
            }
            reset();
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save subscription');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">{initialData ? 'Edit Subscription' : 'Add Subscription'}</h2>
                    <button onClick={onClose} className="rounded-full p-1 hover:bg-muted text-muted-foreground">
                        <X size={20} />
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground">Service Name</label>
                        <input
                            {...register('name')}
                            type="text"
                            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                            placeholder="e.g. Netflix"
                        />
                        {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground">Category</label>
                            <select
                                {...register('category')}
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                            >
                                <option value="">Select...</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Productivity">Productivity</option>
                                <option value="Utilities">Utilities</option>
                                <option value="Health">Health</option>
                                <option value="Marketing">Marketing</option>
                                <option value="DevOps">DevOps</option>
                                <option value="Sales">Sales</option>
                                <option value="Other">Other</option>
                            </select>
                            {errors.category && <p className="mt-1 text-xs text-destructive">{errors.category.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground">Amount (₹)</label>
                            <div className="relative mt-1">
                                <span className="absolute left-3 top-2 text-muted-foreground">₹</span>
                                <input
                                    {...register('amount', { valueAsNumber: true })}
                                    type="number"
                                    step="0.01"
                                    className="block w-full rounded-md border border-input bg-background pl-7 pr-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                                />
                            </div>
                            {errors.amount && <p className="mt-1 text-xs text-destructive">{errors.amount.message}</p>}
                        </div>
                    </div>

                    {/* Popular Services Chips */}
                    {!initialData && (
                        <div className="space-y-2 mb-4">
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Popular Services</label>
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { name: 'Netflix', category: 'Entertainment', amount: 649, billing: 'Monthly' },
                                    { name: 'Spotify', category: 'Entertainment', amount: 119, billing: 'Monthly' },
                                    { name: 'YouTube Premium', category: 'Entertainment', amount: 129, billing: 'Monthly' },
                                    { name: 'Amazon Prime', category: 'Entertainment', amount: 299, billing: 'Monthly' },
                                    { name: 'ChatGPT Plus', category: 'Productivity', amount: 1999, billing: 'Monthly' },
                                    { name: 'Xbox Game Pass', category: 'Entertainment', amount: 549, billing: 'Monthly' }
                                ].map((service) => (
                                    <button
                                        key={service.name}
                                        type="button"
                                        onClick={() => {
                                            reset({
                                                name: service.name,
                                                category: service.category,
                                                amount: service.amount,
                                                billingCycle: service.billing as 'Monthly' | 'Yearly',
                                                nextRenewalDate: new Date().toISOString().split('T')[0]
                                            });
                                        }}
                                        className="text-xs px-3 py-1.5 rounded-full bg-secondary/50 hover:bg-primary/20 hover:text-primary border border-transparent hover:border-primary/30 transition-all duration-300 transform hover:scale-105"
                                    >
                                        {service.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground">Billing Cycle</label>
                            <select
                                {...register('billingCycle')}
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                            >
                                <option value="Monthly">Monthly</option>
                                <option value="Yearly">Yearly</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground">Next Renewal</label>
                            <input
                                {...register('nextRenewalDate')}
                                type="date"
                                min={new Date().toISOString().split('T')[0]}
                                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary text-foreground"
                            />
                            {errors.nextRenewalDate && <p className="mt-1 text-xs text-destructive">{errors.nextRenewalDate.message}</p>}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="mr-2 animate-spin" />
                                {initialData ? 'Saving...' : 'Adding...'}
                            </>
                        ) : (
                            initialData ? 'Save Changes' : 'Add Subscription'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddSubscriptionModal;
