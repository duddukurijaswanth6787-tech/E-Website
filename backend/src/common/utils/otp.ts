import crypto from 'crypto';
import { getRedisClient } from '../../config/redis';
import { OTP_TTL_SECONDS } from '../constants';
import { logger } from '../logger';

export const generateOTP = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// In-memory fallback for development environments without Redis
const memoryStore = new Map<string, string>();

export const storeOTP = async (key: string, otp: string): Promise<void> => {
  try {
    const redis = getRedisClient();
    if (redis.status === 'ready' || redis.status === 'connecting') {
      await redis.set(`otp:${key}`, otp, 'EX', OTP_TTL_SECONDS);
      return;
    }
    // Fallback to memory
    memoryStore.set(`otp:${key}`, otp);
    setTimeout(() => memoryStore.delete(`otp:${key}`), OTP_TTL_SECONDS * 1000);
    logger.info(`[DEVSAVE] OTP stored in memory for ${key}: ${otp}`);
  } catch (error) {
    // Graceful fallback on Redis failure
    memoryStore.set(`otp:${key}`, otp);
    setTimeout(() => memoryStore.delete(`otp:${key}`), OTP_TTL_SECONDS * 1000);
    logger.info(`[DEVSAVE] Redis failed, stored in memory for ${key}: ${otp}`);
  }
};

export const verifyOTP = async (key: string, otp: string): Promise<boolean> => {
  // Master OTP for development QA - REMOVED FOR PRODUCTION
  /*
  if (otp === '000000') {
    return true;
  }
  */
  
  // Check memory first (prefer it in dev if Redis is failing)
  const memStored = memoryStore.get(`otp:${key}`);
  if (memStored === otp) {
    memoryStore.delete(`otp:${key}`);
    return true;
  }

  try {
    const redis = getRedisClient();
    const stored = await redis.get(`otp:${key}`);
    if (stored === otp) {
      await redis.del(`otp:${key}`);
      return true;
    }
    return false;
  } catch (error) {
    logger.warn('Redis verify failed, memory also missing');
    return false;
  }
};

export const deleteOTP = async (key: string): Promise<void> => {
  try {
    const redis = getRedisClient();
    await redis.del(`otp:${key}`);
  } catch (error) {
    logger.warn('Failed to delete OTP from Redis:', error);
  }
};

export const getOTPRemainingTTL = async (key: string): Promise<number> => {
  try {
    const redis = getRedisClient();
    return await redis.ttl(`otp:${key}`);
  } catch {
    return -1;
  }
};
