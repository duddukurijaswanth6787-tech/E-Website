import type { Server as HttpServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { env } from '../config/env';
import { logger } from '../common/logger';
import { ERP_NAMESPACES } from './events/erpEvents';
import { registerManagerNamespace } from './handlers/manager';
import { registerTailorNamespace } from './handlers/tailor';
import { registerWorkflowNamespace } from './handlers/workflowNamespace';
import { registerNotificationsNamespace } from './handlers/notifications';
import { registerWorkflowBridges } from './handlers/workflow';
import { createPubSubClients, redisMetrics } from '../config/redis';
import { presenceManager } from './presence';

let ioInstance: IOServer | null = null;

/**
 * Socket Metrics for Realtime Health
 */
export const socketMetrics = {
  adapterMode: 'in-memory' as 'redis' | 'in-memory',
  totalConnections: 0,
  namespaces: {} as Record<string, number>,
};

/**
 * Bootstrap Socket.IO once and attach all namespaces + the domain-event
 * bridge. Called from `server.ts` after the HTTP server is created.
 */
export const initSocketServer = async (httpServer: HttpServer): Promise<IOServer | null> => {
  console.log('[Boot] Initializing Socket.IO realtime engine...');
  if (ioInstance) {
    console.log('[Boot] Returning existing Socket.IO instance');
    return ioInstance;
  }

  try {
    const { corsOptions } = await import('../config/cors');
    
    ioInstance = new IOServer(httpServer, {
      path: '/socket.io',
      cors: corsOptions,
      pingInterval: 20_000,
      pingTimeout: 25_000,
      maxHttpBufferSize: 1e6,
      transports: ['websocket', 'polling'],
    });

    console.log('[Boot] Socket.IO instance created, checking for Redis adapter...');

    // Attempt to attach Redis Adapter for Horizontal Scaling
    if (env.redis.url) {
      // Probe Redis connection before attaching the adapter.
      // If Redis is unreachable we disconnect the clients immediately so
      // ioredis does NOT enter an infinite reconnect loop.
      let pubClient: any;
      let subClient: any;
      try {
        console.log('[Boot] Probing Redis connection...');
        const clients = createPubSubClients();
        pubClient = clients.pubClient;
        subClient = clients.subClient;

        // Try to connect with a 3-second timeout
        await Promise.race([
          Promise.all([pubClient.connect(), subClient.connect()]),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Redis connection probe timeout (3s)')), 3000),
          ),
        ]);

        console.log('[Boot] Creating Redis Adapter instance...');
        const adapter = createAdapter(pubClient, subClient);
        ioInstance!.adapter(adapter);
        socketMetrics.adapterMode = 'redis';
        console.log('🚀 [Boot] Socket.IO Redis Adapter successfully attached');
      } catch (adapterErr: any) {
        console.warn(`⚠️ [Boot] Redis unavailable — Socket.IO using in-memory adapter. (${adapterErr.message})`);
        socketMetrics.adapterMode = 'in-memory';
        // CRITICAL: disconnect clients immediately to prevent ioredis reconnect loop
        if (pubClient) { try { pubClient.disconnect(); } catch (_) {} }
        if (subClient) { try { subClient.disconnect(); } catch (_) {} }
      }
    } else {
      console.log('[Boot] Redis disabled, using local in-memory adapter');
      socketMetrics.adapterMode = 'in-memory';
    }
  } catch (initErr: any) {
    console.error(`❌ [Boot] CRITICAL: Socket.IO initialization failed: ${initErr.message}`);
    // We must NOT throw here if we want the HTTP server to survive
    socketMetrics.adapterMode = 'in-memory';
  }

  // Register Namespaces
  const managerNsp = ioInstance.of(ERP_NAMESPACES.MANAGER);
  const tailorNsp = ioInstance.of(ERP_NAMESPACES.TAILOR);
  const workflowNsp = ioInstance.of(ERP_NAMESPACES.WORKFLOW);
  const notifNsp = ioInstance.of(ERP_NAMESPACES.NOTIFICATIONS);

  registerManagerNamespace(managerNsp);
  registerTailorNamespace(tailorNsp);
  registerWorkflowNamespace(workflowNsp);
  registerNotificationsNamespace(notifNsp);

  // Wire the domain-event bus -> socket fan-out
  registerWorkflowBridges(ioInstance);

  // Track global connections and presence
  ioInstance.on('connection', (socket) => {
    socketMetrics.totalConnections++;
    
    socket.on('disconnect', () => {
      socketMetrics.totalConnections = Math.max(0, socketMetrics.totalConnections - 1);
      
      // Cleanup presence if authenticated
      if (socket.data?.principal) {
        const { id, branchId } = socket.data.principal;
        presenceManager.offline(id, branchId).catch(() => {});
      }
    });
  });

  // Periodically update namespace metrics
  setInterval(() => {
    if (!ioInstance) return;
    const nsps = [managerNsp, tailorNsp, workflowNsp, notifNsp];
    nsps.forEach(n => {
      socketMetrics.namespaces[n.name] = n.sockets.size;
    });
  }, 10_000);

  logger.info(
    `Socket.IO realtime engine initialized at path "/socket.io" with namespaces: ${Object.values(
      ERP_NAMESPACES,
    ).join(', ')}`,
  );
  return ioInstance;
};

export const getIO = (): IOServer | null => ioInstance;
