import apiClient from '../client';

export const managerAuthService = {
  login: async (credentials: any) => {
    return apiClient.post('/manager-auth/login', credentials);
  },
  logout: async (refreshToken: string) => {
    return apiClient.post('/manager-auth/logout', { refreshToken });
  },
  changePassword: async (passwords: any) => {
    return apiClient.patch('/manager-auth/change-password', passwords);
  }
};
