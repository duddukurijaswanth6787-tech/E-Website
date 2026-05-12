import type { Namespace, Socket } from 'socket.io';
import { logger } from '../../common/logger';
import { socketAuthMiddleware, type SocketPrincipal } from '../auth/socketAuth';
import { branchEscalationsRoom, branchManagersRoom, branchQcRoom, branchWorkflowsRoom, managerRoom, workflowRoom, adminGlobalRoom, branchPresenceRoom } from '../rooms/roomNames';
import { lockManager } from '../rooms/lockManager';
import { presenceManager } from '../presence';
import {
  ERP_CLIENT_INTENTS,
  ERP_EVENTS,
  ERP_EVENT_VERSION,
  type RealtimeResponse,
} from '../events/erpEvents';
import type { WorkflowLockPayload } from '../events/types';

const MAX_WORKFLOW_SUBSCRIPTIONS_PER_SOCKET = 50;

import { randomUUID } from 'crypto';

const newEventId = () => randomUUID();

/**
 * Resolve the rooms a manager/admin should auto-join, based on their
 * branchId and role. Server picks rooms; the client cannot ask for arbitrary
 * branches.
 */
const autoJoinRooms = (socket: Socket, principal: SocketPrincipal): string[] => {
  const rooms: string[] = [];
  if (principal.type === 'manager') {
    rooms.push(managerRoom(principal.id));
    if (principal.branchId) {
      rooms.push(
        branchManagersRoom(principal.branchId),
        branchWorkflowsRoom(principal.branchId),
        branchEscalationsRoom(principal.branchId),
        branchQcRoom(principal.branchId),
        branchPresenceRoom(principal.branchId),
      );
    }
  } else if (principal.type === 'admin') {
    rooms.push(adminGlobalRoom());
    if (principal.branchId) {
      rooms.push(
        branchManagersRoom(principal.branchId),
        branchWorkflowsRoom(principal.branchId),
        branchEscalationsRoom(principal.branchId),
        branchQcRoom(principal.branchId),
        branchPresenceRoom(principal.branchId),
      );
    }
  }
  rooms.forEach((r) => socket.join(r));
  return rooms;
};

