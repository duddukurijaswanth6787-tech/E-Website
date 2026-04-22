import apiClient from '../client';

export interface PaymentNode {
  _id: string;
  order: { _id: string; orderNumber: string; total: number; status: string };
  user: { _id: string; name: string; email: string };
  provider: 'razorpay' | 'cod' | 'manual';
  method?: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  razorpayPaymentId?: string;
  createdAt: string;
}

export const paymentService = {
  getAdminPayments: async (params?: Record<string, any>) => {
    return apiClient.get<any, { success: boolean, data: PaymentNode[] | any }>('/payments/admin', { params });
  },

  getPaymentDetail: async (id: string) => {
    return apiClient.get<any, { success: boolean, data: PaymentNode }>(`/payments/${id}`);
  }
};
