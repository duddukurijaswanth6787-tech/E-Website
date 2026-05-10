/**
 * Marketing ERP Production Configuration
 */

export const MARKETING_CONFIG = {
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:5000',
  
  CACHE_STRATEGY: 'stale-while-revalidate',
  REFETCH_INTERVALS: {
    DASHBOARD: 30000, // 30s
    CAMPAIGNS: 60000, // 1m
    REALTIME_FEED: 10000 // 10s
  },

  FEATURE_FLAGS: {
    AI_RECOMMENDATIONS: true,
    OMNICHANNEL_DELIVERY: true,
    BEHAVIOR_HEATMAPS: true
  },

  THRESHOLD: {
    CHURN_RISK: 0.7,
    HIGH_CONVERSION_PROBABILITY: 0.85
  }
};
