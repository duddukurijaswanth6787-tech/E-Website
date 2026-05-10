import type { Namespace, Socket } from 'socket.io';
import { logger } from '../../common/logger';
import { socketAuthMiddleware, type SocketPrincipal } from '../auth/socketAuth';
import { branchPresenceRoom, branchQcRoom, tailorRoom } from '../rooms/roomNames';
import { presenceManager } from '../presence';
import {
  ERP_CLIENT_INTENTS,
  ERP_EVENTS,
  ERP_EVENT_VERSION,
} from '../events/erpEvents';

const newEventId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

export const registerTailorNamespace = (nsp: Namespace): void => {
  nsp.use(socketAuthMiddleware(['tailor']));

  nsp.on('connection', (socket: Socket) => {
    const principal = socket.data.principal as SocketPrincipal;

    // Tailors only ever join their own personal room and the QC room
    // for their branch (so QC rejection broadcasts can reach them).
    socket.join(tailorRoom(principal.id));
    if (principal.branchId) {
      socket.join(branchQcRoom(principal.branchId));
      socket.join(branchPresenceRoom(principal.branchId));
    }

    // Initial presence heartbeat
    presenceManager.heartbeat(principal.id, principal.role, principal.branchId, principal.name);

    // Setup periodic heartbeats
    const heartbeatInterval = setInterval(() => {
      presenceManager.heartbeat(principal.id, principal.role, principal.branchId, principal.name);
    }, 60000); // 60s heartbeats

    socket.emit(ERP_EVENTS.CONNECTION_READY, {
      principal: {
        type: principal.type,
        id: principal.id,
        name: principal.name,
        role: principal.role,
        branchId: principal.branchId,
      },
      rooms: Array.from(socket.rooms),
      eventVersion: ERP_EVENT_VERSION,
    });

    logger.info(
      `[realtime/${nsp.name}] connected tailor:${principal.id} branch=${principal.branchId ?? 'none'}`,
    );

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

    socket.on('disconnect', () => {
      clearInterval(heartbeatInterval);
      presenceManager.offline(principal.id, principal.branchId);
      logger.info(`[realtime/${nsp.name}] disconnect tailor:${principal.id}`);
    });
  });
};
