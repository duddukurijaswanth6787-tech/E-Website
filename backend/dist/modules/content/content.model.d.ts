import mongoose, { Document } from 'mongoose';
export interface IContentPage extends Document {
    slug: string;
    title: string;
    body: string;
    excerpt?: string;
    type: string;
    coverImage?: string;
    author?: string;
    tags: string[];
    isPublished: boolean;
    isFeatured: boolean;
    publishedAt?: Date;
    seo?: {
        title?: string;
        description?: string;
        keywords?: string[];
        ogImage?: string;
    };
    order: number;
    updatedBy?: mongoose.Types.ObjectId;
    createdBy?: mongoose.Types.ObjectId;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ContentPage: mongoose.Model<IContentPage, {}, {}, {}, mongoose.Document<unknown, {}, IContentPage, {}, mongoose.DefaultSchemaOptions> & IContentPage & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IContentPage>;
