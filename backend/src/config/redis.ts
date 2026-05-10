import Redis from 'ioredis';
import { env } from './env';
import { logger } from '../common/logger';

let redisClient: Redis | null = null;
let pubClient: Redis | null = null;
let subClient: Redis | null = null;

let hasLoggedRedisError = false;

/**
 * Redis Key Namespaces
 * Standardized prefixing for distributed operational data.
 */
export const REDIS_NAMESPACES = {
  LOCKS: 'vc:realtime:locks',
  PRESENCE: 'vc:realtime:presence',
  SESSIONS: 'vc:realtime:sessions',
} as const;

/**
 * Redis Health Metrics
 */
export const redisMetrics = {
  status: 'disconnected' as 'connected' | 'disconnected' | 'connecting' | 'error',
  reconnectCount: 0,
  lastError: null as string | null,
  lastErrorAt: null as string | null,
};

const MAX_REDIS_RETRIES = 10;

const REDIS_RETRY_STRATEGY = (times: number) => {
  if (times > MAX_REDIS_RETRIES) {
    // Stop retrying — Redis is not available, operate in degraded mode
    return null;
  }
  // Exponential backoff with a cap at 30s
  return Math.min(times * 500, 30_000);
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    if (!env.redis.url) {
      throw new Error('Redis is disabled (REDIS_URL is empty/unset)');
    }
    redisClient = new Redis(env.redis.url, {
      retryStrategy: REDIS_RETRY_STRATEGY,
      maxRetriesPerRequest: null, // Critical for adapter stability
      lazyConnect: true,
    });

    setupRedisEventListeners(redisClient, 'Main');
  }
  return redisClient;
};

export const createPubSubClients = (): { pubClient: Redis; subClient: Redis } => {
  logger.info('[Boot] Creating dedicated Redis Pub/Sub clients...');
  if (!env.redis.url) {
    throw new Error('Redis is disabled');
  }

  if (!pubClient || !subClient) {
    // No retry strategy for pub/sub probe clients — we test connectivity once
    // and immediately disconnect on failure. The main redis client handles retries
    // for data operations after successful startup.
    const config = {
      retryStrategy: () => null,     // zero retries — fail fast
      maxRetriesPerRequest: 0,
      enableOfflineQueue: false,     // don't queue commands if disconnected
      lazyConnect: true,
    };

    logger.info('[Boot] Initializing ioredis Pub/Sub instances...');
    pubClient = new Redis(env.redis.url, config);
    subClient = new Redis(env.redis.url, config);

    setupRedisEventListeners(pubClient, 'Pub');
    setupRedisEventListeners(subClient, 'Sub');
  }

  return { pubClient, subClient };
};

const setupRedisEventListeners = (client: Redis, label: string) => {
  client.on('connect', () => {
    logger.info(`✅ Redis ${label} connected`);
    if (label === 'Main') redisMetrics.status = 'connected';
  });

  client.on('reconnecting', () => {
    if (label === 'Main') {
      redisMetrics.reconnectCount++;
      redisMetrics.status = 'connecting';
      logger.debug(`Redis ${label} reconnecting... (attempt ${redisMetrics.reconnectCount})`);
    }
  });

  client.on('error', (err) => {
    if (label === 'Main') {
      redisMetrics.status = 'error';
      redisMetrics.lastError = err.message;
      redisMetrics.lastErrorAt = new Date().toISOString();
    }

    if (!hasLoggedRedisError) {
      hasLoggedRedisError = true;
      logger.warn(`⚠️  Redis unavailable at ${env.redis.url} — ERP will use degraded/local fallback`);
    }

    if (env.nodeEnv !== 'production' && env.log.level === 'debug') {
      if ((err as any)?.name !== 'AggregateError') {
        logger.error(`❌ Redis ${label} error:`, err);
      }
    }
  });

  client.on('close', () => {
    if (label === 'Main') redisMetrics.status = 'disconnected';
    // Only log the first close per client to avoid log spam
    if (!hasLoggedRedisError) {
      logger.warn(`⚠️  Redis ${label} connection closed — operating in degraded mode`);
    }
  });
};

export const getRedisStatus = () => {
  return {
    ...redisMetrics,
    host: env.redis.url ? new URL(env.redis.url).host : 'disabled',
    pubSub: pubClient?.status === 'ready' ? 'Active' : 'Inactive',
    cache: redisClient?.status === 'ready' ? 'Active' : 'Inactive',
  };
};

export const connectRedis = async (): Promise<void> => {
  console.log('[Boot] Initializing Redis connection sequence...');
  try {
    if (!env.redis.url) {
      console.log('ℹ️  Redis disabled (REDIS_URL is empty/unset)');
      redisMetrics.status = 'disconnected';
      return;
    }
    
    console.log(`[Boot] Connecting to Redis at ${env.redis.url.replace(/:[^:@]+@/, ':****@')}...`);
    const client = getRedisClient();
    
    // Connect with a timeout to prevent hanging the boot sequence
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
    );

    await Promise.race([connectPromise, timeoutPromise]);
    console.log('✅ [Boot] Main Redis client connected');

    // Also connect pub/sub if we're in scaling mode
    console.log('[Boot] Initializing Redis Pub/Sub clients for Socket.IO scaling...');
    const { pubClient, subClient } = createPubSubClients();
    
    await Promise.all([
      pubClient.connect().catch(e => console.warn(`[Boot] Pub client connect failed: ${e.message}`)),
      subClient.connect().catch(e => console.warn(`[Boot] Sub client connect failed: ${e.message}`))
    ]);
    
    console.log('✅ [Boot] Redis Pub/Sub clients initialized');
  } catch (error: any) {
    console.warn(`⚠️ [Boot] Redis connection failed: ${error.message} — ERP will operate in degraded mode`);
    redisMetrics.status = 'error';
    redisMetrics.lastError = error.message;
  }
};

export const disconnectRedis = async (): Promise<void> => {
  const clients = [redisClient, pubClient, subClient];
  for (const client of clients) {
    if (client) {
      try {
        if (['ready', 'connect'].includes(client.status)) {
          await client.quit();
        } else {
          client.disconnect();
        }
      } catch (err: any) {
        // Ignore "Connection is closed" errors during shutdown
      }
    }
  }
  redisClient = null;
  pubClient = null;
  subClient = null;
  logger.info('Redis connections cleaned up gracefully');
};
