import React from 'react';
import { useNotificationStore } from '../../realtime/notificationStore';
import { useNotifications } from '../../hooks/useNotifications';
import { X, BellOff, CheckCheck, Loader2 } from 'lucide-react';
import NotificationCard from './NotificationCard';

const NotificationDrawer: React.FC = () => {
  const { isDrawerOpen, setDrawerOpen, unreadCount } = useNotificationStore();
  const { history, isLoading, markRead, markAllRead, fetchNextPage, hasNextPage, isFetchingNextPage } = useNotifications();

  if (!isDrawerOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
        onClick={() => setDrawerOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-stone-950 border-l border-stone-800 z-[101] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-8 border-b border-stone-800 flex items-center justify-between bg-stone-900/40 backdrop-blur-md sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[10px] text-stone-500 font-black uppercase tracking-[0.3em]">
                Live Stream
              </span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-100 flex items-center gap-3">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-amber-500 text-black text-[10px] px-2 py-0.5 rounded-lg font-black shadow-lg shadow-amber-500/20">
                  {unreadCount}
                </span>
              )}
            </h2>
          </div>
          <button 
            onClick={() => setDrawerOpen(false)}
            className="p-3 hover:bg-stone-800 rounded-2xl text-stone-400 transition-all active:scale-90"
          >
            <X size={20} />
          </button>
        </div>

        {/* Actions Bar */}
        <div className="px-8 py-4 border-b border-stone-800/50 flex justify-between items-center bg-stone-950/50">
           <span className="text-[10px] text-stone-600 font-bold uppercase tracking-widest">
             {history.length} Event{history.length !== 1 ? 's' : ''} logged
           </span>
           <button 
             onClick={() => markAllRead()}
             disabled={unreadCount === 0}
             className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-amber-500 flex items-center gap-2 transition-colors disabled:opacity-20"
           >
             <CheckCheck size={14} /> Mark all read
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-500 gap-4">
              <Loader2 className="animate-spin text-amber-500" size={32} />
              <span className="text-[10px] font-black uppercase tracking-widest">Synchronizing...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-stone-700 gap-6 py-20 px-10">
              <div className="w-20 h-20 rounded-[2.5rem] bg-stone-900 flex items-center justify-center border border-stone-800 shadow-inner">
                <BellOff size={32} className="text-stone-700" />
              </div>
              <div className="text-center">
                <h3 className="text-stone-100 font-bold text-sm mb-1 uppercase tracking-widest">Clear Horizons</h3>
                <p className="text-[10px] font-medium text-stone-500 leading-relaxed">
                  No operational alerts at this moment. New events will appear here in real-time.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((notif) => (
                <NotificationCard 
                  key={notif.id} 
                  notification={notif} 
                  onRead={markRead} 
                />
              ))}

              {/* Load More */}
              {hasNextPage && (
                <div className="pt-6 pb-4">
                  <button
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="w-full py-4 rounded-2xl border border-stone-800 text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 hover:text-stone-300 hover:bg-stone-900 transition-all disabled:opacity-30"
                  >
                    {isFetchingNextPage ? 'Retrieving records...' : 'Load History'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-900/10 text-center">
           <span className="text-[9px] text-stone-600 font-bold uppercase tracking-tighter">
             Vasanthi Creations ERP • Realtime Notification Center
           </span>
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;
