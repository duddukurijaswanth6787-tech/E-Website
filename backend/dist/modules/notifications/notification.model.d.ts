import mongoose, { Document } from 'mongoose';
export interface INotification extends Document {
    user?: mongoose.Types.ObjectId;
    type: string;
    channel: string;
    title: string;
    body: string;
    isRead: boolean;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Notification: mongoose.Model<INotification, {}, {}, {}, mongoose.Document<unknown, {}, INotification, {}, mongoose.DefaultSchemaOptions> & INotification & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, INotification>;
