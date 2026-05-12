import { Queue, QueueOptions } from 'bullmq';
import { env } from '../config/env';
import { QUEUE_NAMES } from './queue.constants';
import { logger } from '../common/logger';
import { bullmqConnection } from '../config/redis';

const queueConfig: QueueOptions = {
  connection: bullmqConnection,
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

// Phase 4: Canonical Queue Exports
export const queues = {
  email: new Queue(QUEUE_NAMES.EMAIL, queueConfig),
  whatsapp: new Queue(QUEUE_NAMES.WHATSAPP, queueConfig),
  notifications: new Queue(QUEUE_NAMES.NOTIFICATIONS, queueConfig),
  webhooks: new Queue(QUEUE_NAMES.WEBHOOKS, queueConfig),
  cleanup: new Queue(QUEUE_NAMES.CLEANUP, queueConfig),
  analytics: new Queue(QUEUE_NAMES.ANALYTICS, queueConfig),
  images: new Queue(QUEUE_NAMES.IMAGES, queueConfig),
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
