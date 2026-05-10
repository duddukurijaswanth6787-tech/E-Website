import mongoose, { Schema, Document } from 'mongoose';

export interface IBoutiqueOwner extends Document {
  ownerName: string;
  email: string;
  mobile: string;
  passwordHash: string;
  isEmailVerified: boolean;
  isApproved: boolean;
  isActive: boolean;
  refreshTokens: string[];
  lastLoginAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BoutiqueOwnerSchema = new Schema<IBoutiqueOwner>(
  {
    ownerName: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    mobile: { type: String, required: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    isEmailVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    refreshTokens: [{ type: String, select: false }],
    lastLoginAt: { type: Date },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        delete ret.passwordHash;
        delete ret.refreshTokens;
        return ret;
      },
    },
  }
);

BoutiqueOwnerSchema.index({ deletedAt: 1 });

export const BoutiqueOwner = mongoose.model<IBoutiqueOwner>('BoutiqueOwner', BoutiqueOwnerSchema);
