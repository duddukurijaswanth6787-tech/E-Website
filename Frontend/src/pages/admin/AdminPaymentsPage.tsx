import { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { paymentService } from '../../api/services/payment.service';
import type { PaymentNode } from '../../api/services/payment.service';
import { DollarSign, Eye, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminPaymentsPage = () => {
  const [payments, setPayments] = useState<PaymentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchPayments = async (page = 1) => {
    setLoading(true);
    try {
      const res = await paymentService.getAdminPayments({ page, limit: pagination.limit });
      if (res && res.data) {
        const fetchedData = (res as any).data.payments || (res as any).data.data || res.data || [];
        setPayments(Array.isArray(fetchedData) ? fetchedData : Object.values(fetchedData));
        
        if ((res as any).data.pagination) {
          setPagination({
            page: (res as any).data.pagination.page,
            limit: (res as any).data.pagination.limit,
            total: (res as any).data.pagination.total
          });
        }
      }
    } catch (e: any) {
      console.error("Payment Fetch Error", e);
      toast.error('Failed to load transaction gateway ledger.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments(pagination.page);
  }, [pagination.page]);

  const columns = [
    { 
       header: 'Transaction ID', 
       accessor: (row: PaymentNode) => (
         <div className="max-w-[140px] truncate group border-l-2 border-primary-100 pl-3">
           <span className="block font-medium tracking-wide text-gray-900 text-sm font-mono mt-0.5 uppercase">{row.razorpayPaymentId || `COD-${row._id.substring(0,8)}`}</span>
           <span className="block text-[0.65rem] text-gray-400 font-mono tracking-tighter uppercase">{new Date(row.createdAt).toLocaleString()}</span>
         </div>
       )
    },
    { 
       header: 'Ledger Mapping', 
       accessor: (row: PaymentNode) => (
         <div>
           <span className="block text-sm font-bold text-primary-950 uppercase">{row.order?.orderNumber || 'N/A'}</span>
           <span className="block text-xs text-primary-600 font-medium">₹{(row.amount || 0).toLocaleString('en-IN')}</span>
         </div>
       )
    },
    { 
       header: 'Verified Gateway', 
       accessor: (row: PaymentNode) => (
         <div className="flex items-center space-x-2">
           <span className={`block text-xs font-bold tracking-widest uppercase px-2 py-0.5 rounded border ${row.provider === 'razorpay' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
              {row.provider}
           </span>
         </div>
       )
    },
    { 
       header: 'State', 
       accessor: (row: PaymentNode) => {
         const isPaid = row.status === 'paid';
         const isPending = row.status === 'pending';
         const colorClass = isPaid ? 'bg-green-50 text-green-700 border-green-200' : isPending ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-red-50 text-red-700 border-red-200';
         return (
           <span className={`inline-flex px-2.5 py-1 rounded text-[0.65rem] font-black tracking-widest uppercase border transition-colors shadow-sm ${colorClass}`}>
              {row.status}
           </span>
         );
       }
    },
    {
       header: 'Actions',
       accessor: (row: PaymentNode) => (
         <div className="flex items-center space-x-2">
           <button className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors" title="Inspect Ledger Detail">
             <Eye size={16} />
           </button>
           {row.status === 'paid' ? (
             <span title="Secure Execution Verified"><CheckCircle className="text-green-500/30" size={16} /></span>
           ) : (
             <span title="Verification Failed"><AlertCircle className="text-red-500/30" size={16} /></span>
           )}
         </div>
       )
    }
  ];

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div>
        <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-primary-700" /> Transaction Gateway Matrix
        </h1>
        <p className="text-sm text-gray-500">Isolate orphaned captures, trigger explicit manual refunds, and verify ledger signatures across live Razorpay/COD flows.</p>
      </div>

      <DataTable 
         columns={columns as any}
         data={payments}
         loading={loading}
         emptyMessage="Awaiting Secure Payment Intent tokens to be aggregated by the global Gateway."
         pagination={{
           page: pagination.page,
           limit: pagination.limit,
           total: Math.max(pagination.total, payments.length),
           onPageChange: (newPage) => fetchPayments(newPage)
         }}
      />
    </div>
  );
};

export default AdminPaymentsPage;
