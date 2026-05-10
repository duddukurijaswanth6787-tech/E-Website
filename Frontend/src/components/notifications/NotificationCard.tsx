import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  ArrowRight,
  ShieldAlert,
  Scissors,
  CheckCircle,
  Zap,
  Clock,
  Package
} from 'lucide-react';
import { type NotificationInfo } from '../../realtime/notificationStore';
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface NotificationCardProps {
  notification: NotificationInfo;
  onRead: (id: string) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onRead }) => {
  const navigate = useNavigate();

  const getIcon = () => {
    const type = notification.type;
    switch (type) {
      case 'workflow_assigned': 
      case 'workflow_reassigned': return <Scissors className="text-blue-400" size={18} />;
      case 'qc_rejected': return <ShieldAlert className="text-rose-500" size={18} />;
      case 'workflow_completed': return <CheckCircle className="text-emerald-500" size={18} />;
      case 'sla_violated': return <Clock className="text-amber-500" size={18} />;
      case 'escalation_warning': return <Zap className="text-orange-500" size={18} />;
      case 'deadline_updated': return <Clock className="text-indigo-400" size={18} />;
      default: {
        switch (notification.priority) {
          case 'critical':
          case 'urgent': return <ShieldAlert className="text-rose-500" size={18} />;
          case 'high': return <AlertTriangle className="text-amber-500" size={18} />;
          case 'normal': return <Info className="text-blue-400" size={18} />;
          default: return <Bell className="text-stone-500" size={18} />;
        }
      }
    }
  };

  const getPriorityStyle = () => {
    if (notification.isRead) return 'bg-stone-900/40 border-stone-800 opacity-60';
    
    switch (notification.priority) {
      case 'critical':
      case 'urgent': return 'bg-rose-500/5 border-rose-500/20';
      case 'high': return 'bg-amber-500/5 border-amber-500/20';
      case 'normal': return 'bg-blue-500/5 border-blue-500/20';
      default: return 'bg-stone-900 border-stone-800';
    }
  };

  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "p-4 border rounded-2xl transition-all hover:bg-stone-800/50 cursor-pointer group relative overflow-hidden",
        getPriorityStyle()
      )}
      onClick={handleClick}
    >
      {!notification.isRead && (
        <div className="absolute top-0 right-0 p-1">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
        </div>
      )}

      <div className="flex gap-4">
        <div className="mt-0.5 p-2 rounded-xl bg-stone-950 border border-stone-800 shadow-inner group-hover:scale-110 transition-transform duration-300">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-1">
            <h4 className={cn(
              "text-xs font-black uppercase tracking-widest truncate",
              notification.isRead ? "text-stone-500" : "text-stone-100"
            )}>
              {notification.title}
            </h4>
            <span className="text-[9px] text-stone-600 font-bold whitespace-nowrap ml-2">
              {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
            </span>
          </div>
          
          <p className="text-[11px] text-stone-400 leading-relaxed line-clamp-2 mb-3 font-medium">
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
               <Package size={10} className="text-stone-700" />
               <span className="text-[9px] uppercase tracking-[0.15em] text-stone-600 font-black">
                 {notification.type.replace(/_/g, ' ')}
               </span>
            </div>
            
            <div className="text-[10px] text-amber-500 font-black flex items-center gap-1 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all">
              VIEW <ArrowRight size={10} />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default NotificationCard;
