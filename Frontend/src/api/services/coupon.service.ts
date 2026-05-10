import apiClient from '../client';

export interface Coupon {
  _id: string;
  code: string;
  type: 'percentage' | 'flat';
  value: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validTo: string;
  maxUses?: number;
  usedCount: number;
  revenueGenerated: number;
  isActive: boolean;
}

export const couponService = {
  getCoupons: async (params?: Record<string, any>) => {
    return apiClient.get<any, { success: boolean, data: Coupon[] }>('/coupons', { params });
  },

  createCoupon: async (data: Record<string, any>) => {
    return apiClient.post('/coupons', data);
  },

  updateCoupon: async (id: string, data: Record<string, any>) => {
    return apiClient.put(`/coupons/${id}`, data);
  },

  deleteCoupon: async (id: string) => {
    return apiClient.delete(`/coupons/${id}`);
  }
};
