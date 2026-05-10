/**
 * Marketing ERP Enterprise Types
 */

export type MarketingChannel = 'email' | 'whatsapp' | 'sms' | 'push' | 'in-app';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
export type PlacementType = 'homepage' | 'sidebar' | 'product_page' | 'category_page' | 'checkout';

export interface MarketingKPIs {
  totalRevenue: number;
  todayRevenue: number;
  avgOrderValue: number;
  activeBanners: number;
  activeCoupons: number;
  activePromoBlocks: number;
  totalCustomers: number;
  conversionRate: number;
}

export interface PromoBlock {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  link?: string;
  placement: PlacementType;
  priority: number;
  isActive: boolean;
  visibility: {
    mobile: boolean;
    desktop: boolean;
  };
  analytics: {
    impressions: number;
    clicks: number;
  };
}

export interface Influencer {
  _id: string;
  name: string;
  handle: string;
  platform: 'Instagram' | 'YouTube' | 'TikTok' | 'Other';
  referralCode: string;
  commissionRate: number;
  status: 'pending' | 'active' | 'suspended';
  analytics: {
    totalClicks: number;
    totalSales: number;
    totalRevenue: number;
  };
}

export interface AIInsight {
  churnRisk: number;
  avgLTV: number;
  topRecommendations: string[];
  revenueForecast: Array<{
    month: string;
    predicted: number;
    actual: number | null;
  }>;
}
