import mongoose, { Document } from 'mongoose';
export interface IBanner extends Document {
    title: string;
    subtitle?: string;
    image: string;
    mobileImage?: string;
    link?: string;
    ctaText?: string;
    section: string;
    order: number;
    isActive: boolean;
    startDate?: Date;
    endDate?: Date;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Banner: mongoose.Model<IBanner, {}, {}, {}, mongoose.Document<unknown, {}, IBanner, {}, mongoose.DefaultSchemaOptions> & IBanner & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IBanner>;
