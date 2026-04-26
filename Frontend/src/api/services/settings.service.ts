import apiClient from '../client';

export interface Setting {
  _id: string;
  key: string;
  value: any;
  group: string;
  type: string;
  label: string;
  isPublic: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const settingsService = {
  getPublicSettings: async () => {
    return apiClient.get<any, { success: boolean; data: Record<string, any> }>('/settings/public');
  },
  
  getAdminSettings: async (group?: string) => {
    const query = group ? `?group=${group}` : '';
    return apiClient.get<any, { success: boolean; data: Setting[] }>(`/settings${query}`);
  },

  updateAdminSetting: async (key: string, value: any) => {
    return apiClient.patch<any, { success: boolean; data: Setting }>(`/settings/${key}`, { value });
  },

  bulkUpsertAdminSettings: async (settings: Array<{ key: string; value: any; isPublic?: boolean; group?: string; label?: string }>) => {
    return apiClient.put<any, { success: boolean; data: null }>('/settings', { settings });
  }
};
