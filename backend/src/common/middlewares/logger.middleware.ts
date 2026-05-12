import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';
import { generateRequestId } from '../utils/requestId';

const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'passwordHash', 'refreshToken', 'authorization'];

const maskSensitiveData = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  const masked = { ...obj };
  for (const key of Object.keys(masked)) {
    if (SENSITIVE_FIELDS.some((f) => key.toLowerCase().includes(f))) {
      masked[key] = '[REDACTED]';
    }
  }
  return masked;
};

const lastRequestLog: Record<string, number> = {};

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const requestId = generateRequestId();
  (req as any).requestId = requestId;

  // Capture original send/json to intercept response body
  const originalSend = res.send;
  let responseBody: any;

  res.send = function (body: any): Response {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    // Noise Reduction: Skip logging repetitive public GET requests if they happen within 5 seconds
    const logKey = `${req.method}:${req.originalUrl}:${res.statusCode}`;
    const isPublicGet = req.method === 'GET' && (
      req.originalUrl.includes('/public') || 
      req.originalUrl.includes('/hero') ||
      req.originalUrl.includes('/trending')
    );

    const now = Date.now();
    
    if (res.statusCode === 304 && isPublicGet) {
      if (lastRequestLog[logKey] && now - lastRequestLog[logKey] < 5000) {
        return; // Skip noisy repetitive log
      }
      lastRequestLog[logKey] = now;
    }

    let parsedResBody = responseBody;
    if (typeof responseBody === 'string') {
      try {
        parsedResBody = JSON.parse(responseBody);
      } catch {
        parsedResBody = responseBody;
      }
    }

    logger.info({
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      request: {
        params: req.params,
        query: req.query,
        body: maskSensitiveData(req.body),
      },
      response: maskSensitiveData(parsedResBody),
      userId: (req as any).user?.userId || (req as any).admin?.role || 'anonymous',
    });
  });

  next();
};

