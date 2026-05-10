import { getRedisClient, REDIS_NAMESPACES } from '../../config/redis';

import { logger } from '../../common/logger';

export interface SoftLock {
  workflowId: string;
  branchId: string;
  ownerType: 'admin' | 'manager';
  ownerId: string;
  ownerName?: string;
  expiresAt: number;
  socketId: string;
}

const LOCK_TTL_MS = 15_000;

class LockManager {
  // In-memory fallback for degraded mode
  private localLocks = new Map<string, SoftLock>();
  private localTimers = new Map<string, NodeJS.Timeout>();

  private getLockKey(workflowId: string): string {
    return `${REDIS_NAMESPACES.LOCKS}:${workflowId}`;
  }

  private getSocketKey(socketId: string): string {
    return `${REDIS_NAMESPACES.SESSIONS}:${socketId}:locks`;
  }

  async acquire(params: {
    workflowId: string;
    branchId: string;
    ownerType: 'admin' | 'manager';
    ownerId: string;
    ownerName?: string;
    socketId: string;
    onExpire?: (lock: SoftLock) => void;
    ttlMs?: number;
  }): Promise<{ ok: boolean; lock: SoftLock }> {
    const ttl = params.ttlMs ?? LOCK_TTL_MS;
    const expiresAt = Date.now() + ttl;
    const lock: SoftLock = {
      workflowId: params.workflowId,
      branchId: params.branchId,
      ownerType: params.ownerType,
      ownerId: params.ownerId,
      ownerName: params.ownerName,
      expiresAt,
      socketId: params.socketId,
    };

    try {
      const redis = getRedisClient();
      const key = this.getLockKey(params.workflowId);
      const socketKey = this.getSocketKey(params.socketId);

      // Attempt to acquire lock in Redis
      // Value is the JSON string of the lock
      // NX: Only set if it doesn't exist
      // PX: Set expiry in milliseconds
      const result = await redis.set(key, JSON.stringify(lock), 'PX', ttl, 'NX');

      if (result === 'OK') {
        // Track this lock for the socket so we can release all on disconnect
        await redis.sadd(socketKey, params.workflowId);
        await redis.expire(socketKey, 3600); // 1 hour buffer
        return { ok: true, lock };
      }

      // Acquisition failed, check who owns it
      const existingStr = await redis.get(key);
      if (existingStr) {
        const existing = JSON.parse(existingStr) as SoftLock;
        // If I already own it, update it (RENEW)
        if (existing.ownerId === params.ownerId) {
          await redis.set(key, JSON.stringify(lock), 'PX', ttl);
          return { ok: true, lock };
        }
        return { ok: false, lock: existing };
      }

      // Rare race condition: lock was deleted between SETNX and GET
      return { ok: true, lock };
    } catch (err) {
      logger.warn(`[LockManager] Redis error during acquire, falling back to local: ${(err as Error).message}`);
      return this.acquireLocal(params);
    }
  }

  async release(workflowId: string, ownerId: string): Promise<SoftLock | null> {
    try {
      const redis = getRedisClient();
      const key = this.getLockKey(workflowId);

      const existingStr = await redis.get(key);
      if (!existingStr) return null;

      const existing = JSON.parse(existingStr) as SoftLock;
      if (existing.ownerId !== ownerId) return null;

      // Lua script for atomic delete if owner matches
      const script = `
        if redis.call("get", KEYS[1]) == ARGV[1] then
          return redis.call("del", KEYS[1])
        else
          return 0
        end
      `;
      await redis.eval(script, 1, key, existingStr);
      await redis.srem(this.getSocketKey(existing.socketId), workflowId);

      return existing;
    } catch (err) {
      logger.warn(`[LockManager] Redis error during release, falling back to local: ${(err as Error).message}`);
      return this.releaseLocal(workflowId, ownerId);
    }
  }

  async releaseAllForSocket(socketId: string): Promise<SoftLock[]> {
    const released: SoftLock[] = [];
    try {
      const redis = getRedisClient();
      const socketKey = this.getSocketKey(socketId);
      const workflowIds = await redis.smembers(socketKey);

      for (const wfId of workflowIds) {
        const key = this.getLockKey(wfId);
        const lockStr = await redis.get(key);
        if (lockStr) {
          const lock = JSON.parse(lockStr) as SoftLock;
          if (lock.socketId === socketId) {
            await redis.del(key);
            released.push(lock);
          }
        }
      }
      await redis.del(socketKey);
    } catch (err) {
      logger.warn(`[LockManager] Redis error during releaseAll, falling back to local: ${(err as Error).message}`);
      return this.releaseAllForSocketLocal(socketId);
    }
    return released;
  }

  async get(workflowId: string): Promise<SoftLock | null> {
    try {
      const redis = getRedisClient();
      const lockStr = await redis.get(this.getLockKey(workflowId));
      if (!lockStr) return null;
      return JSON.parse(lockStr) as SoftLock;
    } catch (err) {
      return this.localLocks.get(workflowId) || null;
    }
  }

  // --- Local Fallback Implementation ---

  private acquireLocal(params: any): { ok: boolean; lock: SoftLock } {
    const existing = this.localLocks.get(params.workflowId);
    const now = Date.now();
    const ttl = params.ttlMs ?? LOCK_TTL_MS;

    if (existing && existing.expiresAt > now && existing.ownerId !== params.ownerId) {
      return { ok: false, lock: existing };
    }

    const lock: SoftLock = {
      workflowId: params.workflowId,
      branchId: params.branchId,
      ownerType: params.ownerType,
      ownerId: params.ownerId,
      ownerName: params.ownerName,
      expiresAt: now + ttl,
      socketId: params.socketId,
    };
    this.localLocks.set(params.workflowId, lock);

    const prev = this.localTimers.get(params.workflowId);
    if (prev) clearTimeout(prev);
    const t = setTimeout(() => {
      const cur = this.localLocks.get(params.workflowId);
      if (cur && cur.expiresAt <= Date.now()) {
        this.localLocks.delete(params.workflowId);
        this.localTimers.delete(params.workflowId);
        params.onExpire?.(cur);
      }
    }, ttl + 50);
    this.localTimers.set(params.workflowId, t);

    return { ok: true, lock };
  }

  private releaseLocal(workflowId: string, ownerId: string): SoftLock | null {
    const cur = this.localLocks.get(workflowId);
    if (!cur || cur.ownerId !== ownerId) return null;
    this.localLocks.delete(workflowId);
    const t = this.localTimers.get(workflowId);
    if (t) {
      clearTimeout(t);
      this.localTimers.delete(workflowId);
    }
    return cur;
  }

  private releaseAllForSocketLocal(socketId: string): SoftLock[] {
    const released: SoftLock[] = [];
    for (const [wfId, lock] of this.localLocks.entries()) {
      if (lock.socketId === socketId) {
        this.localLocks.delete(wfId);
        const t = this.localTimers.get(wfId);
        if (t) {
          clearTimeout(t);
          this.localTimers.delete(wfId);
        }
        released.push(lock);
      }
    }
    return released;
  }
}

export const lockManager = new LockManager();
