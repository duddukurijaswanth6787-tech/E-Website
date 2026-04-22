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
import { createSwaggerSpec } from './docs/swagger';

const app: Application = express();

// ============= SECURITY HEADERS =============
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ============= CORS =============
const allowedOrigins = [
  env.frontendUrl,
  'http://localhost:5173',
  'http://localhost:3000',
  `http://localhost:${env.port}`,
  `http://127.0.0.1:${env.port}`,
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Session-Id'],
}));

// ============= BODY PARSER =============
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============= REQUEST LOGGING =============
if (!env.isProduction) {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// ============= STATIC FILES =============
app.use('/uploads', express.static(path.resolve(env.upload.uploadDir)));

// ============= RATE LIMITING =============
const globalLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith('/api-docs') || req.path === '/api/health',
});
app.use(globalLimiter);

// ============= HEALTH CHECK =============
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Vasanthi Creations API is running',
    version: '1.0.0',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// ============= API ROUTES =============
app.use('/api/v1', apiRoutes);

// ============= SWAGGER DOCS =============
const swaggerSpec = createSwaggerSpec(apiRoutes);
app.get('/api-docs.json', (_req: Request, res: Response) => res.json(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Vasanthi Creations API',
  customCss: `.swagger-ui .topbar { background-color: #A51648; }`,
}));

// ============= 404 HANDLER =============
app.use(notFoundHandler);

// ============= GLOBAL ERROR HANDLER =============
app.use(globalErrorHandler);

export default app;
