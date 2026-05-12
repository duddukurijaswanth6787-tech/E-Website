import { AuditLog, AuditSeverity } from './auditLog.model';
import { getIO } from '../../realtime/socketServer';
import { logger } from '../../common/logger';

export interface LogParams {
  actor: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  module: string;
  action: string;
  entity: {
    type: string;
    id?: string;
  };
  description: string;
  details?: {
    previousValue?: any;
    newValue?: any;
    metadata?: Record<string, any>;
  };
  context?: {
    ipAddress?: string;
    userAgent?: string;
    sessionId?: string;
    branchId?: string;
  };
  severity?: AuditSeverity;
  riskScore?: number;
  status?: 'success' | 'failure' | 'denied';
}

class AuditLogService {
  constructor() {
    // Run cleanup job once a day
    setInterval(() => this.cleanupStaleLogs(), 24 * 60 * 60 * 1000);
  }

  async log(params: LogParams) {
    try {
      const logEntry = await AuditLog.create({
        actorId: params.actor.id,
        actorName: params.actor.name,
        actorEmail: params.actor.email,
        actorRole: params.actor.role,
        module: params.module,
        action: params.action,
        entityType: params.entity.type,
        entityId: params.entity.id,
        description: params.description,
        previousValue: params.details?.previousValue,
        newValue: params.details?.newValue,
        metadata: params.details?.metadata,
        ipAddress: params.context?.ipAddress,
        userAgent: params.context?.userAgent,
        sessionId: params.context?.sessionId,
        branchId: params.context?.branchId,
        severity: params.severity || AuditSeverity.INFO,
        riskScore: params.riskScore || 0,
        status: params.status || 'success',
        timestamp: new Date()
      });

      const io = getIO();
      if (io) {
        io.of('/notifications').emit('NEW_AUDIT_LOG', logEntry);
      }

      return logEntry;
    } catch (error) {
      logger.error('Failed to create audit log:', error);
    }
  }

  async cleanupStaleLogs() {
    try {
      const { env } = await import('../../config/env');
      const retentionDays = env.log.auditRetentionDays;
      const threshold = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
      
      const result = await AuditLog.deleteMany({ timestamp: { $lt: threshold } });
      if (result.deletedCount > 0) {
        logger.info(`[Audit] Archived ${result.deletedCount} stale log entries.`);
      }
    } catch (error) {
      logger.error('Audit log cleanup failed:', error);
    }
  }

  /** Specialized helper for high-risk events */
  async logSecurityEvent(params: LogParams) {
    return this.log({
      ...params,
      severity: params.severity || AuditSeverity.HIGH,
      riskScore: params.riskScore || 50
    });
  }
}

export const auditLogService = new AuditLogService();
