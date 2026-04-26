import mongoose, { Schema, Document } from 'mongoose';

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

const SettingSchema = new Schema<ISetting>(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: Schema.Types.Mixed },
    group: {
      type: String,
      enum: ['general', 'branding', 'seo', 'social', 'payment', 'shipping', 'contact', 'support', 'email', 'security'],
      required: true,
    },
    type: { type: String, enum: ['string', 'number', 'boolean', 'json', 'array'], default: 'string' },
    label: { type: String, required: true },
    description: { type: String },
    isPublic: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true },
);

SettingSchema.index({ group: 1 });

export const Setting = mongoose.model<ISetting>('Setting', SettingSchema);
