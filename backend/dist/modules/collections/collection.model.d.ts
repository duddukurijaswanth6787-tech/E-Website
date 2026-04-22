import mongoose, { Document } from 'mongoose';
export interface ICollection extends Document {
    name: string;
    slug: string;
    description?: string;
    type: string;
    banner?: string;
    mobileB?: string;
    products: mongoose.Types.ObjectId[];
    isActive: boolean;
    isFeatured: boolean;
    order: number;
    seo?: {
        title?: string;
        description?: string;
    };
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Collection: mongoose.Model<ICollection, {}, {}, {}, mongoose.Document<unknown, {}, ICollection, {}, mongoose.DefaultSchemaOptions> & ICollection & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICollection>;
