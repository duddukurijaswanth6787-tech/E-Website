import mongoose, { Document } from 'mongoose';
export interface ISetting extends Document {
    key: string;
    value: unknown;
    group: string;
    type: string;
    label: string;
    description?: string;
    isPublic: boolean;
    updatedBy?: mongoose.Types.ObjectId;
    updatedAt: Date;
}
export declare const Setting: mongoose.Model<ISetting, {}, {}, {}, mongoose.Document<unknown, {}, ISetting, {}, mongoose.DefaultSchemaOptions> & ISetting & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISetting>;
