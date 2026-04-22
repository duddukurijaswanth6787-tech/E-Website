import apiClient from '../client';

export interface Coupon {
  _id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
}

export const couponService = {
  getAdminCoupons: async (params?: Record<string, any>) => {
    return apiClient.get<any, { success: boolean, data: Coupon[] | any }>('/coupons/admin', { params });
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
