import { EventEmitter } from 'events';
import { logger } from '../../common/logger';
import { NotificationService } from './notification.service';
import { renderNotificationTemplate } from './templates';
import { getMailTransporter } from '../../config/mail';
import { env } from '../../config/env';
import { Notification } from './notification.model';
import { NOTIFICATION_PRIORITIES } from '../../realtime/events/erpEvents';
import { User } from '../users/user.model'; // We'll need user email

/**
 * Enterprise Notification Delivery Queue (Simulation)
 * Decouples multi-channel delivery from the primary request lifecycle.
 * Prepared for future BullMQ / Redis transition.
 */
class NotificationQueue extends EventEmitter {
  constructor() {
    super();
    this.on('notification.created', this.processDelivery.bind(this));
  }

  /**
   * Queue a notification for delivery across multiple channels.
   */
  async enqueue(notificationId: string) {
    // In a real BullMQ implementation, we'd do:
    // await notificationQueue.add('deliver', { notificationId });
    this.emit('notification.created', notificationId);
  }

  private async processDelivery(notificationId: string) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) return;

      logger.debug(`[NotificationQueue] Processing multi-channel delivery for ${notificationId}`);

      // 1. Priority-Based Rules
      // CRITICAL/URGENT -> Email + Socket
      // HIGH -> Socket + (Email if certain type)
      // NORMAL/LOW -> Socket only
      
      const shouldSendEmail = 
        notification.priority === NOTIFICATION_PRIORITIES.CRITICAL ||
        notification.priority === NOTIFICATION_PRIORITIES.URGENT ||
        (notification.priority === NOTIFICATION_PRIORITIES.HIGH && notification.type === 'qc_rejected');

      if (shouldSendEmail && env.mail.enabled) {
        await this.deliverEmail(notification);
      }

      // Add future channels here (WhatsApp, SMS, Push)
      
    } catch (err) {
      logger.error(`[NotificationQueue] Delivery failed for ${notificationId}: ${(err as Error).message}`);
      // Future: Implement retry logic / dead-letter queue here
    }
  }

  private async deliverEmail(notification: any) {
    try {
      // 1. Resolve recipient email
      // Recipient might be Admin, Manager, or Tailor. 
      // In this ERP, we need to check the respective models or a unified User model.
      // For Phase 4.3, we'll try to find the email via the recipientId.
      
      const recipient = await this.resolveRecipientEmail(notification.recipientId, notification.recipientRole);
      if (!recipient?.email) {
        logger.warn(`[NotificationQueue] No email found for recipient ${notification.recipientId}`);
        return;
      }

      // 2. Render Template
      const html = renderNotificationTemplate(notification.type, {
        title: notification.title,
        message: notification.message,
        priority: notification.priority,
        metadata: notification.metadata,
        ctaUrl: `${env.frontendUrl}${notification.link || ''}`,
      });

      // 3. Send via SMTP
      const transporter = getMailTransporter();
      await transporter.sendMail({
        from: `"Vasanthi Creations ERP" <${env.mail.user}>`,
        to: recipient.email,
        subject: `[${notification.priority.toUpperCase()}] ${notification.title}`,
        html,
      });

      // 4. Track Delivery
      await Notification.updateOne(
        { _id: notification._id },
        { $set: { 'deliveredAt.email': new Date() } }
      );

      logger.info(`[NotificationQueue] Email delivered to ${recipient.email} for notification ${notification._id}`);

    } catch (err) {
      logger.error(`[NotificationQueue] Email delivery failed: ${(err as Error).message}`);
      throw err; // Allow processDelivery to log it
    }
  }

  private async resolveRecipientEmail(id: string, role: string) {
    // Dynamic lookup based on role
    const { Admin } = await import('../admins/admin.model');
    const { Manager } = await import('../managers/manager.model');
    const { Tailor } = await import('../tailors/tailor.model');

    switch (role) {
      case 'admin': return Admin.findById(id).select('email').lean();
      case 'manager': return Manager.findById(id).select('email').lean();
      case 'tailor': return Tailor.findById(id).select('email').lean();
      default: return null;
    }
  }
}

export const notificationQueue = new NotificationQueue();
