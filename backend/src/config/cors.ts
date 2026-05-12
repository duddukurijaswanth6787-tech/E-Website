import { CorsOptions } from 'cors';
import { env } from './env';
import { logger } from '../common/logger';

/**
 * Enterprise CORS Configuration Layer
 * Synchronizes allowed origins across Express and Socket.IO
 */
export const getAllowedOrigins = (): string[] => {
  const origins = [env.frontendUrl];
  
  if (env.nodeEnv === 'development') {
    origins.push('http://localhost:5173');
    origins.push('http://127.0.0.1:5173');
    origins.push('http://localhost:3000');
  }

  // Phase 3: Sanitize and normalize origins
  return origins.filter(Boolean).map(origin => origin.replace(/\/$/, ''));
};

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();
    
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || (env.nodeEnv === 'development' && origin.startsWith('http://localhost:'))) {
      callback(null, true);
    } else {
      logger.warn(`[Security:CORS] Rejected unauthorized origin: ${origin}`);
      callback(new Error('Strict CORS Production Policy: Origin Not Allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'Accept', 
    'X-Request-ID'
  ],
  exposedHeaders: ['set-cookie'],
  maxAge: 86400, // 24 hours preflight cache
};
