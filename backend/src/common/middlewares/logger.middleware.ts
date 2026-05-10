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
      body: maskSensitiveData(req.body),
      userId: (req as any).user?.userId || (req as any).admin?.role || 'anonymous',
    });
  });

  next();
};
