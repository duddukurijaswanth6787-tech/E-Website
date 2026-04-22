import apiClient from '../client';

export interface NotificationNode {
  _id: string;
  user?: { _id: string; name: string; email: string };
  type: string;
  channel: 'email' | 'in_app';
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  getAdminNotifications: async (params?: Record<string, any>) => {
    return apiClient.get<any, { success: boolean, data: NotificationNode[] | any }>('/notifications/admin', { params });
  },

  markAsRead: async (id: string) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },

  dispatchNotification: async (data: Record<string, any>) => {
    return apiClient.post('/notifications', data);
  }
};
