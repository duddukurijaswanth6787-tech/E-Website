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
    weavingTechnique?: string;
    pallu?: string;
    speciality?: string;
    handloomCraftsmanship?: string;
    designHighlight?: string;
    stylingTips?: string;
    color?: string;
    subcategory?: mongoose.Types.ObjectId;
    occasions?: string[];
    discountType?: 'percentage' | 'flat';
    discountValue?: number;
    taxPercent?: number;
    codAvailable?: boolean;
    stockStatus?: 'in_stock' | 'out_of_stock' | 'preorder';
    attributes?: {
        sareeLength?: string;
        sareeWidth?: string;
        blouseLength?: string;
        blouseWidth?: string;
        weight?: string;
    };
    isBestSeller?: boolean;
    showOnHomepage?: boolean;
    sortOrder?: number;
    returnable?: boolean;
    returnWindowDays?: number;
    exchangeAvailable?: boolean;
    cancellationAllowed?: boolean;
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
