import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentReconciliationLog extends Document {
  orderId: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  reconciliationType: 'auto_repair_capture' | 'confirm_failure' | 'external_refund' | 'dead_letter_drop';
  previousState: string;
  newState: string;
  repairAction: string;
  success: boolean;
  error?: string;
  processedAt: Date;
  workerId: string;
  rawGatewayResponse?: string;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentReconciliationLogSchema = new Schema<IPaymentReconciliationLog>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    razorpayOrderId: { type: String, required: true },
    reconciliationType: { 
      type: String, 
      required: true,
      enum: ['auto_repair_capture', 'confirm_failure', 'external_refund', 'dead_letter_drop']
    },
    previousState: { type: String, required: true },
    newState: { type: String, required: true },
    repairAction: { type: String, required: true },
    success: { type: Boolean, required: true },
    error: { type: String },
    processedAt: { type: Date, default: Date.now },
    workerId: { type: String, required: true },
    rawGatewayResponse: { type: String },
    retryCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// High concurrency query optimization indices supporting dashboard lookup matrices
PaymentReconciliationLogSchema.index({ orderId: 1 });
PaymentReconciliationLogSchema.index({ razorpayOrderId: 1 });
PaymentReconciliationLogSchema.index({ success: 1 });
PaymentReconciliationLogSchema.index({ createdAt: -1 });

export const PaymentReconciliationLog = mongoose.model<IPaymentReconciliationLog>(
  'PaymentReconciliationLog', 
  PaymentReconciliationLogSchema
);
