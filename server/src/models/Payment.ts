import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
    user: mongoose.Schema.Types.ObjectId;
    subscription: mongoose.Schema.Types.ObjectId;
    amount: number;
    currency: string;
    date: Date;
    status: 'Completed' | 'Failed' | 'Pending';
}

const PaymentSchema: Schema = new Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
        amount: { type: Number, required: true },
        currency: { type: String, default: 'INR' },
        date: { type: Date, default: Date.now },
        status: { type: String, enum: ['Completed', 'Failed', 'Pending'], default: 'Completed' },
    },
    { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', PaymentSchema);
