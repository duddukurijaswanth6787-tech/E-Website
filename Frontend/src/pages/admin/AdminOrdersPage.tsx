import { useState, useEffect, useMemo, useCallback } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { orderService } from '../../api/services/order.service';
import AdminOrderDetailModal from '../../components/admin/AdminOrderDetailModal';
import { ShoppingBag, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const fetchOrders = useCallback(async (page = 1) => {
    setLoading(true);
    try {
       const res = await orderService.getAdminOrders({ page, limit: pagination.limit });
       
       if (res.data) {
          const payload = res.data?.data || res.data;
          const fetchedOrders = payload.orders || payload || [];
          const ordersArray = Array.isArray(fetchedOrders) ? fetchedOrders : [];
          
          setOrders(ordersArray);
          
          if (payload.pagination) {
             setPagination({
                page: payload.pagination.page,
                limit: payload.pagination.limit,
                total: payload.pagination.total
             });
          } else {
             setPagination(prev => ({ ...prev, total: ordersArray.length || 0 }));
          }
       }
    } catch (e: any) {
       console.error("Failed to load admin orders", e);
       toast.error("Failed to fetch order history.");
       setOrders([]);
    } finally {
       setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchOrders(pagination.page);
  }, [pagination.page, fetchOrders]);

  const updateStatus = useCallback(async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'confirmed' : currentStatus === 'confirmed' ? 'packed' : currentStatus === 'packed' ? 'shipped' : currentStatus === 'shipped' ? 'delivered' : 'pending';
    try {
       await orderService.updateOrderStatus(id, nextStatus);
       toast.success(`Order marked as ${nextStatus.toUpperCase()}`);
       fetchOrders(pagination.page);
    } catch (e: any) {
       toast.error("Failed to update status.");
    }
  }, [fetchOrders, pagination.page]);

  const columns = useMemo(() => [
    { 
       header: 'Order Details', 
       accessor: (row: any) => (
         <div onClick={() => setSelectedOrderId(row._id)} className="cursor-pointer">
           <span className="block font-medium tracking-wide text-primary-950 uppercase text-xs">#{row.orderNumber || row._id?.substring(0,10)}</span>
           <span className="block text-xs text-[var(--admin-text-secondary)] mt-1">{new Date(row.createdAt).toLocaleString()}</span>
         </div>
       )
    },
    { 
       header: 'Customer', 
       accessor: (row: any) => (
         <div>
           <span className="block font-medium text-gray-900">{row.address?.name || row.user?.name || 'Guest Customer'}</span>
           <span className="block text-xs text-[var(--admin-text-secondary)] mt-0.5">{row.user?.email || row.address?.mobile || 'No Contact Data'}</span>
         </div>
       )
    },
    { 
       header: 'Revenue', 
       accessor: (row: any) => (
         <div>
           <span className="block font-medium text-gray-900">₹{(row.total || row.totalAmount || 0).toLocaleString('en-IN')}</span>
           <span className="block text-xs text-[var(--admin-text-secondary)] tracking-wider uppercase mt-0.5">{row.paymentMethod || 'COD'}</span>
         </div>
       )
    },
    { 
       header: 'Status Axis', 
       accessor: (row: any) => {
          const status = (row.status || 'pending').toLowerCase();
          const isDelivered = status === 'delivered';
          const isCancelled = status === 'cancelled';
          const colorClass = isDelivered ? 'bg-green-50 text-green-700 border-green-200' : isCancelled ? 'bg-red-50 text-red-700 border-red-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200';
          
         return (
            <span 
              onClick={(e) => {
                 e.stopPropagation();
                 updateStatus(row._id, status);
              }}
              title="Click to Progress Status"
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
         <div className="flex items-center space-x-2">
           <button 
             onClick={() => setSelectedOrderId(row._id)}
             className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors" title="View Full Details"
           >
             <Eye size={16} />
           </button>
           <div className={`p-1 w-2 h-2 rounded-full ${row.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-yellow-500'}`} title={`Payment: ${row.paymentStatus}`}></div>
         </div>
       )
    }
  ], [updateStatus]);

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center">
            <ShoppingBag className="w-6 h-6 mr-3 text-primary-700" /> Administrative Orders Hub
          </h1>
          <p className="text-sm text-[var(--admin-text-secondary)]">Monitor fulfillment workflows, payment captures, and logistic dispatches.</p>
        </div>
      </div>

      <DataTable 
         columns={columns as any}
         data={orders}
         loading={loading}
         onRowClick={(row) => setSelectedOrderId(row._id)}
         emptyMessage="No global orders detected across the application architecture."
         pagination={{
           page: pagination.page,
           limit: pagination.limit,
           total: Math.max(pagination.total, orders.length),
           onPageChange: (newPage) => setPagination({...pagination, page: newPage})
         }}
      />

      {selectedOrderId && (
        <AdminOrderDetailModal 
          orderId={selectedOrderId} 
          onClose={() => setSelectedOrderId(null)}
          onUpdate={() => fetchOrders(pagination.page)}
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;


