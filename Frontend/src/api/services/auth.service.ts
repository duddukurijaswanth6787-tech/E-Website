import apiClient from '../client';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      mobile?: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export const authService = {
  // Login standard flow
  login: async (credentials: object) => {
    return apiClient.post<any, AuthResponse>('/auth/login', credentials);
  },

  // Admin login flow
  adminLogin: async (credentials: object) => {
    return apiClient.post<any, any>('/admin-auth/login', credentials);
  },

  // Developer Bypass flow mimicking OTP creation
  developerMockLogin: async (email: string) => {
    // This connects to the mock backend admin or test user
    // Note: To mimic securely, we use a custom test route if available, or just mock standard login
    return apiClient.post<any, AuthResponse>('/auth/login', {
       email, password: 'Admin@12345!' // The seed admin pass
    });
  },

  // Registration flow -> returns message to check OTP
  register: async (payload: object) => {
    return apiClient.post<any, { success: boolean; message: string }>('/auth/register', payload);
  },

  // OTP Verification -> returns standard AuthResponse
  verifyOtp: async (email: string, code: string) => {
    return apiClient.post<any, AuthResponse>('/auth/verify-otp', { email, code });
  },

  // Current User retrieval using attached JWT
  getMe: async () => {
    return apiClient.get<any, { success: boolean, data: { user: any } }>('/auth/me');
  },

  // Logout triggers local and backend clearance
  logout: async () => {
    return apiClient.post('/auth/logout');
  }
};
