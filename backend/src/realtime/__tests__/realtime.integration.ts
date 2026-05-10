/**
 * Integration test for the Socket.IO realtime ERP engine.
 *
 * Exercises:
 *   1. RBAC-safe room joining (manager ↔ branch, tailor ↔ self only)
 *   2. Domain-event fan-out (`workflow_updated`) to the right rooms
 *   3. Cross-branch isolation (manager B never sees branch A events)
 *   4. Soft-lock acquire/release/expire broadcast
 *   5. `sync_required` resync flow on reconnect
 *
 * Auth is stubbed via a custom middleware so we don't need a real DB.
 *
 * Run:
 *   npx ts-node --transpile-only src/realtime/__tests__/realtime.integration.ts
 *
 * Exits with non-zero on any failure.
 */

import assert from 'node:assert/strict';
import http from 'node:http';
import { AddressInfo } from 'node:net';
import { Server as IOServer, Socket as IOSocket } from 'socket.io';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { logger } from '../../common/logger';

import {
  ERP_CLIENT_INTENTS,
  ERP_EVENTS,
  ERP_NAMESPACES,
  ERP_EVENT_VERSION,
} from '../events/erpEvents';
import type {
  RealtimeEvent,
  WorkflowDiffPayload,
  PresenceSyncPayload,
  PresenceInfo,
} from '../events/types';
import { domainEventBus } from '../bus/domainEventBus';
import { registerWorkflowBridges } from '../handlers/workflow';
import { registerNotificationsNamespace } from '../handlers/notifications';
import { registerWorkflowNamespace } from '../handlers/workflowNamespace';
import {
  branchEscalationsRoom,
  branchManagersRoom,
  branchQcRoom,
  branchWorkflowsRoom,
  managerRoom,
  tailorRoom,
  branchPresenceRoom,
} from '../rooms/roomNames';
import { presenceManager } from '../presence';
import { lockManager } from '../rooms/lockManager';
import type { SocketPrincipal, SocketPrincipalType } from '../auth/socketAuth';

// --------------------------------------------------------------------------
// Stub principals: we bypass DB-backed auth and let the test inject identity
// via `auth.token = base64(JSON.stringify(principal))`.
// --------------------------------------------------------------------------
const decodeStubPrincipal = (token: string): SocketPrincipal | null => {
  try {
    const json = Buffer.from(token, 'base64').toString('utf8');
    return JSON.parse(json) as SocketPrincipal;
  } catch {
    return null;
  }
};

const stubAuthMiddleware = (
  allowed: SocketPrincipalType[] | 'any' = 'any',
) => {
  return (socket: IOSocket, next: (err?: Error) => void) => {
    const token = (socket.handshake.auth as { token?: string }).token;
    const principal = token ? decodeStubPrincipal(token) : null;
    if (!principal) return next(new Error('Unauthorized'));
    if (allowed !== 'any' && !allowed.includes(principal.type)) {
      return next(new Error('Forbidden: namespace not allowed for this role'));
    }
    socket.data.principal = principal;
    next();
  };
};

