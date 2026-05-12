import { Request, Response, NextFunction } from 'express';
import { getRedisClient, isRedisEnabled } from '../config/redis';
import { logger } from '../common/logger';
import { env } from '../config/env';

/**
 * High-Performance API Response Cache Layer (Phase 5)
 * Caches frequently queried operational entities with programmatic invalidation interfaces.
 */
export const cacheResponse = (ttlSeconds: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET' || !isRedisEnabled()) {
      return next();
    }

    const client = getRedisClient();
    // Prefix path mapping for scalable key iteration
    const cacheKey = `vc:api:cache:${req.originalUrl || req.url}`;

    try {
      if (client.status === 'ready') {
        const cachedData = await client.get(cacheKey);
        if (cachedData) {
          res.setHeader('X-Cache', 'HIT');
          res.setHeader('X-Cache-Lookup', 'Redis');
          return res.status(200).json(JSON.parse(cachedData));
        }
      }
    } catch (_) {
      // Degrade gracefully to Database evaluation if memory layer hangs
    }

    // Intercept standard Express JSON dispatch stream to inject key writes
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode === 200 && isRedisEnabled()) {
        try {
          const client = getRedisClient();
          if (client.status === 'ready') {
            client.setex(cacheKey, ttlSeconds, JSON.stringify(body)).catch(() => {});
          }
        } catch (_) {}
      }
      res.setHeader('X-Cache', 'MISS');
      return originalJson(body);
    };

    next();
  };
};

/**
 * Programmatic cache invalidation arrays for schema mutator hooks
 */
export const invalidateCachePattern = async (pattern: string) => {
  if (!isRedisEnabled()) return;
  try {
    const client = getRedisClient();
    if (client.status === 'ready') {
      const keys = await client.keys(`vc:api:cache:${pattern}`);
      if (keys.length > 0) {
        await client.del(...keys);
        logger.debug(`Invalidated ${keys.length} scalability memory buffers for pattern: ${pattern}`);
      }
    }
  } catch (_) {}
};
