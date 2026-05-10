import { Types } from 'mongoose';
import { Notification, INotification } from './notification.model';
import { logger } from '../../common/logger';
import { ERP_EVENTS, ERP_EVENT_VERSION } from '../../realtime/events/erpEvents';
import { getIO } from '../../realtime/socketServer';
import { notificationRoom } from '../../realtime/rooms/roomNames';
import { notificationQueue } from './notification.queue';

export class NotificationService {
  /**
   * Create a notification and trigger realtime delivery.
   */
  static async createNotification(params: {
    recipientId: string | Types.ObjectId;
    recipientRole: 'admin' | 'manager' | 'tailor';
    branchId?: string | Types.ObjectId | null;
    type: string;
    priority: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
    link?: string;
    channels?: ('socket' | 'email' | 'push')[];
  }): Promise<INotification> {
    try {
      const notification = await Notification.create({
        ...params,
        isRead: false,
        deliveredAt: {},
      });

      // Realtime fanout if 'socket' channel is active
      if (!params.channels || params.channels.includes('socket')) {
        await this.deliverRealtime(notification);
      }

      // Enqueue for multi-channel expansion (Email, Push, etc.)
      await notificationQueue.enqueue(String(notification._id));

      return notification;
    } catch (err) {
      logger.error(`[NotificationService] Create failed: ${(err as Error).message}`);
      throw err;
    }
  }

  /**
   * Broadcast notification via Socket.IO to the recipient's private room.
   */
  private static async deliverRealtime(notification: INotification): Promise<void> {
    const io = getIO();
    if (!io) return;

    const room = notificationRoom(String(notification.recipientId));
    
    // Construct the standard ERP event envelope
    const event = {
      eventId: `ntf-${notification._id}-${Date.now()}`,
      type: ERP_EVENTS.NOTIFICATION_CREATED,
      version: ERP_EVENT_VERSION,
      occurredAt: notification.createdAt.toISOString(),
      actor: { actorType: 'system' as const, actorId: null },
      branchId: String(notification.branchId || ''),
      entity: { entityType: 'notification' as const, entityId: String(notification._id) },
      payload: {
        id: String(notification._id),
        type: notification.type,
        priority: notification.priority,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        createdAt: notification.createdAt.toISOString(),
        metadata: notification.metadata,
        link: notification.link,
      },
    };

    // Emit to notifications namespace
    io.of('/notifications').to(room).emit(ERP_EVENTS.NOTIFICATION_CREATED, event);
    
    // Also emit unread count update
    const unreadCount = await this.getUnreadCount(String(notification.recipientId));
    io.of('/notifications').to(room).emit(ERP_EVENTS.NOTIFICATION_COUNT_UPDATE, {
      ...event,
      type: ERP_EVENTS.NOTIFICATION_COUNT_UPDATE,
      payload: {
        unreadCount,
        lastUpdatedAt: new Date().toISOString(),
      },
    });

    // Mark as delivered via socket
    await Notification.updateOne(
      { _id: notification._id },
      { $set: { 'deliveredAt.socket': new Date() } }
    );
  }

  /**
   * Mark a single notification as read.
   */
  static async markAsRead(notificationId: string, recipientId: string): Promise<boolean> {
    const result = await Notification.updateOne(
      { _id: notificationId, recipientId },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return result.modifiedCount > 0;
  }

  /**
   * Mark all notifications as read for a user.
   */
  static async markAllAsRead(recipientId: string): Promise<number> {
    const result = await Notification.updateMany(
      { recipientId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );
    return result.modifiedCount;
  }

  /**
   * Get unread count for a user.
   */
  static async getUnreadCount(recipientId: string): Promise<number> {
    return Notification.countDocuments({ recipientId, isRead: false });
  }

  /**
   * Fetch paginated notification history.
   */
  static async getHistory(params: {
    recipientId: string;
    page?: number;
    limit?: number;
  }): Promise<{ docs: INotification[]; total: number }> {
    const { recipientId, page = 1, limit = 20 } = params;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      Notification.find({ recipientId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments({ recipientId }),
    ]);

    return { docs: docs as unknown as INotification[], total };
  }

  /**
   * Notify all managers associated with a specific branch.
   */
  static async notifyManagersInBranch(params: {
    branchId: string | Types.ObjectId;
    type: string;
    priority: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
    link?: string;
  }): Promise<void> {
    try {
      const { Manager } = await import('../managers/manager.model');
      const managers = await Manager.find({ branchId: String(params.branchId), isActive: true }).select('_id');
      
      if (managers.length === 0) {
        logger.warn(`[NotificationService] No active managers found for branch ${params.branchId}`);
        return;
      }

      await Promise.all(managers.map(manager => 
        this.createNotification({
          ...params,
          recipientId: String(manager._id),
          recipientRole: 'manager',
          branchId: params.branchId,
        })
      ));
    } catch (err) {
      logger.error(`[NotificationService] notifyManagersInBranch failed: ${(err as Error).message}`);
    }
  }

  /**
   * Enterprise Recovery Job: Scans for undelivered critical notifications.
   * Ensures that if the server crashed before the in-memory queue processed
   * an item, it gets picked up on the next boot.
   */
  static async bootstrapRecovery(): Promise<void> {
    logger.info('[NotificationService] Running delivery recovery audit...');
    
    const recoveryThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // Last 24 hours
    
    const undelivered = await Notification.find({
      createdAt: { $gt: recoveryThreshold },
      $or: [
        { 'deliveredAt.socket': { $exists: false } },
        { 'deliveredAt.email': { $exists: false } }
      ],
      priority: { $in: ['high', 'urgent', 'critical'] }
    }).limit(100);

    if (undelivered.length === 0) {
      logger.info('[NotificationService] Recovery audit complete. No pending deliveries.');
      return;
    }

    logger.info(`[NotificationService] Found ${undelivered.length} pending critical deliveries. Re-enqueuing...`);
    
    for (const notification of undelivered) {
      await notificationQueue.enqueue(String(notification._id));
    }
  }
}
