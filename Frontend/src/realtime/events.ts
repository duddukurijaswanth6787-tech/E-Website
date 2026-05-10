/**
 * Mirrors `backend/src/realtime/events/erpEvents.ts` and `events/types.ts`.
 * Keep in sync — bump ERP_EVENT_VERSION on breaking schema changes.
 */

export const ERP_NAMESPACES = {
  MANAGER: '/manager',
  TAILOR: '/tailor',
  WORKFLOW: '/workflow',
  NOTIFICATIONS: '/notifications',
} as const;

export type ErpNamespace = (typeof ERP_NAMESPACES)[keyof typeof ERP_NAMESPACES];

export const ERP_EVENTS = {
  WORKFLOW_UPDATED: 'workflow_updated',
  WORKFLOW_ASSIGNED: 'workflow_assigned',
  WORKFLOW_REASSIGNED: 'workflow_reassigned',
  WORKFLOW_ESCALATED: 'workflow_escalated',
  WORKFLOW_COMPLETED: 'workflow_completed',
  WORKFLOW_QC_REJECTED: 'workflow_qc_rejected',
  WORKFLOW_PRIORITY_CHANGED: 'workflow_priority_changed',
  WORKFLOW_DEADLINE_CHANGED: 'workflow_deadline_changed',
  WORKFLOW_NOTE_ADDED: 'workflow_note_added',
  TAILOR_OVERLOADED: 'tailor_overloaded',
  SLA_VIOLATED: 'sla_violated',
  MANAGER_NOTIFICATION: 'manager_notification',
  TAILOR_NOTIFICATION: 'tailor_notification',
  SYNC_REQUIRED: 'sync_required',
  CONNECTION_READY: 'connection_ready',
  
  // Notification center events
  NOTIFICATION_CREATED: 'notification_created',
  NOTIFICATION_BATCH_UPDATED: 'notification_batch_updated',
  NOTIFICATION_COUNT_UPDATE: 'notification_count_update',
} as const;

export type ErpServerEvent = (typeof ERP_EVENTS)[keyof typeof ERP_EVENTS];

export const ERP_CLIENT_INTENTS = {
  WORKFLOW_SUBSCRIBE: 'workflow_subscribe',
  WORKFLOW_UNSUBSCRIBE: 'workflow_unsubscribe',
  RESYNC_REQUEST: 'resync_request',
  PING: 'ping',
  
  // Notification intents
  NOTIFICATION_MARK_READ: 'notification_mark_read',
  NOTIFICATION_MARK_ALL_READ: 'notification_mark_all_read',
  NOTIFICATION_DELETE: 'notification_delete',
  NOTIFICATION_DELETE_ALL: 'notification_delete_all',
} as const;

export type ErpClientIntent =
  (typeof ERP_CLIENT_INTENTS)[keyof typeof ERP_CLIENT_INTENTS];

/** Standard notification priority levels. */
export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent',
  CRITICAL: 'critical',
} as const;

export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[keyof typeof NOTIFICATION_PRIORITIES];

/** Standard notification categories. */
export const NOTIFICATION_TYPES = {
  WORKFLOW_ASSIGNED: 'workflow_assigned',
  WORKFLOW_REASSIGNED: 'workflow_reassigned',
  WORKFLOW_COMPLETED: 'workflow_completed',
  QC_REJECTED: 'qc_rejected',
  SLA_VIOLATED: 'sla_violated',
  ESCALATION_WARNING: 'escalation_warning',
  DEADLINE_UPDATED: 'deadline_updated',
  TAILOR_OVERLOADED: 'tailor_overloaded',
  SYSTEM_ALERT: 'system_alert',
  ADMIN_ANNOUNCEMENT: 'admin_announcement',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export interface RealtimeResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

export const ERP_EVENT_VERSION = 1;

export type RealtimeActorType = 'admin' | 'manager' | 'tailor' | 'system';

export interface RealtimeActor {
  actorType: RealtimeActorType;
  actorId: string | null;
  actorName?: string;
}

export interface RealtimeEntity {
  entityType: 'workflow' | 'tailor' | 'manager' | 'notification';
  entityId: string;
}

export interface RealtimeEvent<TPayload = unknown> {
  eventId: string;
  type: ErpServerEvent;
  version: number;
  occurredAt: string;
  actor: RealtimeActor;
  branchId: string;
  entity: RealtimeEntity;
  workflowRevision?: number;
  payload: TPayload;
}

export interface WorkflowDiffPayload {
  workflowId: string;
  taskNumber: string;
  status: string;
  previousStatus?: string;
  priority: string;
  tailorId: string | null;
  branchId: string;
  deadline: string | null;
  isSlaViolated: boolean;
  escalationSeverity: string;
  revision: number;
  updatedAt: string;
}

export interface WorkflowAssignedPayload extends WorkflowDiffPayload {
  taskDescription: string;
}

export interface WorkflowReassignedPayload extends WorkflowDiffPayload {
  previousTailorId: string | null;
  reason: string;
}

export interface WorkflowEscalatedPayload extends WorkflowDiffPayload {
  previousSeverity: string;
  reason?: string;
  escalationFlags: string[];
}

export interface WorkflowNoteAddedPayload {
  workflowId: string;
  branchId: string;
  noteType: 'tailor' | 'admin' | 'qc';
  authorId: string;
  authorModel: 'Admin' | 'Tailor' | 'Manager';
  note: string;
  createdAt: string;
  revision: number;
}

export interface SyncRequiredPayload {
  reason: 'reconnect' | 'gap_detected' | 'forced';
  lastKnownRevision?: number;
}

export interface ConnectionReadyPayload {
  principal: {
    type: 'admin' | 'manager' | 'tailor';
    id: string;
    name?: string;
    role: string;
    branchId: string | null;
  };
  rooms: string[];
  eventVersion: number;
}
