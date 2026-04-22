import apiClient from '../client';

export interface AuditLogNode {
  _id: string;
  admin: { _id: string; name: string; email: string; role: string };
  module: string;
  action: string;
  targetId?: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
  createdAt: string;
}

export const auditLogService = {
  getLogs: async (params?: Record<string, any>) => {
    return apiClient.get<any, { success: boolean, data: AuditLogNode[] | any }>('/audit-logs', { params });
  }
};
