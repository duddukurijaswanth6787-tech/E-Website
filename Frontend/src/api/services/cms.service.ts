import apiClient from '../client';

export interface CMSBlock {
  _id: string;
  page: 'HOME' | 'ABOUT' | 'FAQ' | 'PRIVACY' | 'TERMS' | 'SHIPPING_RETURNS';
  sectionKey: string;
  content: string | Record<string, any>;
  isActive: boolean;
}

export const cmsService = {
  getBlocksByPage: async (page: string) => {
    return apiClient.get<any, { success: boolean, data: CMSBlock[] | any }>(`/cms/${page}`);
  },

  getAdminBlocks: async () => {
    return apiClient.get<any, { success: boolean, data: CMSBlock[] | any }>('/cms/admin');
  },

  updateBlock: async (id: string, content: string | Record<string, any>) => {
    return apiClient.put(`/cms/${id}`, { content });
  }
};
