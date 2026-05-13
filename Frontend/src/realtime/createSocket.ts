import { io, type Socket } from 'socket.io-client';
import type { ErpNamespace } from './events';

export interface CreateSocketOptions {
  /** Backend HTTP base URL (without /api/v1). */
  baseUrl: string;
  /** Namespace path (e.g. "/manager"). */
  namespace: ErpNamespace;
  /** Function that always returns the freshest access token. */
  getToken: () => string | null;
}

/**
 * Build a Socket.IO client connected to a specific ERP namespace.
 *
 * - Token is read lazily so refresh-token rotation is picked up on reconnect.
 * - Auto-reconnect with backoff is on by default.
 */
export const createErpSocket = ({
  baseUrl,
  namespace,
  getToken,
}: CreateSocketOptions): Socket => {
  const url = `${baseUrl}${namespace}`;
  const socket = io(url, {
    path: '/socket.io',
    transports: ['websocket'],
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    timeout: 10000,
    withCredentials: true,
    auth: (cb) => {
      cb({ token: getToken() ?? '' });
    },
  });
  return socket;
};

/** Strip `/api/v1` (or any path) off the API base URL to derive the WS base. */
export const deriveSocketBaseUrl = (apiBaseUrl: string): string => {
  try {
    const u = new URL(apiBaseUrl);
    return `${u.protocol}//${u.host}`;
  } catch {
    return apiBaseUrl.replace(/\/api(\/.*)?$/, '');
  }
};
