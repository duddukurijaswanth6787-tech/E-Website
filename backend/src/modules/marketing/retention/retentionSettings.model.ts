import mongoose, { Schema, Document } from 'mongoose';

export interface IRetentionSettings extends Document {
  enableAutoDelete: boolean;
  globalRetentionDays: number;
  moduleSpecific: {
    wishlist: number;
    liveVisitors: number;
    recentOrders: number;
    socialProof: number;
    engagement: number;
  };
  lastCleanupAt?: Date;
  updatedBy: string;
}

const RetentionSettingsSchema: Schema = new Schema({
  enableAutoDelete: { type: Boolean, default: true },
  globalRetentionDays: { type: Number, default: 7 },
  moduleSpecific: {
    wishlist: { type: Number, default: 7 },
    liveVisitors: { type: Number, default: 1 },
    recentOrders: { type: Number, default: 15 },
    socialProof: { type: Number, default: 3 },
    engagement: { type: Number, default: 7 }
  },
  lastCleanupAt: { type: Date },
  updatedBy: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model<IRetentionSettings>('RetentionSettings', RetentionSettingsSchema);
