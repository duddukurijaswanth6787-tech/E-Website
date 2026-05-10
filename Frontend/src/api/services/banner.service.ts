import apiClient from '../client';

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  image?: string;
  link?: string;
  placement?: string;
  section?: string;
  isActive: boolean;
  order: number;
  impressions?: number;
  clicks?: number;
  createdAt?: string;
}

export const bannerService = {
  getBanners: async (placement?: string) => {
    return apiClient.get<any, { success: boolean, data: Banner[] }>('/banners', { params: { placement } });
  },

  createBanner: async (data: FormData | Record<string, any>) => {
    const isFormData = data instanceof FormData;
    return apiClient.post('/banners', data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
  },

  updateBanner: async (id: string, data: FormData | Record<string, any>) => {
    const isFormData = data instanceof FormData;
    return apiClient.put(`/banners/${id}`, data, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
  },

  deleteBanner: async (id: string) => {
    return apiClient.delete(`/banners/${id}`);
  }
};
