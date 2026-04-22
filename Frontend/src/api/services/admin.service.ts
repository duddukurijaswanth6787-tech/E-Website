import apiClient from '../client';

export interface AdminNode {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  permissions: string[];
  createdAt: string;
}

export const adminService = {
  getAdmins: async (params?: Record<string, any>) => {
    return apiClient.get<any, { success: boolean, data: AdminNode[] | any }>('/admins', { params });
  },

  createAdmin: async (data: Record<string, any>) => {
    return apiClient.post('/admins', data);
  },

  updateAdmin: async (id: string, data: Record<string, any>) => {
    return apiClient.put(`/admins/${id}`, data);
  },

  updateAdminStatus: async (id: string, isActive: boolean) => {
    return apiClient.patch(`/admins/${id}/status`, { isActive });
  },

  deleteAdmin: async (id: string) => {
    return apiClient.delete(`/admins/${id}`);
  }
};
