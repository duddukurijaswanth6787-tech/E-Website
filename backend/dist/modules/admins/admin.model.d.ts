import mongoose, { Document } from 'mongoose';
export interface IAdmin extends Document {
    name: string;
    email: string;
    passwordHash: string;
    role: string;
    permissions: string[];
    isActive: boolean;
    avatar?: string;
    refreshTokens: string[];
    lastLoginAt?: Date;
    lastLoginIp?: string;
    createdBy?: mongoose.Types.ObjectId;
    updatedBy?: mongoose.Types.ObjectId;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Admin: mongoose.Model<IAdmin, {}, {}, {}, mongoose.Document<unknown, {}, IAdmin, {}, mongoose.DefaultSchemaOptions> & IAdmin & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAdmin>;
