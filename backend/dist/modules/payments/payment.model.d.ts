import mongoose, { Document } from 'mongoose';
export interface IPayment extends Document {
    order: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    provider: string;
    method: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    amount: number;
    currency: string;
    status: string;
    failureReason?: string;
    refundId?: string;
    refundAmount?: number;
    refundStatus?: string;
    refundedAt?: Date;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Payment: mongoose.Model<IPayment, {}, {}, {}, mongoose.Document<unknown, {}, IPayment, {}, mongoose.DefaultSchemaOptions> & IPayment & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IPayment>;