// Minimal copy of the manager namespace logic but using stub auth, so we
// don't need to mock Mongoose models. Mirrors `handlers/manager.ts`.
const registerStubManagerNamespace = (
  io: IOServer,
  ns = ERP_NAMESPACES.MANAGER,
) => {
  const nsp = io.of(ns);
  nsp.use(stubAuthMiddleware(['admin', 'manager']));
  nsp.on('connection', (socket: IOSocket) => {
    const principal = socket.data.principal as SocketPrincipal;
    if (principal.type === 'manager') {
      socket.join(managerRoom(principal.id));
      if (principal.branchId) {
        socket.join(branchManagersRoom(principal.branchId));
        socket.join(branchWorkflowsRoom(principal.branchId));
        socket.join(branchEscalationsRoom(principal.branchId));
        socket.join(branchQcRoom(principal.branchId));
        socket.join(branchPresenceRoom(principal.branchId));
      }
    }

    // Presence integration
    presenceManager.heartbeat(principal.id, principal.role, principal.branchId, principal.name);
    const heartbeatInterval = setInterval(() => {
      presenceManager.heartbeat(principal.id, principal.role, principal.branchId, principal.name);
    }, 60000);

    let broadcastInterval: NodeJS.Timeout | null = null;
    if (principal.branchId) {
      broadcastInterval = setInterval(async () => {
        const onlineUsers = await presenceManager.getBranchPresence(principal.branchId!);
        nsp.to(branchPresenceRoom(principal.branchId!)).emit(ERP_EVENTS.PRESENCE_SYNC, {
          eventId: 'pres',
          type: ERP_EVENTS.PRESENCE_SYNC,
          version: ERP_EVENT_VERSION,
          occurredAt: new Date().toISOString(),
          actor: { actorType: 'system', actorId: null },
          branchId: principal.branchId!,
          entity: { entityType: 'manager', entityId: 'all' },
          payload: { branchId: principal.branchId!, onlineUsers },
        });
      }, 50); // Fast broadcast for tests
    }
    socket.emit(ERP_EVENTS.CONNECTION_READY, {
      principal,
      rooms: Array.from(socket.rooms),
      eventVersion: ERP_EVENT_VERSION,
    });

    socket.on(
      ERP_CLIENT_INTENTS.WORKFLOW_LOCK_REQUEST,
      (payload: { workflowId?: string; branchId?: string } = {}, ack?: (r: unknown) => void) => {
        (async () => {
          const { workflowId, branchId } = payload;
          if (!workflowId || !branchId) return ack?.({ ok: false, error: 'missing' });
          if (
            principal.type === 'manager' &&
            principal.branchId &&
            branchId !== principal.branchId
          )
            return ack?.({ ok: false, error: 'branch mismatch' });
          const result = await lockManager.acquire({
            workflowId,
            branchId,
            ownerType: principal.type === 'admin' ? 'admin' : 'manager',
            ownerId: principal.id,
            ownerName: principal.name,
            socketId: socket.id,
            ttlMs: 250,
            onExpire: (lock) => {
              nsp.to(branchWorkflowsRoom(lock.branchId)).emit(
                ERP_EVENTS.WORKFLOW_LOCK_CHANGED,
                {
                  eventId: 'expire',
                  type: ERP_EVENTS.WORKFLOW_LOCK_CHANGED,
                  version: ERP_EVENT_VERSION,
                  occurredAt: new Date().toISOString(),
                  actor: { actorType: 'system', actorId: null },
                  branchId: lock.branchId,
                  entity: { entityType: 'workflow', entityId: lock.workflowId },
                  payload: {
                    workflowId: lock.workflowId,
                    branchId: lock.branchId,
                    lockedBy: null,
                    expiresAt: null,
                  },
                },
              );
            },
          });
          nsp.to(branchWorkflowsRoom(branchId)).emit(
            ERP_EVENTS.WORKFLOW_LOCK_CHANGED,
            {
              eventId: 'lock',
              type: ERP_EVENTS.WORKFLOW_LOCK_CHANGED,
              version: ERP_EVENT_VERSION,
              occurredAt: new Date().toISOString(),
              actor: { actorType: principal.type, actorId: principal.id },
              branchId,
              entity: { entityType: 'workflow', entityId: workflowId },
              payload: {
                workflowId,
                branchId,
                lockedBy: result.ok
                  ? { actorType: principal.type, actorId: principal.id }
                  : { actorType: result.lock.ownerType, actorId: result.lock.ownerId },
                expiresAt: new Date(result.lock.expiresAt).toISOString(),
              },
            },
          );
          ack?.(result);
        })().catch(err => {
          logger.error('Error handling lock request:', err);
          ack?.({ ok: false, error: 'internal error' });
        });
      },
    );

    socket.on(ERP_CLIENT_INTENTS.RESYNC_REQUEST, () => {
      socket.emit(ERP_EVENTS.SYNC_REQUIRED, {
        eventId: 'sync',
        type: ERP_EVENTS.SYNC_REQUIRED,
        version: ERP_EVENT_VERSION,
        occurredAt: new Date().toISOString(),
        actor: { actorType: 'system', actorId: null },
        branchId: principal.branchId ?? '',
        entity: { entityType: 'workflow', entityId: 'all' },
        payload: { reason: 'reconnect' },
      });
    });

    socket.on('disconnect', () => {
      clearInterval(heartbeatInterval);
      if (broadcastInterval) clearInterval(broadcastInterval);
      presenceManager.offline(principal.id, principal.branchId);
    });
  });
};

