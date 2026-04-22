import mongoose, { Document } from 'mongoose';
export interface IReview extends Document {
    product: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    order?: mongoose.Types.ObjectId;
    rating: number;
    title?: string;
    body: string;
    images: string[];
    status: string;
    isFeatured: boolean;
    adminNote?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Review: mongoose.Model<IReview, {}, {}, {}, mongoose.Document<unknown, {}, IReview, {}, mongoose.DefaultSchemaOptions> & IReview & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IReview>;
