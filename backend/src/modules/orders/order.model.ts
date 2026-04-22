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

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    address: {
      name: { type: String, required: true },
      mobile: { type: String, required: true },
      line1: { type: String, required: true },
      line2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, default: 'India' },
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
  },
  { timestamps: true },
);

OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
