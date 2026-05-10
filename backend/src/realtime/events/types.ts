import { 
  type ErpServerEvent, 
  type NotificationPriority, 
  type NotificationType 
} from './erpEvents';

/** Who triggered a domain event. */
export type RealtimeActorType = 'admin' | 'manager' | 'tailor' | 'system';

export interface RealtimeActor {
  actorType: RealtimeActorType;
  actorId: string | null;
  /** Optional display name for UI activity feeds. */
  actorName?: string;
}

/** Lightweight reference to the entity the event mutates. */
export interface RealtimeEntity {
  entityType: 'workflow' | 'tailor' | 'manager' | 'notification';
  entityId: string;
}

/**
 * Standard envelope every realtime event uses.
 *
 * - `version` lets us evolve payloads without breaking older clients.
 * - `workflowRevision` is the monotonic Mongo `revision` AFTER the change;
 *   used by clients for stale-event rejection and conflict reconciliation.
 * - `branchId` is required so the broadcast layer can scope rooms safely.
 */
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

// ---------------------------------------------------------------------------
// Payload shapes
// ---------------------------------------------------------------------------

/**
 * Minimal Kanban-friendly diff. Keep small to avoid re-render storms.
 * Drawers/detail views fetch full doc on demand.
 */
export interface WorkflowDiffPayload {
  workflowId: string;
  taskNumber: string;
  status: string;
  previousStatus?: string;
  priority: string;
  tailorId: string | null;
  previousTailorId?: string | null;
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

export interface WorkflowLockPayload {
  workflowId: string;
  branchId: string;
  lockedBy: { actorType: RealtimeActorType; actorId: string; actorName?: string } | null;
  expiresAt: string | null;
}

export interface SlaViolatedPayload extends WorkflowDiffPayload {
  delayMinutes: number;
}

export interface TailorOverloadedPayload {
  branchId: string;
  tailorId: string;
  currentAssignedCount: number;
  dailyCapacity: number;
}

export interface NotificationPayload {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
  link?: string;
}

export interface NotificationCountPayload {
  unreadCount: number;
  lastUpdatedAt: string;
}

export interface SyncRequiredPayload {
  reason: 'reconnect' | 'gap_detected' | 'forced';
  lastKnownRevision?: number;
}

export interface PresenceInfo {
  userId: string;
  role: string;
  name?: string;
  branchId: string | null;
  lastSeen: number;
}

export interface PresenceSyncPayload {
  branchId: string;
  onlineUsers: PresenceInfo[];
}
