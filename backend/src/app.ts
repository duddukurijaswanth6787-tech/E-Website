import 'express-async-errors';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { logger } from './common/logger';
import { globalErrorHandler, notFoundHandler } from './common/middlewares/error.middleware';
import { requestLogger } from './common/middlewares/logger.middleware';
import apiRoutes from './routes';
import seoRoutes from './routes/seo.routes';
import { createSwaggerSpec } from './docs/swagger';

const app: Application = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      env.frontendUrl, 
      'http://localhost:5173', 
      'http://127.0.0.1:5173'
    ];
    if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://192.168.1.')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Request Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (env.nodeEnv !== 'test') {
  app.use(requestLogger);
}

// Static Files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger Documentation - passing apiRoutes to the spec generator
const swaggerSpec = createSwaggerSpec(apiRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
  },
  customSiteTitle: 'Vasanthi Creations API Documentation',
}));

// SEO & Sitemap Routes
app.use('/', seoRoutes);

// Health Check
app.get('/api/health', async (_req: Request, res: Response) => {
  const { getMongoStatus } = await import('./config/database');
  const { getRedisStatus } = await import('./config/redis');
  const { socketMetrics } = await import('./realtime/socketServer');
  
  const db = getMongoStatus();
  const redis = getRedisStatus();

  res.status(200).json({
    status: db.status === 'connected' ? 'ok' : 'error',
    server: 'live',
    database: db.status,
    redis: redis.status,
    realtime: socketMetrics.adapterMode === 'redis' ? 'active' : 'degraded',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Realtime Health Endpoint (Phase 3.2)
 * Exposes distributed transport metrics and scaling status.
 */
app.get('/api/health/realtime', async (_req: Request, res: Response) => {
  const { getRedisStatus } = await import('./config/redis');
  const { socketMetrics } = await import('./realtime/socketServer');
  const redis = getRedisStatus();
  
  res.status(200).json({
    socketIo: 'active',
    redisAdapter: redis.status,
    namespaces: Object.keys(socketMetrics.namespaces).length,
    rooms: 'dynamic', 
    activeSockets: socketMetrics.totalConnections,
    mode: socketMetrics.adapterMode === 'redis' ? 'distributed' : 'standalone',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1', apiRoutes);

// 404 Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(globalErrorHandler);

export default app;
