import api, { publicClient } from '../client';

export interface PromoBlock {
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  link?: string;
  placement: 'homepage' | 'sidebar' | 'product_page' | 'category_page' | 'checkout';
  priority: number;
  startDate?: string;
  endDate?: string;
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

export interface StickyOffer {
  _id: string;
  text: string;
  subText?: string;
  ctaText?: string;
  ctaLink?: string;
  type: 'announcement' | 'countdown' | 'coupon';
  countdownTo?: string;
  couponCode?: string;
  theme: {
    background: string;
    text: string;
    accent: string;
  };
  isActive: boolean;
  isDismissible: boolean;
}

export interface FestivalCampaign {
  _id: string;
  name: string;
  festivalType: string;
  startDate: string;
  endDate: string;
  themeConfig: {
    primaryColor: string;
    overlayAsset?: string;
    customCss?: string;
  };
  isActive: boolean;
  status: 'draft' | 'scheduled' | 'active' | 'completed';
}

export interface WelcomeBanner {
  _id: string;
  title?: string;
  subtitle?: string;
  buttonText?: string;
  imageUrl: string;
  redirectUrl?: string;
  isActive: boolean;
  targetAudience: 'all' | 'first_time' | 'returning';
  deviceTarget: 'all' | 'mobile' | 'desktop';
  startDate?: string;
  endDate?: string;
  priority: number;
  analytics: {
    impressions: number;
    clicks: number;
  };
}

export interface OnboardingWizardStep {
  title: string;
  subtitle: string;
  content: string;
  icon: string;
  color: string;
}

export interface OnboardingWizard {
  _id?: string;
  tenantId?: string;
  isActive: boolean;
  steps: OnboardingWizardStep[];
}

export const marketingService = {
  // M-3 Promo Blocks
  getPromoBlocks: (params?: any) => publicClient.get<PromoBlock[]>('/marketing/promo-blocks', { params }),
  createPromoBlock: (data: Partial<PromoBlock>) => api.post<PromoBlock>('/marketing/promo-blocks', data),
  updatePromoBlock: (id: string, data: Partial<PromoBlock>) => api.put<PromoBlock>(`/marketing/promo-blocks/${id}`, data),
  deletePromoBlock: (id: string) => api.delete(`/marketing/promo-blocks/${id}`),

  // M-5 Sticky Offers
  getStickyOffers: () => publicClient.get<StickyOffer[]>('/marketing/sticky-offers'),
  createStickyOffer: (data: Partial<StickyOffer>) => api.post<StickyOffer>('/marketing/sticky-offers', data),
  updateStickyOffer: (id: string, data: Partial<StickyOffer>) => api.put<StickyOffer>(`/marketing/sticky-offers/${id}`, data),

  // M-8 Festival Campaigns
  getFestivalCampaigns: () => publicClient.get<FestivalCampaign[]>('/marketing/festivals'),
  createFestivalCampaign: (data: Partial<FestivalCampaign>) => api.post<FestivalCampaign>('/marketing/festivals', data),

  // Dashboard Stats
  getMarketingStats: () => api.get('/marketing/stats'),
  getSalesTrends: (period: string) => api.get('/marketing/sales-trends', { params: { period } }),

  // M-9 Influencers
  getInfluencers: () => api.get<any[]>('/marketing/influencers'),
  createInfluencer: (data: any) => api.post('/marketing/influencers', data),

  // M-11 Ad Performance
  getAdCampaigns: () => api.get<any[]>('/marketing/ad-campaigns'),

  // M-12 Funnel Tracking
  getFunnelAnalytics: () => api.get<any[]>('/marketing/funnel-analytics'),

  // M-14 Heatmaps
  getHeatmapData: (pageUrl: string) => api.get<any[]>('/marketing/heatmap-data', { params: { pageUrl } }),

  // M-15 Notification Engine
  getNotificationTemplates: () => api.get<any[]>('/marketing/templates'),
  getNotificationCampaigns: () => api.get<any[]>('/marketing/campaigns'),
  sendNotificationCampaign: (id: string) => api.post(`/marketing/campaigns/${id}/send`),

  // M-16 AI Marketing
  getAIPredictions: (type?: string) => api.get<any[]>('/marketing/ai/predictions', { params: { type } }),
  getAIInsights: () => api.get<any>('/marketing/ai/insights'),

  // Product Analytics
  getTopProducts: () => publicClient.get<any[]>('/analytics/top-products'),

  // Automation
  getAutomationRules: () => api.get<any[]>('/marketing/automation-rules'),
  createAutomationRule: (data: any) => api.post('/marketing/automation-rules', data),

  // M-17 Welcome Banners
  getWelcomeBanners: () => publicClient.get<WelcomeBanner[]>('/marketing/welcome-banners'),
  createWelcomeBanner: (data: Partial<WelcomeBanner>) => api.post<WelcomeBanner>('/marketing/welcome-banners', data),
  updateWelcomeBanner: (id: string, data: Partial<WelcomeBanner>) => api.put<WelcomeBanner>(`/marketing/welcome-banners/${id}`, data),
  deleteWelcomeBanner: (id: string) => api.delete(`/marketing/welcome-banners/${id}`),

  // M-18 Onboarding Wizard
  getOnboardingWizard: () => api.get<OnboardingWizard>('/marketing/onboarding-wizard'),
  saveOnboardingWizard: (data: { isActive: boolean; steps: OnboardingWizardStep[] }) => api.put<OnboardingWizard>('/marketing/onboarding-wizard', data),
  getActiveOnboardingWizard: () => publicClient.get<OnboardingWizard>('/marketing/onboarding-wizard/active'),
};



