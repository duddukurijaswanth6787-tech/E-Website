import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { config } from '../config/env.config';

/**
 * Centralized Enterprise Axios Client
 * - Base URL from centralized config
 * - 10s Timeout
 * - With Credentials for Cookies
 * - Auth Interceptors for Token Refresh
 */
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach Token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Inject stable guest cart ID
    let guestId = localStorage.getItem('vasanthi_guest_cart_id');
    if (!guestId) {
      guestId = crypto.randomUUID();
      localStorage.setItem('vasanthi_guest_cart_id', guestId);
    }
    if (config.headers) {
      config.headers['x-guest-cart-id'] = guestId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Graceful Error Normalization & Token Refresh
api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // Handle Network Errors (AxiosError: Network Error)
    if (!error.response) {
      if (import.meta.env.DEV) {
        console.warn('API unavailable (Network Error):', error.message);
      }
      return Promise.reject({ success: false, message: 'Server unreachable. Please check your connection.' });
    }

    // Handle 401 Unauthorized (Token Expired)
    const isAuthRequest = originalRequest.url?.includes('/login') || originalRequest.url?.includes('/verify') || originalRequest.url?.includes('/refresh');
    if (error.response.status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');

        const role = useAuthStore.getState().user?.role;
        let refreshPath = '/auth/refresh';
        if (role && ['admin', 'super_admin'].includes(role)) refreshPath = '/admin-auth/refresh';
        else if (role === 'tailor') refreshPath = '/tailor-auth/refresh';
        else if (role === 'manager') refreshPath = '/manager-auth/refresh';

        const resp = await axios.post(`${api.defaults.baseURL}${refreshPath}`, { refreshToken });
        const payload = resp.data?.data ?? resp.data;
        
        if (!payload?.accessToken) throw new Error('Invalid refresh response');

        useAuthStore.getState().setTokens(payload.accessToken, payload.refreshToken || refreshToken);
        originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        const wasAuthenticated = !!useAuthStore.getState().token;
        useAuthStore.getState().logout();
        if (wasAuthenticated) {
          toast.error('Session expired. Please log in again.');
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Graceful Error Normalization
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    
    // Noise reduction: Don't toast for known silent errors or GET failures we handle locally
    const isPublicGet = originalRequest.method === 'get' && !originalRequest.url.includes('/admin');
    if (!isPublicGet && error.response.status !== 404) {
      toast.error(message);
    }

    return Promise.reject({ 
      success: false, 
      message, 
      status: error.response?.status,
      data: error.response?.data 
    });
  }
);

// Public instance for non-authenticated requests (Telemetry, Public Settings)
export const publicApi = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

publicApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (import.meta.env.DEV) {
      console.warn('Public API fallback triggered:', error.message);
    }
    return Promise.reject({ success: false, message: error.message });
  }
);

export default api;
