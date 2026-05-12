import { Queue } from 'bullmq';
import { env } from '../config/env';
import { logger } from '../common/logger';

const queueConfig = {
  connection: {
    host: env.redis.url ? new URL(env.redis.url).hostname : 'localhost',
    port: env.redis.url ? parseInt(new URL(env.redis.url).port || '6379', 10) : 6379,
    password: env.redis.url ? new URL(env.redis.url).password : undefined,
  },
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // keep for 1 hour
      count: 1000,
    },
    removeOnFail: {
      age: 86400, // keep failed jobs for 24 hours for inspection
    },
  },
};

// Phase 2: Enterprise Distributed Queue Matrix Setup
export const queues = {
  email: new Queue('vc:queue:email', queueConfig),
  whatsapp: new Queue('vc:queue:whatsapp', queueConfig),
  notifications: new Queue('vc:queue:notifications', queueConfig),
  webhooks: new Queue('vc:queue:webhooks', queueConfig),
  cleanup: new Queue('vc:queue:cleanup', queueConfig),
  analytics: new Queue('vc:queue:analytics', queueConfig),
  images: new Queue('vc:queue:images', queueConfig),
};

export const getQueueMetrics = async () => {
  const metrics: Record<string, any> = {};
  if (!env.redis.url) return { status: 'disabled' };

  for (const [name, queue] of Object.entries(queues)) {
    try {
      const counts = await queue.getJobCounts('wait', 'active', 'completed', 'failed', 'delayed');
      metrics[name] = counts;
    } catch (_) {
      metrics[name] = { error: 'unreachable' };
    }
  }
  return metrics;
};

logger.info('Enterprise Distributed BullMQ Scalability Queues configured.');
