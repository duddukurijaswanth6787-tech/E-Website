import { Request, Response } from 'express';
import crypto from 'crypto';
import { env } from '../../config/env';
import { logger } from '../../common/logger';
import { queues } from '../../scalability/queues';
import { getRedisClient, getRedisStatus } from '../../config/redis';

export class RazorpayWebhookController {
  /**
   * Enterprise-grade webhook gateway handling raw binary verification,
   * replay protection, and BullMQ queue offloading.
   */
  async handleIncomingWebhook(req: Request, res: Response): Promise<void> {
    const requestId = (req as any).id || crypto.randomUUID();
    
    try {
      const signatureHeader = req.headers['x-razorpay-signature'] as string;
      const secret = env.razorpay.webhookSecret;

      // Phase 1: Reject if secret is missing or is still a placeholder (safety check)
      if (!secret || secret === 'your_webhook_secret') {
        logger.error('[Webhook:Security] Critical Configuration Error: RAZORPAY_WEBHOOK_SECRET is missing or unsafe.');
        res.status(500).json({ success: false, error: 'Payment gateway configuration mismatch.' });
        return;
      }

      // Phase 4: Ensure buffer state integrity natively populated by express.raw middleware
      if (!Buffer.isBuffer(req.body)) {
        logger.warn(`[Webhook:${requestId}] Rejected: Request body is not a raw buffer. Check middleware ordering.`);
        res.status(400).json({ success: false, error: 'Invalid payload stream integrity.' });
        return;
      }

      const rawBuffer = req.body;

      // Phase 3: Cryptographic Signature Verification (HMAC SHA256)
      // We perform this BEFORE any parsing or database/redis lookups to thwart injection attacks
      if (!signatureHeader) {
        logger.warn(`[Webhook:${requestId}] Rejected: Missing x-razorpay-signature header.`);
        res.status(401).json({ success: false, error: 'Unauthorized signature handshake.' });
        return;
      }

      const generatedSignature = crypto
        .createHmac('sha256', secret)
        .update(rawBuffer)
        .digest('hex');

      // Strict constant-time cryptographic comparison
      const isSignatureValid = crypto.timingSafeEqual(
        Buffer.from(generatedSignature),
        Buffer.from(signatureHeader)
      );

      if (!isSignatureValid) {
        logger.warn(`[Webhook:${requestId}] Security Alert: Invalid HMAC signature. Attempt logged.`);
        res.status(401).json({ success: false, error: 'Cryptographic signature mismatch.' });
        return;
      }

      // Parse payload object safely from verified raw buffer stream
      const payload = JSON.parse(rawBuffer.toString('utf8'));
      const eventId = payload.id; // Unique Razorpay Event ID
      const eventType = payload.event;

      if (!eventId) {
        logger.warn(`[Webhook:${requestId}] Rejected: Missing event ID in verified payload.`);
        res.status(400).json({ success: false, error: 'Malformed payload content.' });
        return;
      }

      // Phase 5: Replay Attack Protection using Redis
      // We check for duplicate event IDs to ensure idempotent processing and prevent replay attacks
      const replayKey = `webhook:razorpay:replay:${eventId}`;
      const redisStatus = getRedisStatus();
      
      if (!redisStatus.fallbackMode) {
        const redis = getRedisClient();
        // Set key only if it doesn't exist (NX) with 24-hour expiration (EX)
        const isNewEvent = await redis.set(replayKey, 'processed', 'EX', 86400, 'NX');
        
        if (!isNewEvent) {
          logger.info(`[Webhook:${requestId}] Replay Protection: Duplicate event ${eventId} (${eventType}) ignored.`);
          res.status(200).json({ success: true, message: 'Event already processed.' });
          return;
        }
      }

      // Phase 6: BullMQ Queue Offloading
      // Do NOT process heavy logic directly in the webhook route. Offload to background workers.
      if (queues.webhooks) {
        await queues.webhooks.add(`razorpay:${eventType}`, {
          payload,
          eventId,
          eventType,
          receivedAt: new Date().toISOString(),
          requestId
        }, {
          jobId: eventId, // Ensure BullMQ level deduplication as well
          removeOnComplete: true,
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 }
        });

        logger.info(`[Webhook:${requestId}] Success: Event ${eventId} (${eventType}) queued for processing.`);
        
        // Return explicit 200 acknowledgement to Razorpay within < 2 seconds
        res.status(200).json({ success: true, message: 'Event accepted and queued.' });
      } else {
        throw new Error('Scalability queue offline. Unable to offload webhook stream.');
      }

    } catch (err: any) {
      logger.error(`[Webhook:Fatal] Processing drop: ${err.message}`);
      res.status(500).json({ success: false, error: 'Internal pipeline clearance failure.' });
    }
  }
}

export const razorpayWebhookController = new RazorpayWebhookController();
