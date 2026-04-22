import apiClient from '../client';

export interface CustomBlouseRequest {
  _id?: string;
  measurements: Record<string, string>;
  stylePreferences: {
    neckline: string;
    sleeves: string;
    backDesign: string;
  };
  fabricDetails: string;
  notes?: string;
  status?: string;
  createdAt?: string;
}

export const customRequestService = {
  submitRequest: async (formData: FormData | CustomBlouseRequest) => {
    // If we support file uploads in the payload, we use FormData
    // For json payloads mapping strictly to measurements/styles, use json
    const isFormData = formData instanceof FormData;
    return apiClient.post('/custom-requests', formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
  },

  getUserRequests: async () => {
    return apiClient.get('/custom-requests/my-requests');
  },

  getRequestById: async (id: string) => {
    return apiClient.get(`/custom-requests/${id}`);
  },

  getAdminRequests: async (params?: Record<string, any>) => {
    return apiClient.get<any, { success: boolean, data: any }>('/custom-requests/admin', { params });
  },

  updateRequestStatus: async (id: string, status: string, notes?: string) => {
    return apiClient.patch(`/custom-requests/${id}/status`, { status, notes });
  }
};
