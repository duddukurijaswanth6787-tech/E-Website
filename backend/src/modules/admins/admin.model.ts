import mongoose, { Schema, Document } from 'mongoose';

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

const AdminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, required: true },
    permissions: [{ type: String }],
    isActive: { type: Boolean, default: true },
    avatar: { type: String },
    refreshTokens: [{ type: String, select: false }],
    lastLoginAt: { type: Date },
    lastLoginIp: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete ret.passwordHash;
        delete ret.refreshTokens;
        return ret;
      },
    },
  },
);


export const Admin = mongoose.model<IAdmin>('Admin', AdminSchema);
