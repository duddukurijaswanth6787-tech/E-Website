import { Namespace, Socket } from 'socket.io';
import { socketAuthMiddleware } from '../auth/socketAuth';
import { ERP_CLIENT_INTENTS, ERP_EVENTS, type RealtimeResponse } from '../events/erpEvents';
import { notificationRoom } from '../rooms/roomNames';
import { NotificationService } from '../../modules/notifications/notification.service';
import { logger } from '../../common/logger';

export const registerNotificationsNamespace = (nsp: Namespace) => {
  nsp.use(socketAuthMiddleware('any'));

  nsp.on('connection', async (socket: Socket) => {
    const principal = socket.data.principal;
    const room = notificationRoom(principal.id);

    // Join private notification room
    socket.join(room);
    logger.debug(`[Notifications] Principal ${principal.id} joined room ${room}`);

    // Initial unread count sync
    try {
      const unreadCount = await NotificationService.getUnreadCount(principal.id);
      socket.emit(ERP_EVENTS.NOTIFICATION_COUNT_UPDATE, {
        unreadCount,
        lastUpdatedAt: new Date().toISOString(),
      });
    } catch (err) {
      logger.error(`[Notifications] Initial sync failed: ${(err as Error).message}`);
    }

    /**
     * Mark a notification as read
     */
    socket.on(ERP_CLIENT_INTENTS.NOTIFICATION_MARK_READ, async (payload: { notificationId: string }, ack?: (r: RealtimeResponse) => void) => {
      try {
        const ok = await NotificationService.markAsRead(payload.notificationId, principal.id);
        if (ok) {
          const unreadCount = await NotificationService.getUnreadCount(principal.id);
          ack?.({ ok: true });
          
          // Broadcast unread count update to all of this user's notification sockets
          nsp.to(room).emit(ERP_EVENTS.NOTIFICATION_COUNT_UPDATE, {
            unreadCount,
            lastUpdatedAt: new Date().toISOString(),
          });
        } else {
          ack?.({ ok: false, error: 'Notification not found or access denied' });
        }
      } catch (err) {
        ack?.({ ok: false, error: 'Internal server error' });
      }
    });

    /**
     * Mark all as read
     */
    socket.on(ERP_CLIENT_INTENTS.NOTIFICATION_MARK_ALL_READ, async (_, ack?: (r: RealtimeResponse) => void) => {
      try {
        await NotificationService.markAllAsRead(principal.id);
        ack?.({ ok: true });
        
        nsp.to(room).emit(ERP_EVENTS.NOTIFICATION_COUNT_UPDATE, {
          unreadCount: 0,
          lastUpdatedAt: new Date().toISOString(),
        });
      } catch (err) {
        ack?.({ ok: false, error: 'Internal server error' });
      }
    });

    socket.on('disconnect', () => {
      logger.debug(`[Notifications] Principal ${principal.id} disconnected from notification namespace`);
    });
  });
};
