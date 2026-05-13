import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { config } from '../config/env.config';
import { logger } from '../utils/logger';

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

// Pending request map to prevent duplicate concurrent API requests
const pendingRequests = new Map();

const generateRequestKey = (config: any) => {
  return `${config.method}:${config.url}?${JSON.stringify(config.params || {})}:${JSON.stringify(config.data || {})}`;
};

// Request Interceptor: Attach Token & Deduplicate
api.interceptors.request.use(
  (config) => {
    // 1. Deduplication Check
    const requestKey = generateRequestKey(config);
    if (pendingRequests.has(requestKey)) {
      const controller = new AbortController();
      config.signal = controller.signal;
      controller.abort('Duplicate Request Cancelled');
    } else {
      pendingRequests.set(requestKey, true);
    }
    // Attach key for cleanup
    (config as any)._requestKey = requestKey;

    // 2. Auth Flow
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
  (response) => {
    if ((response.config as any)._requestKey) {
      pendingRequests.delete((response.config as any)._requestKey);
    }
    logger.api(response.config.method || 'get', response.config.url || '', response.status);
    return response.data;
  },
  async (error) => {
    if (error.config && (error.config as any)._requestKey) {
      pendingRequests.delete((error.config as any)._requestKey);
    }
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    logger.api(originalRequest?.method || 'error', url, status, error.response?.data);

    // Handle Network Errors (AxiosError: Network Error)
    if (!error.response) {
      logger.error(`API unreachable (Network Error): ${url}`, error);
      return Promise.reject({ success: false, message: 'Server unreachable. Please check your connection.' });
    }

    // Handle 401 Unauthorized (Token Expired)
    const isAuthRequest = url.includes('/login') || url.includes('/verify') || url.includes('/refresh');
    if (status === 401 && !originalRequest._retry && !isAuthRequest) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          logger.warn('No refresh token available for 401 retry');
          throw new Error('No refresh token');
        }

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
    
    // Phase 5: Production Visibility - Log exactly why it failed
    if (status >= 400) {
      logger.warn(`API Exception [${status}] on ${url}: ${message}`);
    }

    // Noise reduction: Don't toast for known silent errors or GET failures we handle locally
    const isPublicGet = originalRequest.method === 'get' && !url.includes('/admin');
    if (!isPublicGet && status !== 404) {
      toast.error(message);
    }

    return Promise.reject({ 
      success: false, 
      message, 
      status,
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

// Request Interceptor for Public API: Only Inject Guest Cart ID
publicApi.interceptors.request.use(
  (config) => {
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

publicApi.interceptors.response.use(
  (response) => {
    logger.api(response.config.method || 'get', response.config.url || '', response.status);
    return response.data;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const message = error.response?.data?.message || error.message || 'Something went wrong';

    logger.api(error.config?.method || 'error', url, status, error.response?.data);

    if (import.meta.env.DEV) {
      logger.warn(`[Public API] Request failed for ${url}:`, message);
    }
    return Promise.reject({ 
      success: false, 
      message,
      status 
    });
  }
);

export default api;
