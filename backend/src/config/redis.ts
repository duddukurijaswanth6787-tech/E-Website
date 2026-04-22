import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../common/logger';

let redisClient: Redis | null = null;
let hasLoggedRedisError = false;

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    if (!env.redis.url) {
      // Lazily create a client only when Redis is configured.
      // Callers should handle connection failures via existing fallbacks.
      throw new Error('Redis is disabled (REDIS_URL is empty/unset)');
    }
    redisClient = new Redis(env.redis.url, {
      retryStrategy: (times) => {
        if (times > 1) {
          return null; // Stop retrying immediately to keep terminal clean
        }
        return 100;
      },
      maxRetriesPerRequest: 0,
      lazyConnect: true,
    });

    redisClient.on('connect', () => logger.info('✅ Redis connected'));
    redisClient.on('error', (err) => {
      // ioredis can emit noisy AggregateError stacks when the host/port is unreachable.
      // Log a single friendly warning and avoid flooding the terminal.
      if (!hasLoggedRedisError) {
        hasLoggedRedisError = true;
        logger.warn(`⚠️  Redis unavailable at ${env.redis.url} — OTP/caching will use fallback behavior`);
      }

      if (env.nodeEnv !== 'production' && env.log.level === 'debug') {
        // Avoid printing massive AggregateError stacks in dev; they add noise but no actionability.
        if ((err as any)?.name !== 'AggregateError') {
          logger.error('❌ Redis error (debug):', err);
        }
      }
    });
    redisClient.on('close', () => logger.warn('⚠️  Redis connection closed'));
  }
  return redisClient;
};

export const connectRedis = async (): Promise<void> => {
  try {
    if (!env.redis.url) {
      logger.info('ℹ️  Redis disabled (REDIS_URL is empty/unset)');
      return;
    }
    const client = getRedisClient();
    await client.connect();
  } catch (error) {
    logger.warn('⚠️  Redis connection failed — OTP and caching features will be limited');
  }
};

export const disconnectRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('Redis disconnected gracefully');
  }
};
