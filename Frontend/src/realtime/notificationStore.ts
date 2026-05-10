import { create } from 'zustand';

export interface NotificationInfo {
  id: string;
  type: string;
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'critical';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
  link?: string;
}

interface NotificationState {
  unreadCount: number;
  liveNotifications: NotificationInfo[];
  isDrawerOpen: boolean;
  
  setUnreadCount: (count: number) => void;
  addLiveNotification: (notification: NotificationInfo) => void;
  setDrawerOpen: (open: boolean) => void;
  markReadOptimistic: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  liveNotifications: [],
  isDrawerOpen: false,

  setUnreadCount: (count) => set({ unreadCount: count }),

  addLiveNotification: (notification) => set((state) => ({
    liveNotifications: [notification, ...state.liveNotifications].slice(0, 50),
    // We don't increment unreadCount here because the server sends a 
    // NOTIFICATION_COUNT_UPDATE event immediately after NOTIFICATION_CREATED
  })),

  setDrawerOpen: (open) => set({ isDrawerOpen: open }),

  markReadOptimistic: (id) => set((state) => ({
    unreadCount: Math.max(0, state.unreadCount - 1),
    liveNotifications: state.liveNotifications.map((n) => 
      n.id === id ? { ...n, isRead: true } : n
    ),
  })),
}));
