import React from 'react';
import { Bell } from 'lucide-react';
import { useNotificationStore } from '../../realtime/notificationStore';
import { cn } from '../../lib/utils';

interface NotificationBellProps {
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ className }) => {
  const { unreadCount, setDrawerOpen } = useNotificationStore();

  return (
    <button 
      onClick={() => setDrawerOpen(true)}
      className={cn(
        "relative p-2 hover:bg-stone-800 rounded-lg transition-all group active:scale-95",
        className
      )}
      aria-label="Toggle notifications"
    >
      <Bell 
        className={cn(
          "text-stone-400 group-hover:text-stone-100 transition-colors",
          unreadCount > 0 && "animate-wiggle"
        )} 
        size={20} 
      />
      
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-black text-black ring-4 ring-stone-950">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
