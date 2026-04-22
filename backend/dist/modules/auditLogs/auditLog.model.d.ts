import mongoose, { Document } from 'mongoose';
export interface IAuditLog extends Document {
    admin: mongoose.Types.ObjectId;
    adminEmail: string;
    action: string;
    module: string;
    targetId?: string;
    description: string;
    changes?: {
        before?: Record<string, unknown>;
        after?: Record<string, unknown>;
    };
    ip?: string;
    userAgent?: string;
    createdAt: Date;
}
export declare const AuditLog: mongoose.Model<IAuditLog, {}, {}, {}, mongoose.Document<unknown, {}, IAuditLog, {}, mongoose.DefaultSchemaOptions> & IAuditLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAuditLog>;
