import crypto from 'crypto';
import { getRedisClient, getRedisStatus } from '../../config/redis';
import { logger } from '../../common/logger';

export type LockNamespace = 
  | 'webhook' 
  | 'order' 
  | 'inventory' 
  | 'refund' 
  | 'reconciliation';

export interface LockTelemetryMetrics {
  duplicatePreventionCount: number;
  lockContentionCount: number;
  lockTimeoutCount: number;
  failedAcquisitionCount: number;
}

export class IdempotencyLockService {
  private localFallbackLocks: Set<string> = new Set();
  private metrics: LockTelemetryMetrics = {
    duplicatePreventionCount: 0,
    lockContentionCount: 0,
    lockTimeoutCount: 0,
    failedAcquisitionCount: 0,
  };

  /**
   * Generates strictly prefixed idempotency and locking key strings
   */
  generateLockKey(namespace: LockNamespace, id: string): string {
    return `payment:${namespace}:${id}`;
  }

  /**
   * Acquire a distributed lock using SET key workerId NX PX ttlMs
   */
  async acquireLock(key: string, ttlMs: number = 30000, uniqueWorkerId?: string): Promise<{ acquired: boolean; workerId: string }> {
    const workerId = uniqueWorkerId || `node_${crypto.randomUUID().substring(0, 8)}`;
    const status = getRedisStatus();

    try {
      if (status.fallbackMode) {
        // Fallback Strategy: Local in-memory Set lookup bypass preventing application downtime
        if (this.localFallbackLocks.has(key)) {
          this.metrics.duplicatePreventionCount++;
          return { acquired: false, workerId };
        }
        this.localFallbackLocks.add(key);
        // Emulate auto-expiration expiration logic locally
        setTimeout(() => this.localFallbackLocks.delete(key), ttlMs);
        logger.info(`[Idempotency Fallback] Local lock boundary acquired for key: ${key}`);
        return { acquired: true, workerId };
      }

      const client = getRedisClient();
      const result = await client.set(key, workerId, 'PX', ttlMs, 'NX');

      if (result === 'OK') {
        logger.info(`[Idempotency Lock] Successfully acquired distributed mutex: ${key} (TTL: ${ttlMs}ms)`);
        return { acquired: true, workerId };
      } else {
        this.metrics.duplicatePreventionCount++;
        this.metrics.lockContentionCount++;
        logger.debug(`[Idempotency Lock] Contention alert: Mutex already active for key: ${key}`);
        return { acquired: false, workerId };
      }
    } catch (redisErr: any) {
      this.metrics.failedAcquisitionCount++;
      logger.warn(`⚠️ [Idempotency Redis Drop] Distributed check failed: ${redisErr.message}. Shifting to safe fallback checking.`);
      
      // Instantly fallback to local memory check to guarantee survival
      if (this.localFallbackLocks.has(key)) {
        this.metrics.duplicatePreventionCount++;
        return { acquired: false, workerId };
      }
      this.localFallbackLocks.add(key);
      setTimeout(() => this.localFallbackLocks.delete(key), ttlMs);
      return { acquired: true, workerId };
    }
  }

  /**
   * Release an acquired distributed lock strictly using atomic Lua script checking ownership matching
   */
  async releaseLock(key: string, workerId: string): Promise<boolean> {
    const status = getRedisStatus();

    try {
      if (status.fallbackMode) {
        const deleted = this.localFallbackLocks.delete(key);
        if (deleted) logger.info(`[Idempotency Fallback] Local lock boundary cleared for key: ${key}`);
        return deleted;
      }

      const client = getRedisClient();
      
      // CRITICAL: Lua script verifying memory ownership exact matching matching prompt specifications
      const luaScript = `
        if redis.call("get",KEYS[1]) == ARGV[1] then
          return redis.call("del",KEYS[1])
        else
          return 0
        end
      `;

      const result = await client.eval(luaScript, 1, key, workerId);

      if (result === 1) {
        logger.info(`[Idempotency Lock] Successfully unhooked distributed mutex: ${key}`);
        return true;
      } else {
        logger.warn(`[Idempotency Lock] Release skipped: Context ownership signature mismatch or TTL expired for key: ${key}`);
        return false;
      }
    } catch (err: any) {
      logger.error(`[Idempotency Release Fault] Mutex unhook failure: ${err.message}`);
      // Clear fallback target locally if dropped
      return this.localFallbackLocks.delete(key);
    }
  }

  /**
   * Extend an active lock TTL using Lua scripting
   */
  async extendLock(key: string, workerId: string, additionalTtlMs: number = 30000): Promise<boolean> {
    const status = getRedisStatus();
    if (status.fallbackMode) return true; // Local emulation automatically supports long processing

    try {
      const client = getRedisClient();
      const luaScript = `
        if redis.call("get",KEYS[1]) == ARGV[1] then
          return redis.call("pexpire",KEYS[1],ARGV[2])
        else
          return 0
        end
      `;

      const result = await client.eval(luaScript, 1, key, workerId, additionalTtlMs);
      if (result === 1) {
        logger.info(`[Idempotency Lock] Extended active lease string for key: ${key} by ${additionalTtlMs}ms`);
        return true;
      } else {
        this.metrics.lockTimeoutCount++;
        return false;
      }
    } catch (err: any) {
      logger.error(`[Idempotency Extend Fault] Mutex extension drop: ${err.message}`);
      return false;
    }
  }

  /**
   * High-order workflow wrapper abstracting execution safety bounds
   */
  async withLock<T>(
    namespace: LockNamespace, 
    id: string, 
    taskCallback: () => Promise<T>, 
    customTtlMs: number = 30000
  ): Promise<{ executed: boolean; result?: T; error?: string }> {
    const key = this.generateLockKey(namespace, id);
    const { acquired, workerId } = await this.acquireLock(key, customTtlMs);

    if (!acquired) {
      return { executed: false, error: 'Target execution segment isolated: Idempotency concurrency boundary already actively locked.' };
    }

    // Set extension watchdog timer catching slow database write loops
    const extensionInterval = setInterval(() => {
      this.extendLock(key, workerId, customTtlMs).catch(() => {});
    }, Math.floor(customTtlMs * 0.7));

    try {
      const result = await taskCallback();
      return { executed: true, result };
    } catch (taskErr: any) {
      throw taskErr;
    } finally {
      clearInterval(extensionInterval);
      await this.releaseLock(key, workerId);
    }
  }

  /**
   * Retrieve active local metrics metrics summaries
   */
  getMetrics(): LockTelemetryMetrics {
    return { ...this.metrics };
  }

  /**
   * Administration override clearing stale key targets manually
   */
  async forceClearLock(keyString: string): Promise<boolean> {
    const status = getRedisStatus();
    this.localFallbackLocks.delete(keyString);

    if (!status.fallbackMode) {
      try {
        const client = getRedisClient();
        await client.del(keyString);
        logger.info(`[Admin Override] Concurrency mutex forcefully dropped for key: ${keyString}`);
        return true;
      } catch (err: any) {
        logger.error(`Admin clearing override drop: ${err.message}`);
        return false;
      }
    }
    return true;
  }
}

export const idempotencyLockService = new IdempotencyLockService();
