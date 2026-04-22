import apiClient from '../client';

export interface OrderPayload {
  shippingAddress: any;
  billingAddress: any;
  items: any[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'RAZORPAY' | 'COD';
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export const orderService = {
  createOrder: async (payload: OrderPayload) => {
    return apiClient.post('/orders', payload);
  },

  verifyPayment: async (orderId: string, paymentDetails: any) => {
    // Typical razorpay verification payload
    // { razorpay_payment_id, razorpay_order_id, razorpay_signature }
    return apiClient.post(`/orders/${orderId}/verify`, paymentDetails);
  },

  getUserOrders: async () => {
    return apiClient.get('/orders/user');
  },

  getOrderById: async (id: string) => {
    return apiClient.get<any, { success: boolean, data: any }>(`/orders/${id}`);
  },

  // Admin Methods
  getAdminOrders: async (params?: Record<string, any>) => {
    return apiClient.get<any, { success: boolean, data: any }>('/orders/admin', { params });
  },

  updateOrderStatus: async (id: string, status: string) => {
    return apiClient.patch(`/orders/${id}/status`, { orderStatus: status });
  }
};
