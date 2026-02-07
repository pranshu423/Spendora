import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
    user: mongoose.Schema.Types.ObjectId;
    name: string;
    category: string;
    amount: number;
    billingCycle: 'Monthly' | 'Yearly';
    nextRenewalDate: Date;
    status: 'Active' | 'Paused' | 'Cancelled';
    paymentMethod?: string;
    currency: string;
    logo?: string;
}

const SubscriptionSchema: Schema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
        name: { type: String, required: true },
        category: { type: String, required: true },
        amount: { type: Number, required: true },
        billingCycle: { type: String, required: true, enum: ['Monthly', 'Yearly'] },
        nextRenewalDate: { type: Date, required: true },
        status: { type: String, required: true, enum: ['Active', 'Paused', 'Cancelled'], default: 'Active' },
        paymentMethod: { type: String },
        currency: { type: String, default: 'USD' },
        logo: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