const registerStubTailorNamespace = (io: IOServer) => {
  const nsp = io.of(ERP_NAMESPACES.TAILOR);
  nsp.use(stubAuthMiddleware(['tailor']));
  nsp.on('connection', (socket: IOSocket) => {
    const principal = socket.data.principal as SocketPrincipal;
    socket.join(tailorRoom(principal.id));
    if (principal.branchId) {
      socket.join(branchQcRoom(principal.branchId));
      socket.join(branchPresenceRoom(principal.branchId));
    }

    presenceManager.heartbeat(principal.id, principal.role, principal.branchId, principal.name);

    socket.emit(ERP_EVENTS.CONNECTION_READY, {
      principal,
      rooms: Array.from(socket.rooms),
      eventVersion: ERP_EVENT_VERSION,
    });
  });
};

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const tokenFor = (p: SocketPrincipal): string =>
  Buffer.from(JSON.stringify(p)).toString('base64');

const waitForEvent = (
  socket: ClientSocket,
  eventName: string,
  timeoutMs = 1500,
): Promise<unknown> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timeout waiting for ${eventName}`)),
      timeoutMs,
    );
    socket.once(eventName, (data) => {
      clearTimeout(timer);
      resolve(data);
    });
  });

const expectNoEvent = async (
  socket: ClientSocket,
  eventName: string,
  windowMs = 250,
) => {
  let received = false;
  const handler = () => {
    received = true;
  };
  socket.on(eventName, handler);
  await sleep(windowMs);
  socket.off(eventName, handler);
  assert.equal(received, false, `Did not expect "${eventName}" but received it`);
};

// --------------------------------------------------------------------------
// Test runner
// --------------------------------------------------------------------------
async function main() {
  const httpServer = http.createServer();
  const io = new IOServer(httpServer, { path: '/socket.io' });

  registerStubManagerNamespace(io);
  registerStubTailorNamespace(io);
  registerWorkflowNamespace(io.of(ERP_NAMESPACES.WORKFLOW));
  registerNotificationsNamespace(io.of(ERP_NAMESPACES.NOTIFICATIONS));
  registerWorkflowBridges(io);

  await new Promise<void>((res) => httpServer.listen(0, '127.0.0.1', res));
  const { port } = httpServer.address() as AddressInfo;
  const baseUrl = `http://127.0.0.1:${port}`;

  const make = (ns: string, principal: SocketPrincipal): ClientSocket =>
    ioClient(`${baseUrl}${ns}`, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token: tokenFor(principal) },
    });

  const branchA = 'branch-A';
  const branchB = 'branch-B';

  const mgrA: SocketPrincipal = {
    type: 'manager',
    id: 'mgr-a',
    name: 'Mgr A',
    role: 'manager',
    permissions: [],
    branchId: branchA,
  };
  const mgrA2: SocketPrincipal = { ...mgrA, id: 'mgr-a-2', name: 'Mgr A2' };
  const mgrB: SocketPrincipal = {
    type: 'manager',
    id: 'mgr-b',
    name: 'Mgr B',
    role: 'manager',
    permissions: [],
    branchId: branchB,
  };
  const tailorA: SocketPrincipal = {
    type: 'tailor',
    id: 'tlr-1',
    name: 'Tlr',
    role: 'tailor',
    permissions: [],
    branchId: branchA,
    assignedTailorIds: ['tlr-1'],
  };

  const sockets: ClientSocket[] = [];
  let failures = 0;
  const test = async (name: string, fn: () => Promise<void>) => {
    try {
      await fn();
      // eslint-disable-next-line no-console
      console.log(`  ok  - ${name}`);
    } catch (err) {
      failures += 1;
      // eslint-disable-next-line no-console
      console.error(`  FAIL- ${name}: ${(err as Error).message}`);
    }
  };

  // --- Test 1: RBAC namespace gating (tailor cannot connect to /manager) ---
  await test('Tailor cannot connect to /manager namespace', async () => {
    const sock = ioClient(`${baseUrl}${ERP_NAMESPACES.MANAGER}`, {
      path: '/socket.io',
      transports: ['websocket'],
      auth: { token: tokenFor(tailorA) },
      reconnection: false,
    });
    sockets.push(sock);
    const err = await new Promise<Error | null>((resolve) => {
      sock.once('connect_error', (e) => resolve(e as Error));
      sock.once('connect', () => resolve(null));
    });
    assert.ok(err, 'Expected connect_error for tailor on /manager');
    assert.match(err!.message, /Forbidden|Unauthorized/);
  });

  // --- Test 2: Domain-event broadcast hits the right branch ---
  const cMgrA = make(ERP_NAMESPACES.MANAGER, mgrA);
  const cMgrA2 = make(ERP_NAMESPACES.MANAGER, mgrA2);
  const cMgrB = make(ERP_NAMESPACES.MANAGER, mgrB);
  sockets.push(cMgrA, cMgrA2, cMgrB);

  await Promise.all([
    waitForEvent(cMgrA, ERP_EVENTS.CONNECTION_READY),
    waitForEvent(cMgrA2, ERP_EVENTS.CONNECTION_READY),
    waitForEvent(cMgrB, ERP_EVENTS.CONNECTION_READY),
  ]);

  await test('workflow_updated reaches branch-A managers, not branch-B', async () => {
    const diff: WorkflowDiffPayload = {
      workflowId: 'w-1',
      taskNumber: 'WT-2025-0001',
      status: 'Cutting',
      previousStatus: 'Assigned',
      priority: 'Normal',
      tailorId: tailorA.id,
      branchId: branchA,
      deadline: new Date().toISOString(),
      isSlaViolated: false,
      escalationSeverity: 'Normal',
      revision: 2,
      updatedAt: new Date().toISOString(),
    };
    const event: RealtimeEvent<WorkflowDiffPayload> = {
      eventId: 'e1',
      type: ERP_EVENTS.WORKFLOW_UPDATED,
      version: ERP_EVENT_VERSION,
      occurredAt: new Date().toISOString(),
      actor: { actorType: 'manager', actorId: mgrA.id },
      branchId: branchA,
      entity: { entityType: 'workflow', entityId: diff.workflowId },
      workflowRevision: diff.revision,
      payload: diff,
    };
    const recvA = waitForEvent(cMgrA, ERP_EVENTS.WORKFLOW_UPDATED);
    const recvA2 = waitForEvent(cMgrA2, ERP_EVENTS.WORKFLOW_UPDATED);
    const noB = expectNoEvent(cMgrB, ERP_EVENTS.WORKFLOW_UPDATED, 350);
    domainEventBus.publish(event);
    const [a, a2] = await Promise.all([recvA, recvA2]);
    await noB;
    const evA = a as RealtimeEvent<WorkflowDiffPayload>;
    assert.equal(evA.payload.workflowId, 'w-1');
    assert.equal(evA.workflowRevision, 2);
    const evA2 = a2 as RealtimeEvent<WorkflowDiffPayload>;
    assert.equal(evA2.payload.branchId, branchA);
  });

  // --- Test 3: Tailor receives WORKFLOW_ASSIGNED for own room only ---
  const cTailor = make(ERP_NAMESPACES.TAILOR, tailorA);
  sockets.push(cTailor);
  await waitForEvent(cTailor, ERP_EVENTS.CONNECTION_READY);

  await test('Tailor receives workflow_assigned for own tailorId', async () => {
    const diff: WorkflowDiffPayload = {
      workflowId: 'w-2',
      taskNumber: 'WT-2025-0002',
      status: 'Assigned',
      priority: 'Normal',
      tailorId: tailorA.id,
      branchId: branchA,
      deadline: null,
      isSlaViolated: false,
      escalationSeverity: 'Normal',
      revision: 1,
      updatedAt: new Date().toISOString(),
    };
    const event: RealtimeEvent<WorkflowDiffPayload & { taskDescription: string }> = {
      eventId: 'e2',
      type: ERP_EVENTS.WORKFLOW_ASSIGNED,
      version: ERP_EVENT_VERSION,
      occurredAt: new Date().toISOString(),
      actor: { actorType: 'manager', actorId: mgrA.id },
      branchId: branchA,
      entity: { entityType: 'workflow', entityId: diff.workflowId },
      workflowRevision: 1,
      payload: { ...diff, taskDescription: 'Stitch saree blouse' },
    };
    const recv = waitForEvent(cTailor, ERP_EVENTS.WORKFLOW_ASSIGNED);
    domainEventBus.publish(event);
    const ev = (await recv) as RealtimeEvent<WorkflowDiffPayload>;
    assert.equal(ev.payload.tailorId, tailorA.id);
  });

  // --- Test 4: Soft-lock acquire & expire broadcast ---
  await test('Soft lock acquire, then auto-expire broadcasts release', async () => {
    const onceLock = waitForEvent(cMgrA, ERP_EVENTS.WORKFLOW_LOCK_CHANGED);
    cMgrA.emit(
      ERP_CLIENT_INTENTS.WORKFLOW_LOCK_REQUEST,
      { workflowId: 'w-1', branchId: branchA },
      (resp: { ok: boolean }) => {
        assert.equal(resp.ok, true);
      },
    );
    const ev = (await onceLock) as RealtimeEvent<{ lockedBy: { actorId: string } | null }>;
    assert.equal(ev.payload.lockedBy?.actorId, mgrA.id);

    // Wait for auto-expire (TTL 250ms in stub) and confirm release.
    const onceRelease = waitForEvent(cMgrA, ERP_EVENTS.WORKFLOW_LOCK_CHANGED, 1500);
    const released = (await onceRelease) as RealtimeEvent<{ lockedBy: unknown }>;
    assert.equal(released.payload.lockedBy, null);
  });

  // --- Test 5: Resync flow on reconnect ---
  await test('Manager receives sync_required on RESYNC_REQUEST', async () => {
    const recv = waitForEvent(cMgrA, ERP_EVENTS.SYNC_REQUIRED);
    cMgrA.emit(ERP_CLIENT_INTENTS.RESYNC_REQUEST, { lastSeenRevision: 1 });
    const ev = (await recv) as RealtimeEvent<{ reason: string }>;
    assert.equal(ev.payload.reason, 'reconnect');
  });

  // --- Test 6: Presence Sync ---
  await test('Managers receive presence_sync with online colleagues', async () => {
    // Wait for the fast periodic broadcast (50ms)
    const recv = (await waitForEvent(cMgrA, ERP_EVENTS.PRESENCE_SYNC)) as RealtimeEvent<PresenceSyncPayload>;
    const onlineIds = recv.payload.onlineUsers.map((u: PresenceInfo) => u.userId);
    
    // mgrA, mgrA2, and tailorA should all be in the branch-A presence sync
    assert.ok(onlineIds.includes(mgrA.id), 'mgrA missing from presence');
    assert.ok(onlineIds.includes(mgrA2.id), 'mgrA2 missing from presence');
    assert.ok(onlineIds.includes(tailorA.id), 'tailorA missing from presence');
    assert.ok(!onlineIds.includes(mgrB.id), 'mgrB should NOT be in branch A presence');
  });

  // Cleanup
  sockets.forEach((s) => s.disconnect());
  await new Promise<void>((res) => io.close(() => res()));
  httpServer.close();

  if (failures > 0) {
    // eslint-disable-next-line no-console
    console.error(`\n${failures} test(s) failed`);
    process.exit(1);
  }
  // eslint-disable-next-line no-console
  console.log(`\nAll realtime integration tests passed.`);
  process.exit(0);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal test error:', err);
  process.exit(1);
});
