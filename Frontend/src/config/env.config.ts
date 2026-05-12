/**
 * Enterprise Production Environment Configuration
 * Centralizes all VITE_ environment variables with strict typing and safety fallbacks.
 */

interface EnvConfig {
  /** Base URL for API calls (e.g., https://api.vasanthicreations.com/api/v1) */
  apiUrl: string;
  /** Base URL for Socket.IO (derived or direct) */
  socketUrl: string;
  /** Environment mode (development, production, test) */
  mode: string;
  /** Whether the app is running in production mode */
  isProduction: boolean;
  /** Razorpay Public Key ID */
  razorpayKeyId: string;
  /** App Name */
  appName: string;
}

const API_VERSION = 'v1';
const DEFAULT_DEV_API = `http://localhost:5000/api/${API_VERSION}`;

const rawApiUrl = import.meta.env.VITE_API_URL || DEFAULT_DEV_API;

/**
 * Normalizes the API URL to ensure it has the version suffix if missing
 */
const normalizeApiUrl = (url: string): string => {
  if (!url) return DEFAULT_DEV_API;
  let normalized = url.endsWith('/') ? url.slice(0, -1) : url;
  if (!normalized.includes('/api/')) {
    normalized = `${normalized}/api/${API_VERSION}`;
  } else if (normalized.endsWith('/api')) {
    normalized = `${normalized}/${API_VERSION}`;
  }
  return normalized;
};

/**
 * Derives the Socket base URL from the API URL
 */
const deriveSocketUrl = (apiUrl: string): string => {
  try {
    const url = new URL(apiUrl);
    return `${url.protocol}//${url.host}`;
  } catch {
    // Fallback logic for non-standard URLs
    return apiUrl.replace(/\/api(\/.*)?$/, '');
  }
};

export const config: EnvConfig = {
  apiUrl: normalizeApiUrl(rawApiUrl),
  socketUrl: import.meta.env.VITE_SOCKET_URL || deriveSocketUrl(rawApiUrl),
  mode: import.meta.env.MODE || 'development',
  isProduction: import.meta.env.PROD || false,
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  appName: import.meta.env.VITE_APP_NAME || 'Vasanthi Creations',
};

// Phase 3: Production Hardening - Log configuration status (without secrets)
if (config.isProduction) {
  console.log(`[Config] Production mode active for ${config.appName}`);
  console.log(`[Config] API Endpoint: ${config.apiUrl}`);
}
