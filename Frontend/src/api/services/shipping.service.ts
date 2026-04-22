import apiClient from '../client';

export interface ShippingRule {
  _id: string;
  region: string;
  method: string;
  cost: number;
  minOrderValue?: number;
  isActive: boolean;
  notes?: string;
}

export const shippingService = {
  getRules: async () => {
    return apiClient.get<any, { success: boolean, data: ShippingRule[] | any }>('/shipping');
  },

  createRule: async (data: Record<string, any>) => {
    return apiClient.post('/shipping', data);
  },

  updateRule: async (id: string, data: Record<string, any>) => {
    return apiClient.put(`/shipping/${id}`, data);
  },

  deleteRule: async (id: string) => {
    return apiClient.delete(`/shipping/${id}`);
  }
};
