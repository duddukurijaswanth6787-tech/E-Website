import { createJSONStorage, type StateStorage } from 'zustand/middleware';

const memory = new Map<string, string>();

/** In-memory fallback when localStorage is unavailable (private mode, embedded browsers, etc.) */
const memoryStorage: StateStorage = {
  getItem: (name) => memory.get(name) ?? null,
  setItem: (name, value) => {
    memory.set(name, value);
  },
  removeItem: (name) => {
    memory.delete(name);
  },
};

/**
 * Zustand persist storage that never throws — avoids blank screens when localStorage is blocked.
 */
export function getPersistStorage() {
  if (typeof window === 'undefined') {
    return createJSONStorage(() => memoryStorage);
  }
  try {
    const k = '__vc_storage_test__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    return createJSONStorage(() => window.localStorage);
  } catch {
    return createJSONStorage(() => memoryStorage);
  }
}
