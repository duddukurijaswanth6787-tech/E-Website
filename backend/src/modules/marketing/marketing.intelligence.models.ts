import { Schema, model, Document } from 'mongoose';

// M-9: Influencer & Affiliate
export interface IInfluencer extends Document {
  tenantId: string;
  name: string;
  handle: string;
  platform: 'Instagram' | 'YouTube' | 'TikTok' | 'Other';
  referralCode: string;
  commissionRate: number;
  status: 'pending' | 'active' | 'suspended';
  onboardedAt: Date;
  analytics: {
    totalClicks: number;
    totalSales: number;
    totalRevenue: number;
    totalCommission: number;
  };
}

const InfluencerSchema = new Schema<IInfluencer>({
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
  handle: { type: String, required: true },
  platform: { type: String, enum: ['Instagram', 'YouTube', 'TikTok', 'Other'], required: true },
  referralCode: { type: String, required: true, unique: true },
  commissionRate: { type: Number, default: 10 },
  status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
  onboardedAt: { type: Date, default: Date.now },
  analytics: {
    totalClicks: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalCommission: { type: Number, default: 0 }
  }
}, { timestamps: true });

InfluencerSchema.index({ tenantId: 1, status: 1 });

// M-11: Ad Performance Analytics
export interface IAdCampaign extends Document {
  tenantId: string;
  name: string;
  platform: 'Facebook' | 'Instagram' | 'Google' | 'WhatsApp' | 'YouTube' | 'Organic';
  budget: number;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'paused' | 'completed';
  metrics: {
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    conversionValue: number;
  };
}

const AdCampaignSchema = new Schema<IAdCampaign>({
  tenantId: { type: String, required: true },
  name: { type: String, required: true },
  platform: { type: String, enum: ['Facebook', 'Instagram', 'Google', 'WhatsApp', 'YouTube', 'Organic'], required: true },
  budget: { type: Number, default: 0 },
  startDate: { type: Date, required: true },
  endDate: Date,
  status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },
  metrics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    spend: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    conversionValue: { type: Number, default: 0 }
  }
}, { timestamps: true });

AdCampaignSchema.index({ tenantId: 1, status: 1 });

// M-12: Conversion Funnel Tracking
export interface IFunnelStep extends Document {
  tenantId: string;
  sessionId: string;
  userId?: Schema.Types.ObjectId;
  stage: 'visitor' | 'product_view' | 'add_to_cart' | 'checkout' | 'payment' | 'purchase';
  productId?: Schema.Types.ObjectId;
  timestamp: Date;
}

const FunnelStepSchema = new Schema<IFunnelStep>({
  tenantId: { type: String, required: true },
  sessionId: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  stage: { 
    type: String, 
    enum: ['visitor', 'product_view', 'add_to_cart', 'checkout', 'payment', 'purchase'],
    required: true 
  },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  timestamp: { type: Date, default: Date.now }
});

FunnelStepSchema.index({ tenantId: 1, sessionId: 1, stage: 1 });

// M-14: Customer Behavior Heatmaps
export interface IBehaviorEvent extends Document {
  tenantId: string;
  sessionId: string;
  pageUrl: string;
  eventType: 'click' | 'scroll' | 'rage_click' | 'dead_click';
  x?: number;
  y?: number;
  scrollDepth?: number;
  elementSelector?: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  timestamp: Date;
}

const BehaviorEventSchema = new Schema<IBehaviorEvent>({
  tenantId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true },
  pageUrl: { type: String, required: true },
  eventType: { type: String, enum: ['click', 'scroll', 'rage_click', 'dead_click'], required: true },
  x: Number,
  y: Number,
  scrollDepth: Number,
  elementSelector: String,
  deviceType: { type: String, enum: ['mobile', 'desktop', 'tablet'], required: true },
  timestamp: { type: Date, default: Date.now }
});

BehaviorEventSchema.index({ tenantId: 1, pageUrl: 1, eventType: 1 });

export const Influencer = model<IInfluencer>('Influencer', InfluencerSchema);
export const AdCampaign = model<IAdCampaign>('AdCampaign', AdCampaignSchema);
export const FunnelStep = model<IFunnelStep>('FunnelStep', FunnelStepSchema);
export const BehaviorEvent = model<IBehaviorEvent>('BehaviorEvent', BehaviorEventSchema);

