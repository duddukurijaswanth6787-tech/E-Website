import 'express-async-errors';
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import sanitizeHtml from 'sanitize-html';
import crypto from 'crypto';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import { env } from './config/env';
import { logger } from './common/logger';
import { globalErrorHandler, notFoundHandler } from './common/middlewares/error.middleware';
import { requestLogger } from './common/middlewares/logger.middleware';
import apiRoutes from './routes';
import seoRoutes from './routes/seo.routes';
import razorpayWebhookRoutes from './modules/webhooks/razorpayWebhook.routes';
import { createSwaggerSpec } from './docs/swagger';

const app: Application = express();

// Phase 3: Trust Proxy Hardening (Enables real client IP resolution behind Nginx/Cloudflare/Vercel)
app.set('trust proxy', 1);

// Phase 6: Request Correlation IDs Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.id = crypto.randomUUID();
  res.setHeader('X-Request-ID', req.id);
  next();
});

// 1. Request Timeout Handling Layer
app.use((req: Request, res: Response, next: NextFunction) => {
  req.setTimeout(30000, () => {
    if (!res.headersSent) {
      res.status(408).json({ success: false, error: 'Request Timeout Enforcement' });
    }
  });
  next();
});

// Phase 1 & Phase 2: Strict Environment-Aware Production Security Headers (Hardened Helmet Configuration)
const isProd = env.nodeEnv === 'production';
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: isProd ? ["'self'"] : ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      // Phase 7: S3 Media & CDN Permissive Imagery Boundaries
      imgSrc: [
        "'self'", 
        "data:", 
        "blob:", 
        "https://*.amazonaws.com", // Permit AWS S3 Delivery
        "https://placehold.co"     // Permit Placeholders
      ],
      connectSrc: ["'self'", "ws:", "wss:", "http:", "https:"],
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// 3. Robust CORS Production Policy
import { corsOptions } from './config/cors';
app.use(cors(corsOptions));

// 4. Dynamic Compression Payload Optimization
app.use(compression());

// Phase 5: Layered Route-Specific Rate Limiting Architecture
const generalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  message: { success: false, error: 'General API rate limit exceeded. Connection throttled.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Highly hardened brute-force threshold
  message: { success: false, error: 'Authentication brute-force threshold hit. Access locked temporarily.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50, // Hardened administrative routing cap
  message: { success: false, error: 'Administrative endpoint rate capacity reached.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 200, // Safe fast-acting capacity profile for incoming external handshakes
  message: { success: false, error: 'Webhook processing rate capacity hit.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Enforce route-specific layered constraints explicitly before general fallthrough
app.use('/api/v1/auth', authLimiter);
app.use('/api/v1/admin', adminLimiter);
app.use('/api/v1/webhooks', webhookLimiter);
app.use('/api/', generalLimiter);

// MUST MOUNT RAW WEBHOOKS HERE BEFORE express.json() consumes the request payload buffer!
app.use('/api/payments/razorpay/webhook', express.raw({ type: 'application/json' }), razorpayWebhookRoutes);
app.use('/api/v1/payments/razorpay/webhook', express.raw({ type: 'application/json' }), razorpayWebhookRoutes);

// 6. Request Stream & Payload Parsing Boundaries (Phase 4 Secure Cookie Setup support integrated)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// 7. Core Input Sanitization Sequences (Protection Layer)
app.use(mongoSanitize()); // Prevent MongoDB operator injection payloads ($where, etc.)
app.use(hpp());           // Intercept array-based HTTP parameter pollution attacks

// Phase 9: Modern String Content Sanitization replacing deprecated xss-clean package
app.use((req: Request, _res: Response, next: NextFunction) => {
  const sanitizeTarget = (targetObj: any) => {
    if (targetObj && typeof targetObj === 'object') {
      Object.keys(targetObj).forEach((key) => {
        if (typeof targetObj[key] === 'string') {
          targetObj[key] = sanitizeHtml(targetObj[key], {
            allowedTags: [],
            allowedAttributes: {}
          });
        } else if (typeof targetObj[key] === 'object' && targetObj[key] !== null) {
          sanitizeTarget(targetObj[key]);
        }
      });
    }
  };
  sanitizeTarget(req.body);
  sanitizeTarget(req.query);
  sanitizeTarget(req.params);
  next();
});

// Logging
if (env.nodeEnv !== 'test') {
  app.use(requestLogger);
}

// Static Files - Legacy Fallback (Warn in production)
app.use('/uploads', (req, res, next) => {
  if (env.nodeEnv === 'production') {
    logger.warn(`[Storage:Legacy] Local filesystem access detected for: ${req.url}. Assets should be served from S3.`);
  }
  next();
}, express.static(path.join(__dirname, '../uploads')));

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
