import mongoose, { Document } from 'mongoose';
export interface IShippingRule extends Document {
    region: string;
    method: string;
    cost: number;
    minOrderValue?: number;
    isActive: boolean;
    notes?: string;
    createdBy: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
}
export declare const ShippingRule: mongoose.Model<IShippingRule, {}, {}, {}, mongoose.Document<unknown, {}, IShippingRule, {}, mongoose.DefaultSchemaOptions> & IShippingRule & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IShippingRule>;
