import { EventEmitter } from 'events';
import { logger } from '../../common/logger';
import { renderNotificationTemplate } from './templates';
import { env } from '../../config/env';
import { Notification } from './notification.model';
import { NOTIFICATION_PRIORITIES } from '../../realtime/events/erpEvents';

/**
 * Enterprise Notification Delivery Queue
 * Decouples multi-channel delivery from the primary request lifecycle.
 * Utilizes the hardened BullMQ async email utility.
 */
class NotificationQueue extends EventEmitter {
  constructor() {
    super();
    this.on('notification.created', this.processDelivery.bind(this));
  }

  /**
   * Queue a notification for delivery.
   */
  async enqueue(notificationId: string) {
    this.emit('notification.created', notificationId);
  }

  private async processDelivery(notificationId: string) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) return;

      logger.debug(`[NotificationQueue] Processing delivery for ${notificationId}`);
      
      const shouldSendEmail = 
        notification.priority === NOTIFICATION_PRIORITIES.CRITICAL ||
        notification.priority === NOTIFICATION_PRIORITIES.URGENT ||
        (notification.priority === NOTIFICATION_PRIORITIES.HIGH && notification.type === 'qc_rejected');

      if (shouldSendEmail && env.mail.enabled) {
        const { sendMail } = await import('../../common/utils/email');
        
        const recipient = await this.resolveRecipientEmail(notification.recipientId.toString(), notification.recipientRole);
        if (recipient?.email) {
          const html = renderNotificationTemplate(notification.type, {
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            metadata: notification.metadata,
            ctaUrl: `${env.frontendUrl}${notification.link || ''}`,
          });

          await sendMail({
            to: recipient.email,
            subject: `[${notification.priority.toUpperCase()}] ${notification.title}`,
            html,
            priority: notification.priority === NOTIFICATION_PRIORITIES.CRITICAL ? 'high' : 'normal'
          });

          await Notification.updateOne(
            { _id: notification._id },
            { $set: { 'deliveredAt.email': new Date() } }
          );
          
          logger.info(`[NotificationQueue] Email enqueued for ${recipient.email} (Notif: ${notification._id})`);
        }
      }
    } catch (err) {
      logger.error(`[NotificationQueue] Delivery failure for ${notificationId}: ${(err as Error).message}`);
    }
  }

  private async resolveRecipientEmail(id: string, role: string) {
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
