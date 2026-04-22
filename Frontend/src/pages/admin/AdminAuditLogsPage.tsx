import { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { auditLogService } from '../../api/services/audit-log.service';
import type { AuditLogNode } from '../../api/services/audit-log.service';
import { Activity, AlertCircle, Eye, Terminal } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState<AuditLogNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await auditLogService.getLogs({ page, limit: pagination.limit });
      if (res && res.data) {
        const fetchedData = (res as any).data.logs || (res as any).data.data || res.data || [];
        setLogs(Array.isArray(fetchedData) ? fetchedData : Object.values(fetchedData));
        
        if ((res as any).data.pagination) {
          setPagination({
            page: (res as any).data.pagination.page,
            limit: (res as any).data.pagination.limit,
            total: (res as any).data.pagination.total
          });
        }
      }
    } catch (e: any) {
      console.error("Audit Fetch Error", e);
      toast.error('Failed to load global mutation trace ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(pagination.page);
  }, [pagination.page]);

  const columns = [
    { 
       header: 'System Operation', 
       accessor: (row: AuditLogNode) => (
         <div className="flex items-center space-x-3">
           <div className="w-8 h-8 rounded bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
             <Terminal size={14} />
           </div>
           <div>
             <span className="block font-medium tracking-wide text-primary-950 text-xs uppercase">{row.action}</span>
             <span className="block text-[0.6rem] text-gray-400 font-mono tracking-tighter uppercase">{new Date(row.createdAt).toLocaleString()}</span>
           </div>
         </div>
       )
    },
    { 
       header: 'Actor Profile', 
       accessor: (row: AuditLogNode) => (
         <div>
           <span className="block text-sm font-bold text-gray-900">{row.admin?.name || 'ROOT/SYSTEM'}</span>
           <span className="block text-[0.65rem] text-primary-600 font-black uppercase tracking-widest">{(row.admin?.role || 'SYSTEM').replace('_', ' ')}</span>
         </div>
       )
    },
    { 
       header: 'Module Context', 
       accessor: (row: AuditLogNode) => (
         <span className="block text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded border bg-gray-50 text-gray-700 border-gray-200 inline-block">
            {row.module}
         </span>
       )
    },
    { 
       header: 'Target Key', 
       accessor: (row: AuditLogNode) => (
         <span className="block font-mono text-[0.65rem] text-gray-500 truncate max-w-[120px]" title={row.targetId}>
            {row.targetId || 'N/A'}
         </span>
       )
    },
    {
       header: 'Actions',
       accessor: (_row: AuditLogNode) => (
         <div className="flex items-center space-x-2">
           <button className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors" title="Inspect Diff Payload">
             <Eye size={16} />
           </button>
           <span title="Security Warning Context"><AlertCircle className="text-primary-950/10" size={16} /></span>
         </div>
       )
    }
  ];

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div>
        <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center gap-3">
          <Activity className="w-6 h-6 text-primary-700" /> Global Audit Trace Matrix
        </h1>
        <p className="text-sm text-gray-500">Monitor internal administrative mutations, log secure environment actions, and verify trace signatures across the Mongoose cluster.</p>
      </div>

      <DataTable 
         columns={columns as any}
         data={logs}
         loading={loading}
         emptyMessage="No mutation traces identified by the Security Log parser."
         pagination={{
           page: pagination.page,
           limit: pagination.limit,
           total: Math.max(pagination.total, logs.length),
           onPageChange: (newPage) => fetchLogs(newPage)
         }}
      />
    </div>
  );
};

export default AdminAuditLogsPage;
