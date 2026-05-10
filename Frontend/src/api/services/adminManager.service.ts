import apiClient from '../client';

export interface ManagerAdmin {
  _id: string;
  managerCode: string;
  name: string;
  email: string;
  phone: string;
  managerType: string;
  department: string;
  permissions: string[];
  branchId?: string;
  branchName?: string;
  activeAssignmentsCount: number;
  completedAssignmentsCount: number;
  delayedAssignmentsCount: number;
  isActive: boolean;
  isVerified: boolean;
  mustChangePassword?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface PaginatedResponse<T> {
  status: string;
  data: T;
}

export const adminManagerService = {
  getAllManagers: async (params?: { page?: number; limit?: number; managerType?: string; department?: string; isActive?: boolean; search?: string; branchId?: string }): Promise<PaginatedResponse<{ managers: ManagerAdmin[]; pagination: any }>> => {
    return apiClient.get('/admin/managers', { params });
  },

  getManagerById: async (id: string): Promise<{ status: string; data: ManagerAdmin }> => {
    return apiClient.get(`/admin/managers/${id}`);
  },

  createManager: async (managerData: any): Promise<{ status: string; data: ManagerAdmin }> => {
    return apiClient.post('/admin/managers', managerData);
  },

  updateManager: async (id: string, managerData: any): Promise<{ status: string; data: ManagerAdmin }> => {
    return apiClient.put(`/admin/managers/${id}`, managerData);
  },

  updateManagerStatus: async (id: string, updates: { isActive?: boolean; isVerified?: boolean; unlockAccount?: boolean }): Promise<{ status: string; data: ManagerAdmin }> => {
    return apiClient.patch(`/admin/managers/${id}/status`, updates);
  },

  deleteManager: async (id: string): Promise<{ status: string; message: string }> => {
    return apiClient.delete(`/admin/managers/${id}`);
  },

  resetManagerPassword: async (id: string, newPassword: string): Promise<{ status: string; data: ManagerAdmin; message: string }> => {
    return apiClient.post(`/admin/managers/${id}/reset-password`, { newPassword });
  }
};
