import { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { notificationService } from '../../api/services/notification.service';
import type { NotificationNode } from '../../api/services/notification.service';
import { BellRing, Mail, CheckCircle, Send, MessageSquare, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminNotificationsPage = () => {
  const [notifications, setNotifications] = useState<NotificationNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchNotifications = async (page = 1) => {
    setLoading(true);
    try {
      const res = await notificationService.getAdminNotifications({ page, limit: pagination.limit });
      if (res && res.data) {
        const fetchedData = (res as any).data.notifications || (res as any).data.data || res.data || [];
        setNotifications(Array.isArray(fetchedData) ? fetchedData : Object.values(fetchedData));
        
        if ((res as any).data.pagination) {
          setPagination({
            page: (res as any).data.pagination.page,
            limit: (res as any).data.pagination.limit,
            total: (res as any).data.pagination.total
          });
        }
      }
    } catch (e: any) {
      console.error("Notification Fetch Error", e);
      toast.error('Failed to load global alert history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications(pagination.page);
  }, [pagination.page]);

  const markRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      toast.success("Notification marked as resolved.");
      fetchNotifications(pagination.page);
    } catch (e) {
      toast.error("Failed to update alert state.");
    }
  };

  const columns = [
    { 
       header: 'Alert Payload', 
       accessor: (row: NotificationNode) => (
         <div className="max-w-xs group">
           <span className="block font-bold text-gray-900 text-sm tracking-tight">{row.title}</span>
           <span className="block text-xs text-gray-500 line-clamp-1 mt-0.5" title={row.body}>{row.body}</span>
           <span className="block text-[0.6rem] text-gray-400 font-mono tracking-tighter uppercase mt-1">{new Date(row.createdAt).toLocaleString()}</span>
         </div>
       )
    },
    { 
       header: 'Recipient Node', 
       accessor: (row: NotificationNode) => (
         <div>
           <span className="block text-sm font-medium text-gray-800">{row.user?.name || 'GLOBAL / SYSTEM'}</span>
           <span className="block text-[0.65rem] text-gray-400 font-mono tracking-wide">{row.user?.email || 'N/A'}</span>
         </div>
       )
    },
    { 
       header: 'Matrix Channel', 
       accessor: (row: NotificationNode) => (
         <div className="flex items-center space-x-2">
           {row.channel === 'email' ? <Mail size={14} className="text-primary-600" /> : <MessageSquare size={14} className="text-blue-600" />}
           <span className="block text-[0.65rem] font-black tracking-widest uppercase text-gray-500">{row.channel}</span>
         </div>
       )
    },
    { 
       header: 'State', 
       accessor: (row: NotificationNode) => (
         <button 
           onClick={() => !row.isRead && markRead(row._id)}
           disabled={row.isRead}
           className={`inline-flex px-2 py-0.5 rounded text-[0.65rem] font-bold tracking-widest uppercase border transition-colors ${row.isRead ? 'bg-gray-50 text-gray-400 border-gray-100 cursor-default' : 'bg-primary-50 text-primary-700 border-primary-200 hover:bg-primary-100 cursor-pointer'}`}
         >
            {row.isRead ? 'RESOLVED' : 'UNREAD'}
         </button>
       )
    },
    {
       header: 'Actions',
       accessor: (row: NotificationNode) => (
         <div className="flex items-center space-x-2">
           {!row.isRead && (
             <button onClick={() => markRead(row._id)} className="p-1.5 text-gray-400 hover:text-green-600 transition-colors" title="Mark Resolved">
               <CheckCircle size={16} />
             </button>
           )}
           <AlertCircle className="text-primary-950/5" size={16} />
         </div>
       )
    }
  ];

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center gap-3">
            <BellRing className="w-6 h-6 text-primary-700" /> Administrative Alert Engine
          </h1>
          <p className="text-sm text-gray-500">Inject massive campaign notifications, order system alerts, and verify SMS/Email delivery traces.</p>
        </div>
        <button className="mt-4 sm:mt-0 flex items-center px-4 py-2 bg-primary-950 text-white text-sm font-bold tracking-widest uppercase rounded shadow hover:bg-primary-800 transition-colors">
          <Send size={16} className="mr-2" />
          Dispatch Global Alert
        </button>
      </div>

      <DataTable 
         columns={columns as any}
         data={notifications}
         loading={loading}
         emptyMessage="No historical push campaigns identified."
         pagination={{
           page: pagination.page,
           limit: pagination.limit,
           total: Math.max(pagination.total, notifications.length),
           onPageChange: (newPage) => fetchNotifications(newPage)
         }}
      />
    </div>
  );
};

export default AdminNotificationsPage;
