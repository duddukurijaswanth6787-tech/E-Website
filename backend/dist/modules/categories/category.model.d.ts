import mongoose, { Document } from 'mongoose';
export interface ICategory extends Document {
    name: string;
    slug: string;
    description?: string;
    parent?: mongoose.Types.ObjectId;
    metadata?: {
        fabric?: string;
        origin?: string;
        weaveType?: 'handloom' | 'powerloom' | 'mixed' | 'other';
        occasions?: string[];
    };
    banner?: string;
    icon?: string;
    order: number;
    isActive: boolean;
    seo?: {
        title?: string;
        description?: string;
        keywords?: string[];
    };
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Category: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory, {}, mongoose.DefaultSchemaOptions> & ICategory & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ICategory>;
