import { getRedisClient } from '../../config/redis';
import { logger } from '../logger';

export const cacheService = {
  async get<T>(key: string): Promise<T | null> {
    try {
      const client = getRedisClient();
      const data = await client.get(key);
      if (data) {
        return JSON.parse(data) as T;
      }
    } catch (error) {
      // Silently fail if Redis is down (handled by fallback behavior)
    }
    return null;
  },

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
    try {
      const client = getRedisClient();
      await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      // Silently fail
    }
  },

  async del(key: string): Promise<void> {
    try {
      const client = getRedisClient();
      await client.del(key);
    } catch (error) {
      // Silently fail
    }
  },

  async delByPrefix(prefix: string): Promise<void> {
    try {
      const client = getRedisClient();
      const keys = await client.keys(`${prefix}*`);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch (error) {
      // Silently fail
    }
  },
};
