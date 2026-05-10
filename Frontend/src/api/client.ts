import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

// Create base instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor: Attach Token & Guest Cart ID
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Inject stable guest cart ID
    let guestId = localStorage.getItem('vasanthi_guest_cart_id');
    if (!guestId) {
      guestId = crypto.randomUUID ? crypto.randomUUID() : 'guest_' + Date.now() + Math.random().toString(36).substring(2);
      localStorage.setItem('vasanthi_guest_cart_id', guestId);
    }
    if (config.headers) {
      config.headers['x-guest-cart-id'] = guestId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh & Errors
apiClient.interceptors.response.use(
  (response) => response.data, // Strip axios wrapper
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized errors (Token expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) throw new Error('No refresh token');

        const role = useAuthStore.getState().user?.role;
        let refreshPath = '/auth/refresh';
        if (role && ['admin', 'super_admin'].includes(role)) refreshPath = '/admin-auth/refresh';
        else if (role === 'tailor') refreshPath = '/tailor-auth/refresh';
        else if (role === 'manager') refreshPath = '/manager-auth/refresh';

        const resp = await axios.post(`${apiClient.defaults.baseURL}${refreshPath}`, {
          refreshToken,
        });
        const payload = resp.data?.data ?? resp.data;
        if (!payload?.accessToken || !payload?.refreshToken) throw new Error('Invalid refresh response');

        // Update token in store
        useAuthStore.getState().setTokens(payload.accessToken, payload.refreshToken);

        // Attach new token & retry original request
        originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token failed -> Force logout
        useAuthStore.getState().logout();
        toast.error('Session expired. Please log in again.');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Global Error Handling
    const message = error.response?.data?.message || 'Something went wrong';
    
    // Don't toast for known silent errors (like 404s we want to handle locally)
    if (error.response?.status !== 404 && originalRequest.method !== 'get') {
      toast.error(message);
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
