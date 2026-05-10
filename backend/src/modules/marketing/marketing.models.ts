import { Schema, model, Document } from 'mongoose';

// M-3: Promotional Ad Blocks
export interface IPromoBlock extends Document {
  tenantId: string;
  title: string;
  description?: string;
  imageUrl: string;
  link?: string;
  placement: 'homepage' | 'sidebar' | 'product_page' | 'category_page' | 'checkout';
  priority: number;
  startDate?: Date;
  endDate?: Date;
  isActive: boolean;
  visibility: {
    mobile: boolean;
    desktop: boolean;
  };
  analytics: {
    impressions: number;
    clicks: number;
  };
  createdBy: any;
}

const PromoBlockSchema = new Schema<IPromoBlock>({
  tenantId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: String,
  imageUrl: { type: String, required: true },
  link: String,
  placement: { 
    type: String, 
    enum: ['homepage', 'sidebar', 'product_page', 'category_page', 'checkout'],
    required: true 
  },
  priority: { type: Number, default: 0 },
  startDate: Date,
  endDate: Date,
  isActive: { type: Boolean, default: true },
  visibility: {
    mobile: { type: Boolean, default: true },
    desktop: { type: Boolean, default: true }
  },
  analytics: {
    impressions: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true }
}, { timestamps: true });

PromoBlockSchema.index({ tenantId: 1, placement: 1, isActive: 1, priority: -1 });

// M-5: Sticky Offer Bar
export interface IStickyOffer extends Document {
  tenantId: string;
  text: string;
  subText?: string;
  ctaText?: string;
  ctaLink?: string;
  type: 'announcement' | 'countdown' | 'coupon';
  countdownTo?: Date;
  couponCode?: string;
  theme: {
    background: string;
    text: string;
    accent: string;
  };
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  isDismissible: boolean;
  analytics: {
    views: number;
    clicks: number;
  };
}

const StickyOfferSchema = new Schema<IStickyOffer>({
  tenantId: { type: String, required: true, index: true },
  text: { type: String, required: true },
  subText: String,
  ctaText: String,
  ctaLink: String,
  type: { type: String, enum: ['announcement', 'countdown', 'coupon'], default: 'announcement' },
  countdownTo: Date,
  couponCode: String,
  theme: {
    background: { type: String, default: '#000000' },
    text: { type: String, default: '#FFFFFF' },
    accent: { type: String, default: '#3b82f6' }
  },
  isActive: { type: Boolean, default: true },
  startDate: Date,
  endDate: Date,
  isDismissible: { type: Boolean, default: true },
  analytics: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 }
  }
}, { timestamps: true });

StickyOfferSchema.index({ tenantId: 1, isActive: 1 });

// M-8: Festival Campaign
export interface IFestivalCampaign extends Document {
  tenantId: string;
  name: string;
  festivalType: 'Diwali' | 'Sankranti' | 'Ugadi' | 'Ramzan' | 'Christmas' | 'New Year' | 'Independence Day' | 'Other';
  startDate: Date;
  endDate: Date;
  themeConfig: {
    primaryColor: string;
    overlayAsset?: string;
    customCss?: string;
  };
  isActive: boolean;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  analytics: {
    totalRevenue: number;
    totalOrders: number;
  };
}

const FestivalCampaignSchema = new Schema<IFestivalCampaign>({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  festivalType: { 
    type: String, 
    enum: ['Diwali', 'Sankranti', 'Ugadi', 'Ramzan', 'Christmas', 'New Year', 'Independence Day', 'Other'],
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  themeConfig: {
    primaryColor: String,
    overlayAsset: String,
    customCss: String
  },
  isActive: { type: Boolean, default: false },
  status: { type: String, enum: ['draft', 'scheduled', 'active', 'completed'], default: 'draft' },
  analytics: {
    totalRevenue: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 }
  }
}, { timestamps: true });

FestivalCampaignSchema.index({ tenantId: 1, status: 1 });

export const PromoBlock = model<IPromoBlock>('PromoBlock', PromoBlockSchema);
export const StickyOffer = model<IStickyOffer>('StickyOffer', StickyOfferSchema);
export const FestivalCampaign = model<IFestivalCampaign>('FestivalCampaign', FestivalCampaignSchema);

