import api from '../client';

export interface CustomBlouseOption {
  _id: string;
  category: string;
  value: string;
  image?: string;
  isActive: boolean;
  order: number;
}

export const customBlouseOptionService = {
  /**
   * Get all active options
   */
  getActiveOptions: async () => {
    return api.get<any>('/custom-blouse-options');
  },

  /**
   * Admin: Get all options
   */
  getAllOptions: async () => {
    return api.get<any>('/custom-blouse-options/admin');
  },

  /**
   * Admin: Create an option
   */
  createOption: async (data: Partial<CustomBlouseOption>) => {
    return api.post<any>('/custom-blouse-options', data);
  },

  /**
   * Admin: Update an option
   */
  updateOption: async (id: string, data: Partial<CustomBlouseOption>) => {
    return api.patch<any>(`/custom-blouse-options/${id}`, data);
  },

  /**
   * Admin: Delete an option
   */
  deleteOption: async (id: string) => {
    return api.delete<any>(`/custom-blouse-options/${id}`);
  },
};
