import apiClient from '../client';
import type { WorkflowTask } from './tailorWorkflow.service';
import type { PaginatedResponse } from './adminTailor.service';

export const adminWorkflowService = {
  getAllWorkflows: async (params?: { page?: number; limit?: number; status?: string; tailorId?: string; priority?: string }): Promise<PaginatedResponse<{ tasks: WorkflowTask[]; pagination: any }>> => {
    return apiClient.get('/admin/workflows', { params });
  },

  getWorkflowById: async (id: string): Promise<{ status: string; data: WorkflowTask }> => {
    return apiClient.get(`/admin/workflows/${id}`);
  },

  createWorkflow: async (workflowData: any): Promise<{ status: string; data: WorkflowTask }> => {
    return apiClient.post('/admin/workflows', workflowData);
  },

  updateWorkflowStatus: async (
    id: string,
    updates: { status?: string; priority?: string; deadline?: string; tailorId?: string; note?: string; expectedRevision?: number },
  ): Promise<{ status: string; data: WorkflowTask }> => {
    return apiClient.patch(`/admin/workflows/${id}/status`, updates);
  },

  reassignTailor: async (
    id: string,
    data: { tailorId: string; reason: string; override?: boolean; overrideReason?: string; expectedRevision?: number },
  ): Promise<{ status: string; data: WorkflowTask }> => {
    return apiClient.put(`/admin/workflows/${id}/reassign`, data);
  },

  /**
   * Convenience alias used by older UI surfaces (e.g. `AdminWorkflowsPage`).
   * Always sends a default reason since the backend now requires one for
   * audit tracking.
   */
  assignTailor: async (id: string, tailorId: string): Promise<{ status: string; data: WorkflowTask }> => {
    return apiClient.put(`/admin/workflows/${id}/reassign`, {
      tailorId,
      reason: 'Reassigned via Admin Workflows page',
    });
  },

  updateDeadline: async (
    id: string,
    data: { deadline?: string; priority?: string; expectedRevision?: number },
  ): Promise<{ status: string; data: WorkflowTask }> => {
    return apiClient.patch(`/admin/workflows/${id}/deadline`, data);
  },

  escalateWorkflow: async (
    id: string,
    data: { escalationFlags?: string[]; escalationSeverity?: string; reason?: string; expectedRevision?: number },
  ): Promise<{ status: string; data: WorkflowTask }> => {
    return apiClient.patch(`/admin/workflows/${id}/escalate`, data);
  },

  addAdminNote: async (id: string, note: string): Promise<{ status: string; data: WorkflowTask }> => {
    return apiClient.post(`/admin/workflows/${id}/notes`, { note });
  },

  addQcNote: async (id: string, note: string): Promise<{ status: string; data: WorkflowTask }> => {
    return apiClient.post(`/admin/workflows/${id}/qc-notes`, { note });
  }
};
