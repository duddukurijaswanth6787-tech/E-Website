import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  isProduction: process.env.NODE_ENV === 'production',

  mongo: {
    uri: process.env.MONGO_URI as string,
  },

  redis: {
    // If REDIS_URL is unset/empty, Redis is treated as disabled (app falls back for OTP/caching).
    url: (() => {
      const raw = process.env.REDIS_URL;
      const trimmed = typeof raw === 'string' ? raw.trim() : '';
      return trimmed.length ? trimmed : null;
    })(),
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  mail: {
    enabled: (process.env.MAIL_ENABLED ?? 'true').toLowerCase() === 'true',
    // Support SMTP_* (preferred) or EMAIL_* aliases
    host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587', 10),
    user: process.env.SMTP_USER || process.env.EMAIL_USER || '',
    pass: process.env.SMTP_PASS || process.env.EMAIL_PASS || '',
    from: process.env.MAIL_FROM || 'Vasanthi Creations <noreply@vasanthicreations.com>',
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max: process.env.NODE_ENV === 'development' ? 10000 : parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    authMax: process.env.NODE_ENV === 'development' ? 1000 : parseInt(process.env.AUTH_RATE_LIMIT_MAX || '10', 10),
  },

  upload: {
    maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '5', 10),
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
  },

  log: {
    level: process.env.LOG_LEVEL || 'info',
    dir: process.env.LOG_DIR || 'logs',
  },

  seed: {
    adminName: process.env.SEED_ADMIN_NAME || 'Super Admin',
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@vasanthicreations.com',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345!',
  },
};
