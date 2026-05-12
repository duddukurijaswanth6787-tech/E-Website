import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnvVars = [
  'MONGO_URI', 
  'JWT_ACCESS_SECRET', 
  'JWT_REFRESH_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'RAZORPAY_WEBHOOK_SECRET',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET_NAME',
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'MAIL_FROM',
  'FRONTEND_URL'
];

requiredEnvVars.forEach((key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  // Phase 2: Strict production origin validation
  if (key === 'FRONTEND_URL' && process.env.NODE_ENV === 'production') {
    if (value.includes('localhost') || value.includes('127.0.0.1')) {
      throw new Error(`CRITICAL: FRONTEND_URL cannot be localhost in production. Deployment blocked.`);
    }
  }

  // Phase 1: Reject placeholder and COMPROMISED values
  const placeholders = [
    'your_webhook_secret', 
    'your_razorpay_secret', 
    'rzp_test_xxxxxxxxxx', 
    'replace_with_', 
    'your-frontend.vercel.app',
    'vc_access_secret_dev_2024', // COMPROMISED
    'Admin@123',                 // COMPROMISED
    'vlbrklliephjxsjj'           // COMPROMISED (Old Gmail App Password)
  ];
  if (placeholders.some(p => value.includes(p))) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`CRITICAL SECURITY ALERT: Compromised or placeholder value detected for ${key} in production. DEPLOYMENT BLOCKED.`);
    } else {
      console.warn(`[Config] ⚠️ Warning: Compromised/Placeholder detected for ${key}. This is unsafe for production.`);
    }
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
    auditRetentionDays: parseInt(process.env.AUDIT_RETENTION_DAYS || '90', 10),
  },

  seed: {
    adminName: process.env.SEED_ADMIN_NAME || 'Super Admin',
    adminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@vasanthicreations.com',
    adminPassword: process.env.SEED_ADMIN_PASSWORD || 'Admin@12345!',
  },

  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    region: process.env.AWS_REGION || 'ap-south-1',
    s3BucketName: process.env.AWS_S3_BUCKET_NAME || 'vs-boutique-images',
  },
};
