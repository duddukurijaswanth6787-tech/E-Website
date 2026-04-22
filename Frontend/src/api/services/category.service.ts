import apiClient from '../client';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  banner?: string;
  parent?: any;
  metadata?: {
    fabric?: string;
    origin?: string;
    weaveType?: 'handloom' | 'powerloom' | 'mixed' | 'other';
    occasions?: string[];
  };
  count?: number; // Depending on aggregation availability
}

export interface CollectionResponse {
  _id: string;
  name: string;
  slug: string;
  banner?: string;
  description?: string;
}

export const categoryService = {
  // Fetch active categories (e.g. Sarees, Lehengas)
  getAllCategories: async () => {
    return apiClient.get<any, { success: boolean, data: Category[] }>('/categories');
  },

  // Admin: fetch full taxonomy (includes inactive)
  getAdminAllCategories: async () => {
    return apiClient.get<any, { success: boolean, data: Category[] }>('/categories/admin/all');
  },

  // Fetch seasonal collections (e.g. Bridal 2024)
  getAllCollections: async () => {
    return apiClient.get<any, { success: boolean, data: CollectionResponse[] }>('/collections');
  },

  createCategory: async (data: Record<string, any>) => {
    return apiClient.post('/categories', data);
  },

  updateCategory: async (id: string, data: Record<string, any>) => {
    return apiClient.put(`/categories/${id}`, data);
  },

  deleteCategory: async (id: string) => {
    return apiClient.delete(`/categories/${id}`);
  },

  createCollection: async (data: Record<string, any>) => {
    return apiClient.post('/collections', data);
  },

  updateCollection: async (id: string, data: Record<string, any>) => {
    return apiClient.put(`/collections/${id}`, data);
  },

  deleteCollection: async (id: string) => {
    return apiClient.delete(`/collections/${id}`);
  }
};
