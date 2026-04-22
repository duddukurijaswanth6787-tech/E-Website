import apiClient from '../client';

export interface MediaAsset {
  filename: string;
  url: string;
  path: string;
  size?: number;
  date?: string;
}

export const mediaService = {
  getMediaLibrary: async (params?: Record<string, any>) => {
    return apiClient.get<any, { success: boolean, data: MediaAsset[] | any }>('/uploads/library', { params });
  },

  uploadSingle: async (file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post(`/uploads/single?folder=${folder || 'misc'}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
