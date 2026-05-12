import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Eye, MapPin, Heart, Activity } from 'lucide-react';
import { publicApi } from '../../lib/api';
import { formatDistanceToNow } from 'date-fns';

export const SocialProofPopup: React.FC = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchActivities = async () => {
      try {
        const res = await publicApi.get('/marketing/retention/public-activities');
        if (abortController.signal.aborted) return;

        const list = res.data?.data || res.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setActivities(list);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') return;
        if (import.meta.env.DEV) {
          console.warn('[SocialProof] Sync deferred:', error.message);
        }
      }
    };

    fetchActivities();
    const pollInterval = setInterval(fetchActivities, 60000); // Poll every minute

    return () => {
      abortController.abort();
      clearInterval(pollInterval);
    };
  }, []);

  useEffect(() => {
    if (activities.length === 0) return;

    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    const cycleTimer = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIdx((prev) => (prev + 1) % activities.length);
        setIsVisible(true);
      }, 1000);
    }, 12000);

    return () => {
      clearTimeout(showTimer);
      clearInterval(cycleTimer);
    };
  }, [activities.length]);

  if (activities.length === 0) return null;

  const activity = activities[currentIdx];

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return ShoppingBag;
      case 'view': return Eye;
      case 'wishlist': return Heart;
      default: return Activity;
    }
  };

  const Icon = getIcon(activity.activityType);

  return (
    <div className="fixed bottom-8 left-8 z-[100] pointer-events-none">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
            className="bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/50 pointer-events-auto flex items-center gap-4 max-w-[320px]"
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              activity.activityType === 'order' ? 'bg-primary-950 text-white' : 
              activity.activityType === 'view' ? 'bg-emerald-500 text-white' : 'bg-pink-500 text-white'
            }`}>
              <Icon size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-600">
                  {activity.activityType === 'order' ? 'New Order' : activity.activityType === 'view' ? 'Live Activity' : 'Wishlist Update'}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-xs text-primary-950 font-bold truncate">
                {activity.activityType === 'view' ? (
                  <><span className="text-primary-700">{activity.title}</span> in <span className="text-primary-700">{activity.location}</span></>
                ) : (
                  <><span className="text-primary-700">{activity.customerDisplayName}</span> from <span className="text-primary-700">{activity.location}</span></>
                )}
              </p>
              <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                <MapPin size={10} className="text-gray-300" /> Hyderabad, India
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
