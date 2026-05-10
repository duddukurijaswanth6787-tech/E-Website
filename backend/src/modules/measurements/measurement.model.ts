import mongoose, { Schema, Document } from 'mongoose';

export interface IMeasurementProfile extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  category: string;
  measurements: Record<string, number | string>;
  notes: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MeasurementProfileSchema = new Schema<IMeasurementProfile>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    measurements: { type: Map, of: Schema.Types.Mixed, default: {} },
    notes: { type: String, default: '' },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Ensure only one default profile per user per category (optional, but good for UX)
// MeasurementProfileSchema.index({ userId: 1, category: 1, isDefault: 1 }, { unique: true, partialFilterExpression: { isDefault: true } });

export const MeasurementProfile = mongoose.model<IMeasurementProfile>('MeasurementProfile', MeasurementProfileSchema);
