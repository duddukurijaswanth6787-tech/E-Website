import mongoose, { Schema, Document } from 'mongoose';

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

const CartItemSchema = new Schema<ICartItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String },
});

const CartSchema = new Schema<ICart>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    sessionId: { type: String, index: true },
    items: [CartItemSchema],
    coupon: { type: Schema.Types.ObjectId, ref: 'Coupon' },
    couponDiscount: { type: Number, default: 0 },
    subtotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    expiresAt: { type: Date },
  },
  { timestamps: true },
);

CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Cart = mongoose.model<ICart>('Cart', CartSchema);
