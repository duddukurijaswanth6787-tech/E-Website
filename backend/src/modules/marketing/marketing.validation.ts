import { z } from 'zod';

// Analytics & Stats
export const getStatsSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});

export const getSalesTrendsSchema = z.object({
  query: z.object({
    period: z.enum(['7days', '30days', '90days', '1year']).default('7days'),
  }),
});

// M-9: Influencer Onboarding
export const createInfluencerSchema = z.object({
  body: z.object({
    name: z.string().min(2),
    handle: z.string().min(1),
    platform: z.enum(['Instagram', 'YouTube', 'TikTok', 'Other']),
    referralCode: z.string().min(3).toUpperCase(),
    commissionRate: z.number().min(0).max(100),
  }),
});

// M-15: Notification Campaigns
export const createCampaignSchema = z.object({
  body: z.object({
    name: z.string().min(3),
    templateId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    targetSegments: z.array(z.string()).min(1),
    scheduledAt: z.string().datetime().optional(),
  }),
});

// M-14: Behavioral Tracking (Heatmaps)
export const trackBehaviorSchema = z.object({
  body: z.object({
    sessionId: z.string(),
    pageUrl: z.string(),
    eventType: z.enum(['click', 'scroll', 'rage_click', 'dead_click']),
    x: z.number().optional(),
    y: z.number().optional(),
    scrollDepth: z.number().optional(),
    elementSelector: z.string().optional(),
    deviceType: z.enum(['mobile', 'desktop', 'tablet']),
  }),
});

// M-12: Funnel Tracking
export const trackFunnelSchema = z.object({
  body: z.object({
    sessionId: z.string(),
    stage: z.enum(['visitor', 'product_view', 'add_to_cart', 'checkout', 'payment', 'purchase']),
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
  }),
});

export const trackEngagementSchema = z.object({
  body: z.object({
    sessionId: z.string().optional(),
    deviceId: z.string().optional(),
  }).optional(),
});
