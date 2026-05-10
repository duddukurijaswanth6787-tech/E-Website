import { getRedisClient, REDIS_NAMESPACES } from '../config/redis';
import { logger } from '../common/logger';

export interface PresenceInfo {
  userId: string;
  role: string;
  name?: string;
  branchId: string | null;
  lastSeen: number;
}

class PresenceManager {
  // In-memory fallback for testing or degraded mode
  private localSessions = new Map<string, PresenceInfo>();

  constructor() {
    // Periodic cleanup of local fallback storage to prevent memory leaks
    setInterval(() => {
      const now = Date.now();
      for (const [userId, info] of this.localSessions.entries()) {
        if (now - info.lastSeen > 120000) { // 2 minute threshold
          this.localSessions.delete(userId);
        }
      }
    }, 300000); // Every 5 minutes
  }

  private getBranchKey(branchId: string): string {
    return `${REDIS_NAMESPACES.PRESENCE}:branch:${branchId}`;
  }

  private getUserKey(userId: string): string {
    return `${REDIS_NAMESPACES.PRESENCE}:user:${userId}`;
  }

  /**
   * Mark a user as online and part of a branch.
   */
  async heartbeat(userId: string, role: string, branchId: string | null, name?: string): Promise<void> {
    const info: PresenceInfo = { userId, role, branchId, name, lastSeen: Date.now() };
    this.localSessions.set(userId, info);

    try {
      const redis = getRedisClient();
      const userKey = this.getUserKey(userId);
      // Set user info with TTL (90s)
      await redis.set(userKey, JSON.stringify(info), 'EX', 90);
      // Add to branch set if applicable
      if (branchId) {
        await redis.sadd(this.getBranchKey(branchId), userId);
        await redis.expire(this.getBranchKey(branchId), 3600); // 1hr cleanup
      }
    } catch (err) {
      // Swallowed: local fallback is already set
    }
  }

  /**
   * Remove a user from presence (e.g. on disconnect).
   */
  async offline(userId: string, branchId: string | null): Promise<void> {
    this.localSessions.delete(userId);
    try {
      const redis = getRedisClient();
      await redis.del(this.getUserKey(userId));
      if (branchId) {
        await redis.srem(this.getBranchKey(branchId), userId);
      }
    } catch (err) {
      // Swallowed
    }
  }

  /**
   * Get all online users in a branch.
   * Note: This filters out expired users from the branch set.
   */
  async getBranchPresence(branchId: string): Promise<PresenceInfo[]> {
    try {
      const redis = getRedisClient();
      const branchKey = this.getBranchKey(branchId);
      const userIds = await redis.smembers(branchKey);
      
      if (userIds.length === 0) return [];

      const userKeys = userIds.map(uid => this.getUserKey(uid));
      const infoStrings = await redis.mget(...userKeys);
      
      const results: PresenceInfo[] = [];
      const expired: string[] = [];

      infoStrings.forEach((infoStr, index) => {
        if (infoStr) {
          try {
            results.push(JSON.parse(infoStr));
          } catch (e) {
            expired.push(userIds[index]);
          }
        } else {
          expired.push(userIds[index]);
        }
      });

      // Cleanup expired users from the set in background
      if (expired.length > 0) {
        redis.srem(branchKey, ...expired).catch(() => {});
      }

      // If we got results from Redis, return them. 
      // If Redis was empty but we have local sessions, use those.
      if (results.length > 0) return results;
    } catch (err) {
      // Fallback to local below
    }

    // Local fallback: filter by branchId and lastSeen (90s window)
    const now = Date.now();
    return Array.from(this.localSessions.values()).filter(
      (p) => p.branchId === branchId && now - p.lastSeen < 90000
    );
  }
}

export const presenceManager = new PresenceManager();
