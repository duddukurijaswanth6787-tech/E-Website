import mongoose, { Document } from 'mongoose';
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
export declare const Order: mongoose.Model<IOrder, {}, {}, {}, mongoose.Document<unknown, {}, IOrder, {}, mongoose.DefaultSchemaOptions> & IOrder & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IOrder>;
