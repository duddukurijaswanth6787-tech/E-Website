import { domainEventBus } from './bus/domainEventBus';
import {
  ERP_EVENTS,
  ERP_EVENT_VERSION,
  type ErpServerEvent,
} from './events/erpEvents';
import type {
  RealtimeActor,
  RealtimeEntity,
  RealtimeEvent,
} from './events/types';
import { logger } from '../common/logger';

export { initSocketServer, getIO } from './socketServer';
export { domainEventBus } from './bus/domainEventBus';
export {
  ERP_EVENTS,
  ERP_NAMESPACES,
  ERP_CLIENT_INTENTS,
  ERP_EVENT_VERSION,
} from './events/erpEvents';
export type {
  ErpServerEvent,
  ErpClientIntent,
  ErpNamespace,
} from './events/erpEvents';
export type {
  RealtimeActor,
  RealtimeActorType,
  RealtimeEntity,
  RealtimeEvent,
  WorkflowDiffPayload,
  WorkflowAssignedPayload,
  WorkflowReassignedPayload,
  WorkflowEscalatedPayload,
  WorkflowNoteAddedPayload,
  WorkflowLockPayload,
  SlaViolatedPayload,
  TailorOverloadedPayload,
  NotificationPayload,
  SyncRequiredPayload,
} from './events/types';

let counter = 0;
const newEventId = (): string => {
  counter = (counter + 1) % 1_000_000;
  return `${Date.now().toString(36)}-${counter.toString(36)}`;
};

/**
 * Service-layer emit helper. Domain code calls this after a successful
 * mutation; it wraps the payload in a versioned envelope and publishes
 * to the bus. Socket.IO handlers do the actual fan-out.
 *
 * Failures here MUST NOT break the HTTP request — we log + swallow.
 */
export const emitRealtimeEvent = <TPayload>(params: {
  type: ErpServerEvent;
  branchId: string | null | undefined;
  entity: RealtimeEntity;
  actor: RealtimeActor;
  payload: TPayload;
  workflowRevision?: number;
}): void => {
  try {
    const event: RealtimeEvent<TPayload> = {
      eventId: newEventId(),
      type: params.type,
      version: ERP_EVENT_VERSION,
      occurredAt: new Date().toISOString(),
      actor: params.actor,
      branchId: params.branchId ?? '',
      entity: params.entity,
      workflowRevision: params.workflowRevision,
      payload: params.payload,
    };
    domainEventBus.publish(event);
  } catch (err) {
    logger.error(
      `[realtime] emitRealtimeEvent failed for type=${params.type}: ${(err as Error).message}`,
    );
  }
};

export const RealtimeEventTypes = ERP_EVENTS;