export const registerManagerNamespace = (nsp: Namespace): void => {
  nsp.use(socketAuthMiddleware(['admin', 'manager']));

  nsp.on('connection', (socket: Socket) => {
    const principal = socket.data.principal as SocketPrincipal;
    const rooms = autoJoinRooms(socket, principal);
    logger.info(
      `[realtime/${nsp.name}] connected ${principal.type}:${principal.id} rooms=${rooms.length}`,
    );

    // Initial presence heartbeat
    presenceManager.heartbeat(principal.id, principal.role, principal.branchId, principal.name);

    // Setup periodic heartbeats
    const heartbeatInterval = setInterval(() => {
      presenceManager.heartbeat(principal.id, principal.role, principal.branchId, principal.name);
    }, 60000); // 60s heartbeats

    // Setup periodic presence broadcasts to the branch (only if branchId exists)
    let broadcastInterval: NodeJS.Timeout | null = null;
    if (principal.branchId) {
      broadcastInterval = setInterval(async () => {
        const onlineUsers = await presenceManager.getBranchPresence(principal.branchId!);
        nsp.to(branchPresenceRoom(principal.branchId!)).emit(ERP_EVENTS.PRESENCE_SYNC, {
          eventId: newEventId(),
          type: ERP_EVENTS.PRESENCE_SYNC,
          version: ERP_EVENT_VERSION,
          occurredAt: new Date().toISOString(),
          actor: { actorType: 'system', actorId: null },
          branchId: principal.branchId!,
          entity: { entityType: 'manager', entityId: 'all' },
          payload: {
            branchId: principal.branchId!,
            onlineUsers,
          },
        });
      }, 30000); // 30s broadcasts
    }

    socket.emit(ERP_EVENTS.CONNECTION_READY, {
      principal: {
        type: principal.type,
        id: principal.id,
        name: principal.name,
        role: principal.role,
        branchId: principal.branchId,
      },
      rooms,
      eventVersion: ERP_EVENT_VERSION,
    });

    // Per-workflow subscription (e.g. detail drawer open)
    socket.on(
      ERP_CLIENT_INTENTS.WORKFLOW_SUBSCRIBE,
      (payload: { workflowId?: string; branchId?: string } = {}, ack?: (response: unknown) => void) => {
        const { workflowId, branchId } = payload;
        if (!workflowId) {
          ack?.({ ok: false, error: 'workflowId required' });
          return;
        }
        // Authorization: manager may only subscribe to workflows in their branch.
        if (
          principal.type === 'manager' &&
          principal.branchId &&
          branchId &&
          branchId !== principal.branchId
        ) {
          ack?.({ ok: false, error: 'branch mismatch' });
          return;
        }

        const subs = Array.from(socket.rooms).filter((r) =>
          r.startsWith('workflow:'),
        );
        if (subs.length >= MAX_WORKFLOW_SUBSCRIPTIONS_PER_SOCKET) {
          ack?.({ ok: false, error: 'subscription limit reached' });
          return;
        }
        socket.join(workflowRoom(workflowId));
        ack?.({ ok: true });
      },
    );

    socket.on(
      ERP_CLIENT_INTENTS.WORKFLOW_UNSUBSCRIBE,
      (payload: { workflowId?: string } = {}, ack?: (response: unknown) => void) => {
        const { workflowId } = payload;
        if (!workflowId) {
          ack?.({ ok: false, error: 'workflowId required' });
          return;
        }
        socket.leave(workflowRoom(workflowId));
        ack?.({ ok: true });
      },
    );

    // Soft-lock: advisory; HTTP revision is the real guard
    socket.on(
      ERP_CLIENT_INTENTS.WORKFLOW_LOCK_REQUEST,
      async (payload: { workflowId?: string; branchId?: string } = {}, ack?: (response: RealtimeResponse) => void) => {
        const { workflowId, branchId } = payload;
        if (!workflowId || !branchId) {
          ack?.({ ok: false, error: 'workflowId and branchId required' });
          return;
        }
        if (
          principal.type === 'manager' &&
          principal.branchId &&
          branchId !== principal.branchId
        ) {
          ack?.({ ok: false, error: 'branch mismatch' });
          return;
        }
        if (principal.type !== 'manager' && principal.type !== 'admin') {
          ack?.({ ok: false, error: 'forbidden' });
          return;
        }

        try {
          const result = await lockManager.acquire({
            workflowId,
            branchId,
            ownerType: principal.type,
            ownerId: principal.id,
            ownerName: principal.name,
            socketId: socket.id,
          });

          const lockPayload: WorkflowLockPayload = {
            workflowId,
            branchId,
            lockedBy: result.ok
              ? {
                  actorType: principal.type,
                  actorId: principal.id,
                  actorName: principal.name,
                }
              : {
                  actorType: result.lock.ownerType,
                  actorId: result.lock.ownerId,
                  actorName: result.lock.ownerName,
                },
            expiresAt: new Date(result.lock.expiresAt).toISOString(),
          };

          nsp
            .to(branchWorkflowsRoom(branchId))
            .emit(ERP_EVENTS.WORKFLOW_LOCK_CHANGED, {
              eventId: newEventId(),
              type: ERP_EVENTS.WORKFLOW_LOCK_CHANGED,
              version: ERP_EVENT_VERSION,
              occurredAt: new Date().toISOString(),
              actor: {
                actorType: principal.type,
                actorId: principal.id,
                actorName: principal.name,
              },
              branchId,
              entity: { entityType: 'workflow', entityId: workflowId },
              payload: lockPayload,
            });

          ack?.(result);
        } catch (err) {
          logger.error(`[realtime] Lock request failed: ${(err as Error).message}`);
          ack?.({ ok: false, error: 'Internal locking error' });
        }
      },
    );

    socket.on(
      ERP_CLIENT_INTENTS.WORKFLOW_LOCK_RELEASE,
      async (payload: { workflowId?: string; branchId?: string } = {}, ack?: (response: RealtimeResponse) => void) => {
        const { workflowId, branchId } = payload;
        if (!workflowId || !branchId) {
          ack?.({ ok: false, error: 'workflowId and branchId required' });
          return;
        }
        try {
          const released = await lockManager.release(workflowId, principal.id);
          if (released) {
            const lockPayload: WorkflowLockPayload = {
              workflowId,
              branchId,
              lockedBy: null,
              expiresAt: null,
            };
            nsp
              .to(branchWorkflowsRoom(branchId))
              .emit(ERP_EVENTS.WORKFLOW_LOCK_CHANGED, {
                eventId: newEventId(),
                type: ERP_EVENTS.WORKFLOW_LOCK_CHANGED,
                version: ERP_EVENT_VERSION,
                occurredAt: new Date().toISOString(),
                actor: {
                  actorType: principal.type,
                  actorId: principal.id,
                  actorName: principal.name,
                },
                branchId,
                entity: { entityType: 'workflow', entityId: workflowId },
                payload: lockPayload,
              });
          }
          ack?.({ ok: !!released });
        } catch (err) {
          logger.error(`[realtime] Lock release failed: ${(err as Error).message}`);
          ack?.({ ok: false, error: 'Internal locking error' });
        }
      },
    );

    // Resync on reconnect — server tells the client to refetch its board.
    socket.on(
      ERP_CLIENT_INTENTS.RESYNC_REQUEST,
      (payload: { lastSeenRevision?: number } = {}) => {
        socket.emit(ERP_EVENTS.SYNC_REQUIRED, {
          eventId: newEventId(),
          type: ERP_EVENTS.SYNC_REQUIRED,
          version: ERP_EVENT_VERSION,
          occurredAt: new Date().toISOString(),
          actor: { actorType: 'system', actorId: null },
          branchId: principal.branchId ?? '',
          entity: { entityType: 'workflow', entityId: 'all' },
          payload: {
            reason: 'reconnect',
            lastKnownRevision: payload.lastSeenRevision,
          },
        });
      },
    );

    socket.on(ERP_CLIENT_INTENTS.PING, (ack?: (response: unknown) => void) => {
      ack?.({ ok: true, ts: Date.now() });
    });

    socket.on('disconnect', async () => {
      // Clear presence intervals
      clearInterval(heartbeatInterval);
      if (broadcastInterval) clearInterval(broadcastInterval);

      // Mark offline
      presenceManager.offline(principal.id, principal.branchId);

      // Release any soft-locks that died with the socket
      try {
        const released = await lockManager.releaseAllForSocket(socket.id);
        released.forEach((lock) => {
          const payload: WorkflowLockPayload = {
            workflowId: lock.workflowId,
            branchId: lock.branchId,
            lockedBy: null,
            expiresAt: null,
          };
          nsp
            .to(branchWorkflowsRoom(lock.branchId))
            .emit(ERP_EVENTS.WORKFLOW_LOCK_CHANGED, {
              eventId: newEventId(),
              type: ERP_EVENTS.WORKFLOW_LOCK_CHANGED,
              version: ERP_EVENT_VERSION,
              occurredAt: new Date().toISOString(),
              actor: { actorType: 'system', actorId: null },
              branchId: lock.branchId,
              entity: { entityType: 'workflow', entityId: lock.workflowId },
              payload,
            });
        });
      } catch (err) {
        logger.error(`[realtime] Error releasing locks on disconnect: ${(err as Error).message}`);
      }
      logger.info(
        `[realtime/${nsp.name}] disconnect ${principal.type}:${principal.id}`,
      );
    });
  });
};
