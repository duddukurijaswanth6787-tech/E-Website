import apiClient from '../client';

export type AuditSeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface AuditLogEntry {
  _id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  module: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  severity: AuditSeverity;
  riskScore: number;
  status: 'success' | 'failure' | 'denied';
  branchId?: string;
  metadata?: Record<string, any>;
}

export interface AuditStats {
  severityCounts: { _id: string; count: number }[];
  moduleActivity: { _id: string; count: number }[];
  riskTrend: { _id: string; avgRisk: number; criticalCount: number }[];
}

export const auditLogService = {
  getLogs: async (params?: Record<string, any>) => {
    return apiClient.get<{ logs: AuditLogEntry[]; pagination: any }>('/audit-logs', { params });
  },

  getStats: async () => {
    return apiClient.get<AuditStats>('/audit-logs/stats');
  },

  getLogById: async (id: string) => {
    return apiClient.get<AuditLogEntry>(`/audit-logs/${id}`);
  }
};
