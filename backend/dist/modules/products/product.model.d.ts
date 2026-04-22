import mongoose, { Document } from 'mongoose';
export interface IProductVariant {
    _id?: mongoose.Types.ObjectId;
    color?: string;
    colorHex?: string;
    size?: string;
    price: number;
    comparePrice?: number;
    stock: number;
    sku: string;
    images: string[];
    isActive: boolean;
}
export interface IProduct extends Document {
    name: string;
    slug: string;
    shortDescription?: string;
    description: string;
    category: mongoose.Types.ObjectId;
    collections: mongoose.Types.ObjectId[];
    images: string[];
    price: number;
    comparePrice?: number;
    stock: number;
    sku: string;
    hasVariants: boolean;
    variants: IProductVariant[];
    fabric?: string;
    careInstructions?: string;
    blouseDetails?: string;
    stylingTips?: string;
    tags: string[];
    isFeatured: boolean;
    isTrending: boolean;
    isNewArrival: boolean;
    lowStockThreshold: number;
    status: string;
    seo?: {
        title?: string;
        description?: string;
        keywords?: string[];
        ogImage?: string;
    };
    ratings: {
        average: number;
        count: number;
    };
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Product: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}, mongoose.DefaultSchemaOptions> & IProduct & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProduct>;
