import apiClient from '../client';

export interface UserNode {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  role: string;
  isBlocked: boolean;
  blockedReason?: string;
  createdAt: string;
}

export const userService = {
  // Public / Customer Scoped Profile Sync
  updateProfile: async (data: Record<string, any>) => {
    return apiClient.put('/users/profile', data);
  },

  // Admin Scoped Access Node
  getAdminUsers: async (params?: Record<string, any>) => {
    return apiClient.get<any, { success: boolean, data: UserNode[] | any }>('/users', { params });
  },

  blockUser: async (id: string, block: boolean, reason?: string) => {
    return apiClient.patch(`/users/${id}/block`, { block, reason });
  }
};
