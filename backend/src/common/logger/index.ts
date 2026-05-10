import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { env } from '../../config/env';
import fs from 'fs';

const logDir = path.resolve(env.log.dir);
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format for terminal output
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level}: ${stack || message}`;
  }),
);

// Format for file output (JSON)
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  winston.format.json(),
);

const dailyRotateTransport = (filename: string, level?: string) =>
  new DailyRotateFile({
    dirname: logDir,
    filename: `${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level,
    format: fileFormat,
  });

export const logger = winston.createLogger({
  level: env.log.level || 'info',
  transports: [
    dailyRotateTransport('access', 'info'),
    dailyRotateTransport('error', 'error'),
  ],
  exceptionHandlers: [dailyRotateTransport('exceptions')],
  rejectionHandlers: [dailyRotateTransport('rejections')],
  exitOnError: false,
});

// Add console logging in development
if (env.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
}
