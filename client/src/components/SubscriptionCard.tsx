import { Pencil, Trash2, Calendar, IndianRupee, Activity, PauseCircle, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

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

interface SubscriptionCardProps {
    subscription: Subscription;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
}

const statusColors = {
    Active: 'text-green-500 bg-green-500/10',
    Paused: 'text-yellow-500 bg-yellow-500/10',
    Cancelled: 'text-red-500 bg-red-500/10',
};

const statusIcons = {
    Active: Activity,
    Paused: PauseCircle,
    Cancelled: XCircle,
};

const SubscriptionCard = ({ subscription, onEdit, onDelete }: SubscriptionCardProps) => {
    const StatusIcon = statusIcons[subscription.status];

    return (
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-xl font-bold text-primary">
                        {subscription.logo ? (
                            <img src={subscription.logo} alt={subscription.name} className="h-8 w-8 object-contain" />
                        ) : (
                            subscription.name.charAt(0)
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-foreground">{subscription.name}</h3>
                        <span className="text-sm text-muted-foreground">{subscription.category}</span>
                    </div>
                </div>
                <div className={cn('flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-medium', statusColors[subscription.status])}>
                    <StatusIcon size={12} />
                    {subscription.status}
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <div className="mt-1 flex items-center gap-1 font-semibold text-foreground">
                        <IndianRupee size={14} className="text-muted-foreground" />
                        {subscription.amount}
                        <span className="text-xs text-muted-foreground">/{subscription.billingCycle === 'Monthly' ? 'mo' : 'yr'}</span>
                    </div>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground">Next Renewal</p>
                    <div className="mt-1 flex items-center gap-1 font-semibold text-foreground">
                        <Calendar size={14} className="text-muted-foreground" />
                        {format(new Date(subscription.nextRenewalDate), 'MMM dd, yyyy')}
                    </div>
                </div>
            </div>

            <div className="mt-6 flex gap-2">
                <button
                    onClick={() => onEdit(subscription._id)}
                    className="flex-1 rounded-md border border-input bg-transparent py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                    <div className="flex items-center justify-center gap-2">
                        <Pencil size={14} />
                        Edit
                    </div>
                </button>
                <button
                    onClick={() => onDelete(subscription._id)}
                    className="flex-1 rounded-md border border-input bg-transparent py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                    <div className="flex items-center justify-center gap-2">
                        <Trash2 size={14} />
                        Delete
                    </div>
                </button>
            </div>
        </div>
    );
};

export default SubscriptionCard;
