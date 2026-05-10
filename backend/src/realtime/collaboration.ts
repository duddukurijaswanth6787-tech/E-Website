import { getRedisClient, REDIS_NAMESPACES } from '../config/redis';
import { logger } from '../common/logger';

export interface WorkflowCollaborator {
  userId: string;
  role: string;
  name: string;
  isEditing: boolean;
  lastSeen: number;
}

class WorkflowCollaborationManager {
  private getWorkflowKey(workflowId: string): string {
    return `${REDIS_NAMESPACES.PRESENCE}:workflow:${workflowId}`;
  }

  /**
   * Register a user as a viewer or editor of a workflow.
   */
  async trackPresence(params: {
    workflowId: string;
    userId: string;
    role: string;
    name: string;
    isEditing: boolean;
  }): Promise<void> {
    const { workflowId, userId, role, name, isEditing } = params;
    const redis = getRedisClient();
    const key = this.getWorkflowKey(workflowId);
    
    const collaborator: WorkflowCollaborator = {
      userId,
      role,
      name,
      isEditing,
      lastSeen: Date.now()
    };

    try {
      // Use a hash to store collaborators for this workflow
      await redis.hset(key, userId, JSON.stringify(collaborator));
      // Set TTL to 1 hour (auto-cleanup for inactive workflows)
      await redis.expire(key, 3600);
    } catch (err) {
      logger.error(`[Collaboration] Track failed for ${workflowId}: ${(err as Error).message}`);
    }
  }

  /**
   * Remove a user from a workflow's occupancy list.
   */
  async removePresence(workflowId: string, userId: string): Promise<void> {
    const redis = getRedisClient();
    const key = this.getWorkflowKey(workflowId);
    try {
      await redis.hdel(key, userId);
    } catch (err) {
      logger.error(`[Collaboration] Remove failed for ${workflowId}: ${(err as Error).message}`);
    }
  }

  /**
   * Get all active collaborators for a workflow.
   * Filters out stale sessions (older than 2 minutes).
   */
  async getCollaborators(workflowId: string): Promise<WorkflowCollaborator[]> {
    const redis = getRedisClient();
    const key = this.getWorkflowKey(workflowId);
    try {
      const data = await redis.hgetall(key);
      const now = Date.now();
      const results: WorkflowCollaborator[] = [];
      const expired: string[] = [];

      for (const [userId, infoStr] of Object.entries(data)) {
        const info: WorkflowCollaborator = JSON.parse(infoStr);
        if (now - info.lastSeen < 120000) { // 2 minute threshold
          results.push(info);
        } else {
          expired.push(userId);
        }
      }

      // Cleanup stale entries in background
      if (expired.length > 0) {
        redis.hdel(key, ...expired).catch(() => {});
      }

      return results;
    } catch (err) {
      logger.error(`[Collaboration] Fetch failed for ${workflowId}: ${(err as Error).message}`);
      return [];
    }
  }

  /**
   * Check if a workflow is currently being edited by someone else.
   */
  async getActiveEditor(workflowId: string, excludeUserId?: string): Promise<WorkflowCollaborator | null> {
    const collaborators = await this.getCollaborators(workflowId);
    return collaborators.find(c => c.isEditing && c.userId !== excludeUserId) || null;
  }

  /**
   * Log an administrative lock override for auditing.
   */
  async logOverride(params: {
    workflowId: string;
    actorId: string;
    actorName: string;
    reason: string;
    previousEditorId: string;
    previousEditorName: string;
  }): Promise<void> {
    const { workflowId, actorId, actorName, reason, previousEditorId, previousEditorName } = params;
    
    // In a real system, this would go to a persistent AuditLog collection.
    // For now, we log to enterprise logger and a specialized Redis set for recent overrides.
    const logEntry = {
      ...params,
      timestamp: Date.now()
    };

    logger.warn(`[Collaboration/Audit] Administrative LOCK OVERRIDE on ${workflowId} by ${actorName}. Reason: ${reason}`);

    try {
      const redis = getRedisClient();
      const auditKey = `${REDIS_NAMESPACES.PRESENCE}:audit:overrides`;
      await redis.lpush(auditKey, JSON.stringify(logEntry));
      await redis.ltrim(auditKey, 0, 99); // Keep last 100 overrides
    } catch (err) {
      // Swallowed
    }
  }
}

export const collaborationManager = new WorkflowCollaborationManager();
