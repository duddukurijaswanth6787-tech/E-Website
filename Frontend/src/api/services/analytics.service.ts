import apiClient from '../client';

export interface DashboardAnalytics {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  pendingBlouseRequests: number;
  lowStockProducts: number;
  recentOrders: any[];
  ordersByStatus: Record<string, number>;
  production: {
    workflows: {
      pending: number;
      active: number;
      delayed: number;
      urgent: number;
      qcPending: number;
      alteration: number;
      completedToday: number;
    };
    tailors: {
      total: number;
      active: number;
      available: number;
      atCapacity: number;
      totalWorkload: number;
      totalCapacity: number;
    };
    todayDeliveries: any[];
  };
}

export const analyticsService = {
  getDashboardMetrics: async () => {
    return apiClient.get<any, { success: boolean, data: DashboardAnalytics }>('/analytics/dashboard');
  },
  getSalesGrowth: async () => {
    return apiClient.get<any, { success: boolean, data: any[] }>('/analytics/sales');
  }
};
