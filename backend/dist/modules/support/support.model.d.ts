import mongoose, { Document } from 'mongoose';
export interface ISupportTicket extends Document {
    user?: mongoose.Types.ObjectId;
    name: string;
    email: string;
    mobile?: string;
    subject: string;
    message: string;
    status: string;
    adminNotes?: string;
    assignedTo?: mongoose.Types.ObjectId;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const SupportTicket: mongoose.Model<ISupportTicket, {}, {}, {}, mongoose.Document<unknown, {}, ISupportTicket, {}, mongoose.DefaultSchemaOptions> & ISupportTicket & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ISupportTicket>;
