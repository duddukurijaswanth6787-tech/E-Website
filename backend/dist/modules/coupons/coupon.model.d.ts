import mongoose, { Document } from 'mongoose';
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
export declare const Coupon: mongoose.Model<ICoupon, {}, {}, {}, mongoose.Document<unknown, {}, ICoupon, {}, mongoose.DefaultSchemaOptions> & ICoupon & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICoupon>;
