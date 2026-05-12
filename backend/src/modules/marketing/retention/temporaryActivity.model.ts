import mongoose, { Schema, Document } from 'mongoose';

export interface ITemporaryActivity extends Document {
  activityType: 'order' | 'view' | 'wishlist' | 'engagement' | 'visitor';
  title: string;
  customerDisplayName: string;
  location: string;
  metadata?: any;
  createdAt: Date;
  expiresAt: Date;
  retentionDays: number;
  module: string;
  autoDeleteEnabled: boolean;
}

const TemporaryActivitySchema: Schema = new Schema({
  activityType: { 
    type: String, 
    required: true, 
    enum: ['order', 'view', 'wishlist', 'engagement', 'visitor'] 
  },
  title: { type: String, required: true },
  customerDisplayName: { type: String, required: true },
  location: { type: String, default: 'Hyderabad, India' },
  metadata: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, required: true },
  retentionDays: { type: Number, required: true },
  module: { type: String, required: true },
  autoDeleteEnabled: { type: Boolean, default: true }
}, {
  timestamps: true
});

// TTL Index for automatic MongoDB deletion
TemporaryActivitySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<ITemporaryActivity>('TemporaryActivity', TemporaryActivitySchema);
