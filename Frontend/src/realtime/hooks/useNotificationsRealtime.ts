import { useEffect } from 'react';
import { useRealtime } from '../SocketProvider';
import { ERP_EVENTS, type RealtimeEvent } from '../events';
import { useNotificationStore, type NotificationInfo } from '../notificationStore';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

/**
 * Enterprise Notification Realtime Synchronization Hook.
 * Manages Socket.IO connection to /notifications namespace and 
 * updates global state + React Query cache.
 */
export const useNotificationsRealtime = () => {
  const { socket, state } = useRealtime('notifications');
  const queryClient = useQueryClient();
  const { setUnreadCount, addLiveNotification } = useNotificationStore();

  useEffect(() => {
    if (!socket || state !== 'connected') return;

    // 1. New Notification Arrived
    socket.on(ERP_EVENTS.NOTIFICATION_CREATED, (event: RealtimeEvent<NotificationInfo>) => {
      console.log('🔔 Notification Received:', event.payload);
      
      // Update global store
      addLiveNotification(event.payload);

      // Invalidate React Query notification history so drawer is fresh
      queryClient.invalidateQueries({ queryKey: ['notifications', 'history'] });

      // Trigger ephemeral toast for immediate visibility
      const priorityColors: Record<string, string> = {
        urgent: 'bg-red-500',
        critical: 'bg-red-600',
        high: 'bg-orange-500',
        normal: 'bg-blue-500',
      };

      toast(`${event.payload.title}: ${event.payload.message}`, {
        className: priorityColors[event.payload.priority] || 'bg-stone-800',
      });
    });

    // 2. Unread Count Synchronization (multi-session safe)
    socket.on(ERP_EVENTS.NOTIFICATION_COUNT_UPDATE, (event: RealtimeEvent<{ unreadCount: number }>) => {
      setUnreadCount(event.payload.unreadCount);
    });

    return () => {
      socket.off(ERP_EVENTS.NOTIFICATION_CREATED);
      socket.off(ERP_EVENTS.NOTIFICATION_COUNT_UPDATE);
    };
  }, [socket, state, addLiveNotification, setUnreadCount, queryClient]);

  return { isConnected: state === 'connected' };
};
