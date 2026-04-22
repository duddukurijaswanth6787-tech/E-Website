import mongoose, { Document } from 'mongoose';
export interface IAddress extends Document {
    user: mongoose.Types.ObjectId;
    type: string;
    name: string;
    mobile: string;
    line1: string;
    line2?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    isDefault: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Address: mongoose.Model<IAddress, {}, {}, {}, mongoose.Document<unknown, {}, IAddress, {}, mongoose.DefaultSchemaOptions> & IAddress & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAddress>;
