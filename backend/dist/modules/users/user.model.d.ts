import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    mobile?: string;
    passwordHash: string;
    isEmailVerified: boolean;
    isMobileVerified: boolean;
    isBlocked: boolean;
    blockedReason?: string;
    role: string;
    avatar?: string;
    refreshTokens: string[];
    lastLoginAt?: Date;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
