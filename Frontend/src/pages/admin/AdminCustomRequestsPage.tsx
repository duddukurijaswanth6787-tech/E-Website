import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DataTable } from '../../components/admin/DataTable';
import { customRequestService } from '../../api/services/custom-request.service';
import { Scissors, FileText, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCustomRequestsPage = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchRequests = async (page = 1) => {
    setLoading(true);
    try {
       const res = await customRequestService.getAdminRequests({ page, limit: pagination.limit }) as any;
       // apiClient returns the JSON body: { success, message, data: [], pagination }
       const list = Array.isArray(res?.data) ? res.data : [];
       setRequests(list);

       const pag = res?.pagination;
       if (pag) {
          setPagination({
             page: pag.currentPage ?? page,
             limit: pag.itemsPerPage ?? pagination.limit,
             total: pag.totalItems ?? list.length,
          });
       } else {
          setPagination((prev) => ({ ...prev, total: list.length }));
       }
    } catch (e: any) {
       console.error("CRM Poll Failed", e);
       const msg = e?.message || '';
       if (msg.includes('not found') || msg.includes('404')) {
          toast.error("Custom requests API unavailable.");
       } else {
          toast.error("Failed to load Custom Blouse Bespoke Pipeline records.");
       }
       setRequests([]);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests(pagination.page);
  }, [pagination.page]);

  const STATUS_FLOW = [
    'submitted',
    'under_review',
    'price_assigned',
    'approved',
    'in_progress',
    'completed',
    'delivered',
  ] as const;

  const nextPipelineStatus = (current: string) => {
    const s = (current || 'submitted').toLowerCase();
    const i = STATUS_FLOW.indexOf(s as (typeof STATUS_FLOW)[number]);
    if (i < 0) return STATUS_FLOW[1];
    return STATUS_FLOW[(i + 1) % STATUS_FLOW.length];
  };

  const updateStatus = async (id: string, currentStatus: string) => {
    const nextStatus = nextPipelineStatus(currentStatus);
    try {
       await customRequestService.updateRequestStatus(id, nextStatus);
       toast.success(`Request #${id.substring(0,8)} → ${nextStatus}`);
       fetchRequests(pagination.page);
    } catch (e: any) {
       toast.error(e?.message || "Could not update status.");
    }
  };

  const columns = [
    { 
       header: 'CRM Ticket', 
       accessor: (row: any) => (
         <div>
           <span className="block font-medium tracking-wide text-primary-950 uppercase text-xs">#{row._id?.substring(0,10) || row.id}</span>
           <span className="block text-xs text-gray-500 mt-1">{new Date(row.createdAt || Date.now()).toLocaleDateString()}</span>
         </div>
       )
    },
    { 
       header: 'Style Matrix', 
       accessor: (row: any) => (
         <div>
           <span className="block font-medium text-gray-900">{row.preferredNeckStyle || row.stylePreferences?.neckline || 'Custom'} / {row.preferredSleeveStyle || row.stylePreferences?.sleeves || 'Custom'}</span>
           <span className="block text-[0.65rem] tracking-widest uppercase text-gray-500 mt-0.5 max-w-[200px] truncate" title={row.notes || row.fabricDetails}>
             {row.notes || row.fabricDetails || 'No notes'}
           </span>
         </div>
       )
    },
    { 
       header: 'Customer Context', 
       accessor: (row: any) => (
         <div>
           <span className="block text-sm text-gray-800">{row.user?.name || row.customerName || 'Anonymous Link'}</span>
           <span className="block text-[0.65rem] font-mono text-gray-500 mt-0.5">{row.user?.email || 'N/A'}</span>
         </div>
       )
    },
    { 
       header: 'Status Matrix', 
       accessor: (row: any) => {
          const status = row.status || 'submitted';
          const isComplete = status === 'completed' || status === 'delivered';
          const isReview = status === 'under_review' || status === 'price_assigned';
          const colorClass = isComplete ? 'bg-green-50 text-green-700 border-green-200' : isReview ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200';
          
         return (
            <span 
              onClick={(e) => { e.stopPropagation(); updateStatus(row._id, status); }}
              title="Click to Escalate Bespoke Pipeline Phase"
              className={`cursor-pointer px-3 py-1.5 rounded text-[0.65rem] font-bold tracking-widest uppercase border transition-colors hover:brightness-95 ${colorClass}`}
            >
               {status}
            </span>
         );
       }
    },
    {
       header: 'Actions',
       accessor: (row: any) => (
         <div className="flex items-center space-x-3">
           <Link 
             to={`/admin/custom-requests/${row._id}`} 
             className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-all flex items-center gap-1.5"
             title="View Full Design Spec"
           >
             <FileText size={16} />
             <span className="text-xs font-bold uppercase tracking-wider hidden xl:inline">View</span>
           </Link>
           <Link 
             to={`/admin/custom-requests/${row._id}`} 
             className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all flex items-center gap-1.5"
             title="Edit Status & Pricing"
           >
             <CheckCircle size={16} />
             <span className="text-xs font-bold uppercase tracking-wider hidden xl:inline">Edit</span>
           </Link>
         </div>
       )
     }
   ];

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center">
            <Scissors className="w-6 h-6 mr-3 text-primary-700" /> Bespoke CRM Dashboard
          </h1>
          <p className="text-sm text-gray-500">Track and fulfill unique customer blouse customization pipelines.</p>
        </div>
      </div>

      <DataTable 
         columns={columns as any}
         data={requests}
         loading={loading}
         emptyMessage="No Custom Blouse pipelines are currently active in the database."
         pagination={{
           page: pagination.page,
           limit: pagination.limit,
           total: Math.max(pagination.total, requests.length),
           onPageChange: (newPage) => setPagination({...pagination, page: newPage})
         }}
      />
    </div>
  );
};

export default AdminCustomRequestsPage;
