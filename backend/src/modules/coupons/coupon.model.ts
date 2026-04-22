import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupon extends Document {
  code: string;
  description?: string;
  type: string;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  maxUses?: number;
  usedCount: number;
  perUserLimit: number;
  validFrom: Date;
  validTo: Date;
  isActive: boolean;
  applicableProducts: mongoose.Types.ObjectId[];
  applicableCategories: mongoose.Types.ObjectId[];
  usedBy: mongoose.Types.ObjectId[];
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CouponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },
    type: { type: String, enum: ['percentage', 'flat'], required: true },
    value: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number },
    maxUses: { type: Number },
    usedCount: { type: Number, default: 0 },
    perUserLimit: { type: Number, default: 1 },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    applicableProducts: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    applicableCategories: [{ type: Schema.Types.ObjectId, ref: 'Category' }],
    usedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true },
);

CouponSchema.index({ isActive: 1, validFrom: 1, validTo: 1 });

export const Coupon = mongoose.model<ICoupon>('Coupon', CouponSchema);
