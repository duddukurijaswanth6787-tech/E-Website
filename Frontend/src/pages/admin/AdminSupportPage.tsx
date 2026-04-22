import { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { supportService } from '../../api/services/support.service';
import type { SupportTicket } from '../../api/services/support.service';
import { LifeBuoy, Eye, Reply } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSupportPage = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchTickets = async (page = 1) => {
    setLoading(true);
    try {
       const res = await supportService.getAdminTickets({ page, limit: pagination.limit });
       if (res) {
          const fetchedData = (res as any).data?.tickets || (res as any).data?.data || (res as any).data || [];
          const arr = Array.isArray(fetchedData) ? fetchedData : Object.values(fetchedData);
          setTickets(arr);
          
          if ((res as any).data?.pagination) {
             setPagination({
                page: (res as any).data.pagination.page,
                limit: (res as any).data.pagination.limit,
                total: (res as any).data.pagination.total
             });
          } else {
             setPagination(prev => ({ ...prev, total: arr.length || 0 }));
          }
       }
    } catch (e: any) {
       console.warn("CRM Enpoint Fail", e);
       if (e?.response?.status === 404) {
          toast.error("Backend Gap: GET /api/v1/support/admin missing. UI functionally stubbed.");
       } else {
          toast.error("Failed to load generic Contact Queries mapping.");
       }
       setTickets([]);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(pagination.page);
  }, [pagination.page]);

  const updateStatus = async (id: string, currentStatus: string) => {
     const nextStatus = currentStatus === 'OPEN' ? 'IN_PROGRESS' : currentStatus === 'IN_PROGRESS' ? 'RESOLVED' : currentStatus === 'RESOLVED' ? 'CLOSED' : 'OPEN';
     try {
        await supportService.updateTicketStatus(id, nextStatus, 'Administrative Override');
        toast.success(`Ticket escalated to ${nextStatus}`);
        fetchTickets(pagination.page);
     } catch (e) {
        toast.error("Error patching Ticket Status logic.");
     }
  };

  const columns = [
    { 
       header: 'Support Ticket', 
       accessor: (row: SupportTicket) => (
         <div className="max-w-xs">
           <span className="block font-medium tracking-wide text-primary-950 text-sm truncate uppercase">#{row._id?.substring(0,8) || 'N/A'} - {row.subject || 'No Subject Provided'}</span>
           <span className="block text-[0.65rem] text-gray-500 font-mono mt-0.5 tracking-wide">{new Date(row.createdAt || Date.now()).toLocaleString()}</span>
         </div>
       )
    },
    { 
       header: 'Customer Context', 
       accessor: (row: SupportTicket) => (
         <div>
           <span className="block text-sm text-gray-800 font-medium">{row.customerName || 'Anonymous Entry'}</span>
           <span className="block text-xs text-gray-500 mt-0.5">{row.email || 'N/A'} {row.phone ? `• ${row.phone}` : ''}</span>
         </div>
       )
    },
    { 
       header: 'Inbound Payload', 
       accessor: (row: SupportTicket) => (
         <span className="text-xs text-gray-600 line-clamp-2 max-w-sm" title={row.message}>
           {row.message || 'No text attached.'}
         </span>
       )
    },
    { 
       header: 'Status Matrix', 
       accessor: (row: SupportTicket) => {
         const st = row.status || 'OPEN';
         const isResolved = st === 'RESOLVED' || st === 'CLOSED';
         const isOp = st === 'OPEN';
         const colorClass = isResolved ? 'bg-gray-100 text-gray-600 border-gray-200' : isOp ? 'bg-red-50 text-red-700 border-red-200' : 'bg-blue-50 text-blue-700 border-blue-200';
         return (
           <span 
              onClick={(e) => { e.stopPropagation(); updateStatus(row._id, st); }}
              title="Escalate Ticket Resolution"
              className={`cursor-pointer inline-flex px-2.5 py-1 rounded text-[0.65rem] font-bold tracking-widest uppercase border transition-colors hover:brightness-95 ${colorClass}`}
           >
              {st}
           </span>
         );
       }
    },
    {
       header: 'Actions',
       accessor: (_row: SupportTicket) => (
         <div className="flex items-center space-x-2">
           <button className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors" title="View Full Secure Log">
             <Eye size={16} />
           </button>
           <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Dispatch Direct Response">
             <Reply size={16} />
           </button>
         </div>
       )
    }
  ];

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center">
            <LifeBuoy className="w-6 h-6 mr-3 text-primary-700" /> CRM Inbox & Ticketing
          </h1>
          <p className="text-sm text-gray-500">Handle logistical disputes, sizing inquiries, and generic contact form drops.</p>
        </div>
      </div>

      <DataTable 
         columns={columns as any}
         data={tickets}
         loading={loading}
         emptyMessage="No pending support tickets registered in the central aggregation node."
         pagination={{
           page: pagination.page,
           limit: pagination.limit,
           total: Math.max(pagination.total, tickets.length),
           onPageChange: (newPage) => setPagination({...pagination, page: newPage})
         }}
      />
    </div>
  );
};

export default AdminSupportPage;
