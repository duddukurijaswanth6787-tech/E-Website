import mongoose, { Schema, Document } from 'mongoose';

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

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    mobile: { 
      type: String, 
      sparse: true, 
      trim: true,
      match: [/^\d{10}$/, 'Invalid 10-digit mobile number']
    },
    passwordHash: { type: String, required: true, select: false },
    isEmailVerified: { type: Boolean, default: false },
    isMobileVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    blockedReason: { type: String },
    role: { type: String, default: 'customer' },
    avatar: { type: String },
    refreshTokens: [{ type: String, select: false }],
    lastLoginAt: { type: Date },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, transform: (_doc, ret: any) => { delete ret.passwordHash; delete ret.refreshTokens; return ret; } },
  },
);

UserSchema.index({ deletedAt: 1 });

export const User = mongoose.model<IUser>('User', UserSchema);
