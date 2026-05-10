import apiClient from '../client';

export interface TailorAdmin {
  _id: string;
  name: string;
  email: string;
  phone: string;
  tailorCode: string;
  specialization: string[];
  experienceYears: number;
  dailyCapacity: number;
  currentAssignedCount: number;
  completedOrdersCount: number;
  isAvailable: boolean;
  isActive: boolean;
  isVerified: boolean;
  profileImage?: string;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T;
}

export const adminTailorService = {
  getAllTailors: async (params?: { page?: number; limit?: number; specialization?: string; isAvailable?: boolean; search?: string }): Promise<PaginatedResponse<{ tailors: TailorAdmin[]; pagination: any }>> => {
    return apiClient.get('/admin/tailors', { params });
  },

  getTailorById: async (id: string): Promise<{ status: string; data: TailorAdmin }> => {
    return apiClient.get(`/admin/tailors/${id}`);
  },

  createTailor: async (tailorData: any): Promise<{ status: string; data: TailorAdmin }> => {
    return apiClient.post('/admin/tailors', tailorData);
  },

  updateTailor: async (id: string, tailorData: any): Promise<{ status: string; data: TailorAdmin }> => {
    return apiClient.put(`/admin/tailors/${id}`, tailorData);
  },

  updateTailorStatus: async (id: string, updates: { isActive?: boolean; isAvailable?: boolean }): Promise<{ status: string; data: TailorAdmin }> => {
    return apiClient.patch(`/admin/tailors/${id}/status`, updates);
  },

  deleteTailor: async (id: string): Promise<{ status: string; message: string }> => {
    return apiClient.delete(`/admin/tailors/${id}`);
  }
};
