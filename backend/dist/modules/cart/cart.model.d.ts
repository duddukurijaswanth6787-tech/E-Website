import mongoose, { Document } from 'mongoose';
export interface ICartItem {
    product: mongoose.Types.ObjectId;
    variantId?: string;
    quantity: number;
    price: number;
    name: string;
    image: string;
}
export interface ICart extends Document {
    user?: mongoose.Types.ObjectId;
    sessionId?: string;
    items: ICartItem[];
    coupon?: mongoose.Types.ObjectId;
    couponDiscount: number;
    subtotal: number;
    total: number;
    expiresAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Cart: mongoose.Model<ICart, {}, {}, {}, mongoose.Document<unknown, {}, ICart, {}, mongoose.DefaultSchemaOptions> & ICart & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICart>;
