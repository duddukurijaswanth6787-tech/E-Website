import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getPersistStorage } from '../lib/safeStorage';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  mobile?: string;
  mustChangePassword?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  setTokens: (token: string, refreshToken: string) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, token, refreshToken) => set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
      }),

      setTokens: (token, refreshToken) => set({
        token,
        refreshToken,
      }),

      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),

      logout: () => set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      }),
    }),
    {
      name: 'vasanthi-auth',
      storage: getPersistStorage(),
    }
  )
);
