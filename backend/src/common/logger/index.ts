import winston from 'winston';
import util from 'util';
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
  printf((info) => {
    const { timestamp, level, message, stack, requestId, method, url, status, duration, ...details } = info as any;
    const logTime = timestamp || new Date().toISOString();
    
    // Header for the log
    const header = method && url 
      ? `[${logTime}] ${level}: ${method} ${url} ${status} (${duration})`
      : `[${logTime}] ${level}: ${message || ''}`;

    // Deeply formatted details
    const extra = stack || (Object.keys(details).length > 0 ? util.formatWithOptions({ depth: null, colors: true }, details) : '');
    
    return extra ? `${header}\n${extra}` : header;
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

// Add appropriate console logging strategy based on target environment parameters
if (env.nodeEnv !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
  }));
} else {
  // Phase 7: Professional structured production JSON logger ensuring standard out observability for aggregators
  logger.add(new winston.transports.Console({
    format: combine(
      timestamp(),
      errors({ stack: true }),
      winston.format.json()
    ),
  }));
}
