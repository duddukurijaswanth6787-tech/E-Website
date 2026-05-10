import type { Server } from 'socket.io';
import { logger } from '../../common/logger';
import { domainEventBus } from '../bus/domainEventBus';
import {
  branchEscalationsRoom,
  branchManagersRoom,
  branchQcRoom,
  branchWorkflowsRoom,
  fanOutForWorkflow,
  tailorRoom,
  workflowRoom,
} from '../rooms/roomNames';
import { ERP_EVENTS, ERP_NAMESPACES } from '../events/erpEvents';
import type { RealtimeEvent } from '../events/types';

/**
 * Subscribe the Socket.IO transport to the domain event bus.
 *
 * Mapping rule: each domain event has a primary namespace and a list
 * of rooms. Branch rooms are always preferred over global broadcasts.
 */
export const registerWorkflowBridges = (io: Server): void => {
  const managerNsp = io.of(ERP_NAMESPACES.MANAGER);
  const tailorNsp = io.of(ERP_NAMESPACES.TAILOR);
  const workflowNsp = io.of(ERP_NAMESPACES.WORKFLOW);
  const notifNsp = io.of(ERP_NAMESPACES.NOTIFICATIONS);

  domainEventBus.onAny((event: RealtimeEvent<unknown>) => {
    try {
      switch (event.type) {
        case ERP_EVENTS.WORKFLOW_UPDATED:
        case ERP_EVENTS.WORKFLOW_PRIORITY_CHANGED:
        case ERP_EVENTS.WORKFLOW_DEADLINE_CHANGED:
        case ERP_EVENTS.WORKFLOW_COMPLETED: {
          const payload = event.payload as { workflowId: string; tailorId?: string | null };
          const rooms = fanOutForWorkflow({
            branchId: event.branchId,
            workflowId: payload.workflowId,
            tailorId: payload.tailorId,
          });
          // Manager namespace gets the workflow + branch rooms
          rooms.forEach((r) => managerNsp.to(r).emit(event.type, event));
          // Tailor namespace gets only the tailor's room
          if (payload.tailorId) {
            tailorNsp.to(tailorRoom(payload.tailorId)).emit(event.type, event);
          }
          // Workflow namespace gets the per-workflow room
          workflowNsp.to(workflowRoom(payload.workflowId)).emit(event.type, event);
          break;
        }

        case ERP_EVENTS.WORKFLOW_ASSIGNED: {
          const payload = event.payload as { workflowId: string; tailorId?: string | null };
          managerNsp
            .to(branchWorkflowsRoom(event.branchId))
            .emit(event.type, event);
          managerNsp
            .to(branchManagersRoom(event.branchId))
            .emit(event.type, event);
          if (payload.tailorId) {
            tailorNsp.to(tailorRoom(payload.tailorId)).emit(event.type, event);
            // also notification namespace for in-app toasts
            notifNsp.to(tailorRoom(payload.tailorId)).emit(event.type, event);
          }
          break;
        }

        case ERP_EVENTS.WORKFLOW_REASSIGNED: {
          const payload = event.payload as {
            workflowId: string;
            tailorId?: string | null;
            previousTailorId?: string | null;
          };
          managerNsp
            .to(branchWorkflowsRoom(event.branchId))
            .emit(event.type, event);
          if (payload.previousTailorId) {
            tailorNsp
              .to(tailorRoom(payload.previousTailorId))
              .emit(event.type, event);
          }
          if (payload.tailorId) {
            tailorNsp.to(tailorRoom(payload.tailorId)).emit(event.type, event);
            notifNsp.to(tailorRoom(payload.tailorId)).emit(event.type, event);
          }
          break;
        }

        case ERP_EVENTS.WORKFLOW_ESCALATED: {
          managerNsp
            .to(branchEscalationsRoom(event.branchId))
            .emit(event.type, event);
          managerNsp
            .to(branchWorkflowsRoom(event.branchId))
            .emit(event.type, event);
          break;
        }

        case ERP_EVENTS.WORKFLOW_QC_REJECTED: {
          const payload = event.payload as { workflowId: string; tailorId?: string | null };
          managerNsp.to(branchQcRoom(event.branchId)).emit(event.type, event);
          managerNsp
            .to(branchWorkflowsRoom(event.branchId))
            .emit(event.type, event);
          if (payload.tailorId) {
            tailorNsp.to(tailorRoom(payload.tailorId)).emit(event.type, event);
            notifNsp.to(tailorRoom(payload.tailorId)).emit(event.type, event);
          }
          break;
        }

        case ERP_EVENTS.WORKFLOW_NOTE_ADDED: {
          const payload = event.payload as { workflowId: string };
          workflowNsp.to(workflowRoom(payload.workflowId)).emit(event.type, event);
          managerNsp
            .to(branchWorkflowsRoom(event.branchId))
            .emit(event.type, event);
          break;
        }

        case ERP_EVENTS.SLA_VIOLATED: {
          managerNsp
            .to(branchEscalationsRoom(event.branchId))
            .emit(event.type, event);
          managerNsp
            .to(branchWorkflowsRoom(event.branchId))
            .emit(event.type, event);
          break;
        }

        case ERP_EVENTS.TAILOR_OVERLOADED: {
          managerNsp
            .to(branchManagersRoom(event.branchId))
            .emit(event.type, event);
          break;
        }

        case ERP_EVENTS.MANAGER_NOTIFICATION: {
          notifNsp
            .to(branchManagersRoom(event.branchId))
            .emit(event.type, event);
          break;
        }

        case ERP_EVENTS.TAILOR_NOTIFICATION: {
          const payload = event.payload as { audience?: string; tailorId?: string };
          if (payload.tailorId) {
            notifNsp.to(tailorRoom(payload.tailorId)).emit(event.type, event);
          }
          break;
        }

        default: {
          // Unhandled event type — log once at debug to surface drift.
          logger.debug(
            `[realtime] unmapped event type "${event.type}" — skipping`,
          );
        }
      }
    } catch (err) {
      logger.error(
        `[realtime] error broadcasting event ${event.type}: ${(err as Error).message}`,
      );
    }
  });
};
