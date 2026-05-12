import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  variantId?: string;
  name: string;
  image: string;
  sku: string;
  quantity: number;
  price: number;
  total: number;
}

export interface IOrderTimeline {
  status: string;
  note?: string;
  updatedBy?: string;
  updatedAt: Date;
}

export interface IPaymentLog {
  status: string;
  message: string;
  timestamp: Date;
  source: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  user: mongoose.Types.ObjectId;
  items: IOrderItem[];
  address: {
    name: string;
    mobile: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    landmark?: string;
    altMobile?: string;
    deliveryInstructions?: string;
  };
  coupon?: mongoose.Types.ObjectId;
  couponCode?: string;
  couponDiscount: number;
  subtotal: number;
  shippingCharge: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentId?: mongoose.Types.ObjectId;
  razorpayOrderId?: string;
  razorpay_order_id?: string;
  razorpayPaymentId?: string;
  razorpay_payment_id?: string;
  paidAt?: Date;
  failureReason?: string;
  paymentLogs: IPaymentLog[];
  status: string;
  timeline: IOrderTimeline[];
  trackingNumber?: string;
  trackingUrl?: string;
  note?: string;
  invoiceUrl?: string;
  cancelledAt?: Date;
  cancellationReason?: string;
  refundedAt?: Date;
  refundAmount?: number;
  deletedAt?: Date;
  reconciliationLocked?: boolean;
  reconciliationLockedAt?: Date;
  reconciliationWorkerId?: string;
  reconciliationInventoryReduced?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: String },
  name: { type: String, required: true },
  image: { type: String },
  sku: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  total: { type: Number, required: true },
});

const TimelineSchema = new Schema<IOrderTimeline>({
  status: { type: String, required: true },
  note: { type: String },
  updatedBy: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

const PaymentLogSchema = new Schema<IPaymentLog>({
  status: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  source: { type: String, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    address: {
      name: { type: String, required: true, trim: true },
      mobile: { 
        type: String, 
        required: true, 
        trim: true,
        match: [/^\d{10}$/, 'Invalid 10-digit mobile number']
      },
      line1: { type: String, required: true, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { 
        type: String, 
        required: true, 
        trim: true,
        match: [/^\d{6}$/, 'Invalid 6-digit pincode']
      },
      country: { type: String, default: 'India', trim: true },
      landmark: { type: String, trim: true },
      altMobile: { 
        type: String, 
        trim: true,
        match: [/^\d{10}$/, 'Invalid 10-digit alternative mobile number']
      },
      deliveryInstructions: { type: String, trim: true },
    },
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['razorpay', 'cod'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'], default: 'pending' },
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    razorpayOrderId: { type: String },
    razorpay_order_id: { type: String },
    razorpayPaymentId: { type: String },
    razorpay_payment_id: { type: String },
    paidAt: { type: Date },
    failureReason: { type: String },
    paymentLogs: { type: [PaymentLogSchema], default: [] },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },
    timeline: [TimelineSchema],
    trackingNumber: { type: String },
    trackingUrl: { type: String },
    note: { type: String },
    invoiceUrl: { type: String },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    refundedAt: { type: Date },
    refundAmount: { type: Number },
    deletedAt: { type: Date },
    reconciliationLocked: { type: Boolean, default: false },
    reconciliationLockedAt: { type: Date },
    reconciliationWorkerId: { type: String },
    reconciliationInventoryReduced: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// High-Concurrency Indexing targets exactly following explicit instructions
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ paymentMethod: 1 });
OrderSchema.index({ razorpay_order_id: 1 });
OrderSchema.index({ razorpay_payment_id: 1 });
OrderSchema.index({ razorpayOrderId: 1 });
OrderSchema.index({ razorpayPaymentId: 1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
