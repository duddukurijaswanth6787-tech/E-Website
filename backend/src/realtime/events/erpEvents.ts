/**
 * Centralized real-time ERP event constants.
 *
 * Naming rule: snake_case verbs in past tense for domain events the
 * server broadcasts to clients ("workflow_updated"), and present tense
 * for client -> server intents ("workflow_subscribe").
 *
 * Keep this file the single source of truth for both backend emitters
 * and the frontend listener layer (mirror in `Frontend/src/realtime/events.ts`).
 */

export const ERP_NAMESPACES = {
  MANAGER: '/manager',
  TAILOR: '/tailor',
  WORKFLOW: '/workflow',
  NOTIFICATIONS: '/notifications',
} as const;

export type ErpNamespace = (typeof ERP_NAMESPACES)[keyof typeof ERP_NAMESPACES];

/** Server -> client domain events (broadcast to authorized rooms). */
export const ERP_EVENTS = {
  // Workflow lifecycle
  WORKFLOW_UPDATED: 'workflow_updated',
  WORKFLOW_ASSIGNED: 'workflow_assigned',
  WORKFLOW_REASSIGNED: 'workflow_reassigned',
  WORKFLOW_ESCALATED: 'workflow_escalated',
  WORKFLOW_COMPLETED: 'workflow_completed',
  WORKFLOW_QC_REJECTED: 'workflow_qc_rejected',
  WORKFLOW_PRIORITY_CHANGED: 'workflow_priority_changed',
  WORKFLOW_DEADLINE_CHANGED: 'workflow_deadline_changed',
  WORKFLOW_NOTE_ADDED: 'workflow_note_added',

  // Soft locks (advisory)
  WORKFLOW_LOCK_CHANGED: 'workflow_lock_changed',

  // Workload / SLA
  TAILOR_OVERLOADED: 'tailor_overloaded',
  SLA_VIOLATED: 'sla_violated',

  // Notifications
  MANAGER_NOTIFICATION: 'manager_notification',
  TAILOR_NOTIFICATION: 'tailor_notification',

  // Sync / health
  SYNC_REQUIRED: 'sync_required',
  CONNECTION_READY: 'connection_ready',
  PRESENCE_SYNC: 'presence_sync',
  
  // Notification center events
  // Notification center events
  NOTIFICATION_CREATED: 'notification_created',
  NOTIFICATION_BATCH_UPDATED: 'notification_batch_updated',
  NOTIFICATION_COUNT_UPDATE: 'notification_count_update',

  // Collaboration / Occupancy
  WORKFLOW_COLLABORATORS_UPDATE: 'workflow_collaborators_update',

  // Marketing events
  MARKETING_EVENT: 'marketing_event',
} as const;

export type ErpServerEvent = (typeof ERP_EVENTS)[keyof typeof ERP_EVENTS];

/** Client -> server intents. Server is the authority and may reject. */
export const ERP_CLIENT_INTENTS = {
  WORKFLOW_SUBSCRIBE: 'workflow_subscribe',
  WORKFLOW_UNSUBSCRIBE: 'workflow_unsubscribe',
  WORKFLOW_LOCK_REQUEST: 'workflow_lock_request',
  WORKFLOW_LOCK_RELEASE: 'workflow_lock_release',
  
  // Collaboration intents
  WORKFLOW_VIEW_START: 'workflow_view_start',
  WORKFLOW_VIEW_END: 'workflow_view_end',
  WORKFLOW_EDIT_START: 'workflow_edit_start',
  WORKFLOW_EDIT_END: 'workflow_edit_end',
  WORKFLOW_LOCK_OVERRIDE: 'workflow_lock_override',

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

/** Standard acknowledgement response from server. */
export interface RealtimeResponse<T = unknown> {
  ok: boolean;
  data?: T;
  error?: string;
}

/** Current event envelope schema version. Bump on breaking changes. */
export const ERP_EVENT_VERSION = 1;
