import apiClient from '../client';
import type { MeasurementProfile } from '../../utils/measurementSchema';

export const measurementService = {
  getMyProfiles: async (): Promise<{ success: boolean; data: MeasurementProfile[] }> => {
    return apiClient.get('/measurements/profiles');
  },

  createProfile: async (profile: MeasurementProfile): Promise<{ success: boolean; data: MeasurementProfile }> => {
    return apiClient.post('/measurements/profiles', profile);
  },

  updateProfile: async (id: string, profile: Partial<MeasurementProfile>): Promise<{ success: boolean; data: MeasurementProfile }> => {
    return apiClient.patch(`/measurements/profiles/${id}`, profile);
  },

  deleteProfile: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/measurements/profiles/${id}`);
  },

  setDefault: async (id: string): Promise<{ success: boolean }> => {
    return apiClient.post(`/measurements/profiles/${id}/default`);
  },

  duplicateProfile: async (id: string): Promise<{ success: boolean; data: MeasurementProfile }> => {
    return apiClient.post(`/measurements/profiles/${id}/duplicate`);
  }
};
