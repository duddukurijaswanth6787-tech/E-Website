import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  type: 'page_view' | 'add_to_cart' | 'checkout_start' | 'checkout_complete' | 'purchase' | 'inquiry' | 'search' | 'click' | 'scroll' | 'hover';
  user?: mongoose.Types.ObjectId;
  tenantId?: string;
  guestId?: string;
  path: string;
  referrer?: string;
  metadata?: {
    x?: number;
    y?: number;
    scrollDepth?: number;
    elementId?: string;
    productId?: string;
    orderId?: string;
    intensity?: number;
    [key: string]: any;
  };
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  device?: {
    browser?: string;
    os?: string;
    isMobile?: boolean;
  };
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>({
  type: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  guestId: { type: String, index: true },
  path: { type: String, required: true },
  referrer: String,
  metadata: Schema.Types.Mixed,
  utm: {
    source: String,
    medium: String,
    campaign: String
  },
  device: {
    browser: String,
    os: String,
    isMobile: Boolean
  },
  createdAt: { type: Date, default: Date.now }
});

// Retention optimization: Index for common aggregation ranges
EventSchema.index({ type: 1, createdAt: -1 });
EventSchema.index({ path: 1, createdAt: -1 });
EventSchema.index({ 'utm.source': 1, createdAt: -1 });

// TTL Index for automatic data retention (90 days)
EventSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
