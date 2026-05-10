import apiClient from '../client';

export const WorkflowStatus = {
  ASSIGNED: 'Assigned',
  FABRIC_RECEIVED: 'Fabric Received',
  CUTTING: 'Cutting',
  STITCHING: 'Stitching',
  EMBROIDERY: 'Embroidery',
  TRIAL_READY: 'Trial Ready',
  ALTERATION: 'Alteration',
  QC: 'QC',
  REWORK: 'Rework',
  COMPLETED: 'Completed',
  DELIVERED: 'Delivered'
} as const;

export type WorkflowStatus = typeof WorkflowStatus[keyof typeof WorkflowStatus];

export const TaskPriority = {
  LOW: 'Low',
  NORMAL: 'Normal',
  HIGH: 'High',
  URGENT: 'Urgent',
  CRITICAL: 'Critical'
} as const;

export type TaskPriority = typeof TaskPriority[keyof typeof TaskPriority];

export const EscalationSeverity = {
  NORMAL: 'Normal',
  WARNING: 'Warning',
  HIGH_RISK: 'High Risk',
  BLOCKED: 'Blocked',
  CUSTOMER_DELAYED: 'Customer Delayed'
} as const;

export type EscalationSeverity = typeof EscalationSeverity[keyof typeof EscalationSeverity];

export interface WorkflowTask {
  _id: string;
  taskNumber: string;
  tailorId: string | any;
  orderId?: string;
  customBlouseId?: string;
  taskDescription: string;
  measurementsSnapshot?: any;
  referenceImages: string[];
  attachments: string[];
  dependencies?: string[];
  status: WorkflowStatus;
  priority: TaskPriority;
  escalationSeverity: EscalationSeverity;
  escalationFlags: string[];
  deadline: string;
  expectedCompletionDate: string;
  actualCompletionDate?: string;
  delayDurationMinutes: number;
  isSlaViolated: boolean;
  estimatedHours?: number;
  cuttingStartedAt?: string;
  stitchingStartedAt?: string;
  qcCompletedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  statusTimeline: any[];
  eventHistory: any[];
  tailorNotes: { note: string; createdAt: string }[];
  adminNotes: { note: string; adminId: string; adminModel: string; createdAt: string }[];
  qcNotes: { note: string; qcManagerId: string; createdAt: string }[];
  assignedBy: any;
  assignedByModel: string;
  /** Branch the task belongs to (denormalized from the assigned tailor). */
  branchId?: string | null;
  branchName?: string | null;
  /** Monotonic revision counter for optimistic concurrency. */
  revision?: number;
  createdAt: string;
  updatedAt: string;
}

export const tailorWorkflowService = {
  getAssignedTasks: async (status?: string): Promise<{ success: boolean; data: WorkflowTask[] }> => {
    const params = status ? { status } : {};
    return apiClient.get('/tailor-dashboard/tasks', { params });
  },

  getTaskDetails: async (taskId: string): Promise<{ success: boolean; data: WorkflowTask }> => {
    return apiClient.get(`/tailor-dashboard/tasks/${taskId}`);
  },

  updateStatus: async (taskId: string, status: string, note?: string, expectedRevision?: number): Promise<{ success: boolean; data: WorkflowTask }> => {
    return apiClient.patch(
      `/tailor-dashboard/tasks/${taskId}/status`,
      { status, note, expectedRevision },
    );
  },

  addTailorNote: async (taskId: string, note: string): Promise<{ success: boolean; data: WorkflowTask }> => {
    return apiClient.post(`/tailor-dashboard/tasks/${taskId}/notes`, { note });
  },
};
