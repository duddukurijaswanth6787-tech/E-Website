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

    // Periodic cleanup of stale database sessions
    setInterval(() => this.cleanupStaleSessions(), 60000); // Every minute
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
      await redis.set(userKey, JSON.stringify(info), 'EX', 90);
      if (branchId) {
        await redis.sadd(this.getBranchKey(branchId), userId);
        await redis.expire(this.getBranchKey(branchId), 3600);
      }

      // Proactively sync online status to MongoDB
      const { WorkforceStatus } = await import('../modules/workforce/workforceStatus.model');
      await WorkforceStatus.findOneAndUpdate(
        { employeeId: userId },
        { 
          $set: { 
            currentStatus: 'online', 
            lastActiveAt: new Date(),
            branchId: branchId ? (branchId as any) : undefined,
            employeeType: role === 'super_admin' || role === 'admin' ? 'admin' : (role as any),
          } 
        },
        { upsert: true }
      );
    } catch (err) {}
  }

  /**
   * Remove a user from presence (e.g. on disconnect).
   */
  async offline(userId: string, branchId: string | null): Promise<void> {
    this.localSessions.delete(userId);
    try {
      const redis = getRedisClient();
      await redis.del(this.getUserKey(userId));
      if (branchId) await redis.srem(this.getBranchKey(branchId), userId);

      const { WorkforceStatus } = await import('../modules/workforce/workforceStatus.model');
      await WorkforceStatus.findOneAndUpdate(
        { employeeId: userId },
        { $set: { currentStatus: 'offline', lastActiveAt: new Date() } }
      );
    } catch (err) {}
  }

  /**
   * Global cleanup of stale sessions.
   * This is critical for enterprise stability to prevent "zombie" online workers.
   */
  async cleanupStaleSessions(): Promise<void> {
    try {
      const { WorkforceStatus } = await import('../modules/workforce/workforceStatus.model');
      const threshold = new Date(Date.now() - 120000); // 2 minutes
      
      const result = await WorkforceStatus.updateMany(
        { 
          currentStatus: { $ne: 'offline' },
          lastActiveAt: { $lt: threshold }
        },
        { $set: { currentStatus: 'offline' } }
      );
      
      if (result.modifiedCount > 0) {
        logger.info(`[Presence] Cleaned up ${result.modifiedCount} stale workforce sessions`);
      }
    } catch (err) {
      logger.error('[Presence] Cleanup failed:', err);
    }
  }

  /**
   * Get all online users in a branch.
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

      if (expired.length > 0) {
        redis.srem(branchKey, ...expired).catch(() => {});
      }

      if (results.length > 0) return results;
    } catch (err) {}

    const now = Date.now();
    return Array.from(this.localSessions.values()).filter(
      (p) => p.branchId === branchId && now - p.lastSeen < 90000
    );
  }
}

export const presenceManager = new PresenceManager();
