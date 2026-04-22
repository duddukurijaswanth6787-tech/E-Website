import mongoose, { Document } from 'mongoose';
export interface IWishlist extends Document {
    user: mongoose.Types.ObjectId;
    items: Array<{
        product: mongoose.Types.ObjectId;
        addedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Wishlist: mongoose.Model<IWishlist, {}, {}, {}, mongoose.Document<unknown, {}, IWishlist, {}, mongoose.DefaultSchemaOptions> & IWishlist & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IWishlist>;
