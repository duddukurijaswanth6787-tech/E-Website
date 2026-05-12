import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  order: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  provider: string;
  method: string;
  razorpayOrderId?: string;
  razorpay_order_id?: string;
  razorpayPaymentId?: string;
  razorpay_payment_id?: string;
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
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: { type: String, enum: ['razorpay', 'cod', 'manual'], required: true },
    method: { type: String },
    razorpayOrderId: { type: String },
    razorpay_order_id: { type: String },
    razorpayPaymentId: { type: String },
    razorpay_payment_id: { type: String },
    razorpaySignature: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending',
    },
    failureReason: { type: String },
    refundId: { type: String },
    refundAmount: { type: Number },
    refundStatus: { type: String },
    refundedAt: { type: Date },
    metadata: { type: Schema.Types.Mixed },
    notes: { type: String },
  },
  { timestamps: true },
);

PaymentSchema.index({ order: 1 });
PaymentSchema.index({ user: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ provider: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ razorpayPaymentId: 1 });
PaymentSchema.index({ razorpay_payment_id: 1 });
PaymentSchema.index({ razorpayOrderId: 1 });
PaymentSchema.index({ razorpay_order_id: 1 });

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
