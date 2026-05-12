import { Worker, Job } from 'bullmq';
import { env } from '../config/env';
import { logger } from '../common/logger';
import { workerConnection } from './cache';
import { QUEUE_NAMES } from './queue.constants';

/**
 * Enterprise Background Worker Matrix
 * Hardened for production with centralized queue naming.
 */
export const initWorkers = () => {
  logger.info('Initializing BullMQ enterprise workers...');

  // 1. Email Worker Processor
  const emailWorker = new Worker(QUEUE_NAMES.EMAIL, async (job: Job) => {
    const { to, subject, html, text, from } = job.data;
    
    logger.info(`[Worker:Email] Dispatching transactional payload to: ${to} | Subject: ${subject}`);
    
    const { getMailTransporter } = await import('../config/mail');
    const transporter = getMailTransporter();

    try {
      await transporter.sendMail({
        from: from || env.mail.from,
        to,
        subject,
        html,
        text,
      });
      logger.info(`[Worker:Email] Successfully delivered email to ${to}`);
    } catch (err: any) {
      logger.error(`[Worker:Email] Delivery failure to ${to}: ${err.message}`);
      // Throwing error triggers BullMQ exponential backoff retry logic
      throw err; 
    }
  }, { connection: workerConnection, concurrency: 5 });

  // 2. WhatsApp Notification Engine Worker
  const whatsappWorker = new Worker(QUEUE_NAMES.WHATSAPP, async (job: Job) => {
    logger.info(`[Worker:WhatsApp] Dispatching dynamic notification payload to: ${job.data.to}`);
    // Simulated WhatsApp logic
  }, { connection: workerConnection, concurrency: 3 });

  // 3. Razorpay Webhook & Payment Reconciliation Worker
  const webhookWorker = new Worker(QUEUE_NAMES.WEBHOOKS, async (job: Job) => {
    const { payload, event } = job.data;
    logger.info(`[Worker:Webhook] Processing ${event} for internal reconciliation...`);
    
    // Lazy load to prevent circular dependencies
    const { razorpayWebhookService } = await import('../modules/webhooks/razorpayWebhook.service');
    
    try {
      // Re-construct buffer if needed, but service takes object
      const rawBuffer = Buffer.from(JSON.stringify(payload));
      await razorpayWebhookService.processWebhook(payload, rawBuffer);
      logger.info(`[Worker:Webhook] ${event} reconciled successfully`);
    } catch (err: any) {
      logger.error(`[Worker:Webhook] Critical failure in ${event} reconciliation: ${err.message}`);
      throw err;
    }
  }, { connection: workerConnection, concurrency: 10 });

  // 4. Business Intelligence & Analytics Worker
  const analyticsWorker = new Worker(QUEUE_NAMES.ANALYTICS, async (job: Job) => {
    logger.debug(`[Worker:Analytics] Processing metric event: ${job.data.type}`);
    // Analytics processing logic
  }, { connection: workerConnection, concurrency: 2 });

  // Error handling for all workers
  const workers = [emailWorker, whatsappWorker, webhookWorker, analyticsWorker];
  workers.forEach(worker => {
    worker.on('failed', (job, err) => {
      logger.error(`[Worker:${worker.name}] Job ${job?.id} failed: ${err.message}`);
    });
    worker.on('error', (err) => {
      logger.error(`[Worker:${worker.name}] CRITICAL: ${err.message}`);
    });
  });
};
