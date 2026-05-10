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
    requiresOtp?: boolean;
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

  // Tailor login flow
  tailorLogin: async (credentials: object) => {
    return apiClient.post<any, any>('/tailor-auth/login', credentials);
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
    return apiClient.post<any, { success: boolean; message: string; requiresOtp?: boolean; data?: any }>('/auth/register', payload);
  },

  // Verification methods
  verifyOtp: async (email: string, otp: string) => {
    return apiClient.post<any, AuthResponse>('/auth/verify-email', { email, otp });
  },

  verifyLogin: async (email: string, otp: string) => {
    return apiClient.post<any, AuthResponse>('/auth/verify-login', { email, otp });
  },

  verifyAdminLogin: async (email: string, otp: string) => {
    return apiClient.post<any, AuthResponse>('/admin-auth/verify-login', { email, otp });
  },

  // Current User retrieval using attached JWT
  getMe: async () => {
    return apiClient.get<any, { success: boolean, data: { user: any } }>('/auth/me');
  },

  // Logout triggers local and backend clearance
  logout: async () => {
    return apiClient.post('/auth/logout');
  },

  forgotPassword: async (email: string) => {
    return apiClient.post<any, { success: boolean; message: string; requiresOtp: boolean }>('/auth/forgot-password', { email });
  },

  resetPassword: async (email: string, otp: string, newPassword: string) => {
    return apiClient.post<any, { success: boolean; message: string }>('/auth/reset-password', { email, otp, newPassword });
  }
};
