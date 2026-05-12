import apiClient from '../client';

export interface PaymentLogNode {
  status: string;
  message: string;
  timestamp: string;
  source: string;
  _id?: string;
}

export interface PaymentNode {
  _id: string;
  order?: { 
    _id: string; 
    orderNumber: string; 
    total: number; 
    status: string;
    paymentStatus?: string;
    address?: Record<string, any>;
    items?: Array<Record<string, any>>;
    timeline?: Array<Record<string, any>>;
    paymentLogs?: PaymentLogNode[];
    razorpayOrderId?: string;
    razorpay_order_id?: string;
    razorpayPaymentId?: string;
    razorpay_payment_id?: string;
    paidAt?: string;
    failureReason?: string;
  };
  user?: { _id: string; name: string; email: string; mobile?: string };
  provider: 'razorpay' | 'cod' | 'manual' | string;
  method?: string;
  amount: number;
  currency?: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'partially_refunded' | string;
  razorpayOrderId?: string;
  razorpay_order_id?: string;
  razorpayPaymentId?: string;
  razorpay_payment_id?: string;
  failureReason?: string;
  refundAmount?: number;
  refundStatus?: string;
  refundedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentAnalytics {
  cards: {
    totalRevenue: number;
    todaysRevenue: number;
    monthlyRevenue: number;
    paidOrders: number;
    pendingPayments: number;
    failedPayments: number;
    codOrders: number;
    refundAmount: number;
    razorpayRevenue: number;
  };
  rates: {
    paymentSuccessRate: number;
    failedPaymentRate: number;
    codVsOnlineRatio: {
      cod: number;
      online: number;
      percentage: number;
    };
  };
  charts: {
    dailyRevenueTrend: { date: string; amount: number }[];
  };
}

export const paymentService = {
  getAdminPayments: async (params?: Record<string, any>) => {
    return apiClient.get<any, { success: boolean, data: { payments: PaymentNode[], pagination: Record<string, any> } | any }>('/payments/admin', { params });
  },

  getPaymentDetail: async (id: string) => {
    return apiClient.get<any, { success: boolean, data: PaymentNode }>(`/payments/${id}`);
  },

  getPaymentAnalytics: async () => {
    return apiClient.get<any, { success: boolean, data: PaymentAnalytics }>('/payments/admin/analytics');
  },

  markCODPaid: async (id: string) => {
    return apiClient.patch<any, { success: boolean, data: PaymentNode }>(`/payments/${id}/cod-paid`);
  },

  retryVerification: async (id: string) => {
    return apiClient.post<any, { success: boolean, data: PaymentNode }>(`/payments/${id}/retry`);
  },

  refundOrder: async (id: string, amount?: number, reason?: string) => {
    return apiClient.post<any, { success: boolean, data: PaymentNode }>(`/payments/${id}/refund`, { amount, reason });
  },

  updateNotes: async (id: string, notes: string) => {
    return apiClient.patch<any, { success: boolean, data: PaymentNode }>(`/payments/${id}/notes`, { notes });
  },

  resendInvoice: async (id: string) => {
    return apiClient.post<any, { success: boolean, data: Record<string, any> }>(`/payments/${id}/invoice`);
  }
};
