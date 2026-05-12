import api from '../client';

export interface DashboardAnalytics {
  totalRevenue: number;
  totalUsers: number;
  totalOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingBlouseRequests: number;
  production: {
    workflows: {
      active: number;
      pending: number;
      delayed: number;
      qcPending: number;
      urgent: number;
      alteration: number;
      completedToday: number;
    };
    tailors: {
      active: number;
      total: number;
      available: number;
      totalWorkload: number;
      totalCapacity: number;
      atCapacity: number;
    };
    todayDeliveries: any[];
  };
}

export const analyticsService = {
  getDashboardMetrics: () => api.get<DashboardAnalytics>('/analytics/dashboard'),
  getExecutiveInsights: () => api.get('/analytics/executive-insights'),
  getMarketingActivity: () => api.get('/analytics/marketing-activity'),
  getMarketingStats: () => api.get('/marketing/stats'),
  getHeatmapData: (params: { path: string, type: string }) => api.get('/analytics/heatmap', { params }),
  getSalesTrends: (params?: any) => api.get('/analytics/sales', { params }),
  getTopProducts: () => api.get('/analytics/top-products'),
  getCustomerGrowth: () => api.get('/analytics/customer-growth'),
  
  // Export methods
  exportOrders: () => window.open(`${api.defaults.baseURL}/analytics/export/orders`, '_blank'),
  exportCustomers: () => window.open(`${api.defaults.baseURL}/analytics/export/customers`, '_blank'),
};
