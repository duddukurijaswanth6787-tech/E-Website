/**
 * Compatibility Proxy for Legacy Service Layer
 * All new code should import from @/lib/api
 */
import api, { publicApi } from '../lib/api';

export const publicClient = publicApi;
export default api;
