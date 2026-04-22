import { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { orderService } from '../../api/services/order.service';
import { ShoppingBag, Eye, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
       // Attempt Admin Specific endpoint
       const res = await orderService.getAdminOrders({ page, limit: pagination.limit });
       
       if (res.data) {
          const fetchedOrders = res.data.orders || (res.data as any).data || (res.data as any) || [];
          
          // Normalize if backend doesn't properly unwrap array
          const ordersArray = Array.isArray(fetchedOrders) ? fetchedOrders : Object.values(fetchedOrders);
          
          setOrders(ordersArray);
          
          if (res.data.pagination) {
             setPagination({
                page: res.data.pagination.page,
                limit: res.data.pagination.limit,
                total: res.data.pagination.total
             });
          } else {
             setPagination(prev => ({ ...prev, total: ordersArray.length || 0 }));
          }
       }
    } catch (e: any) {
       console.error("Failed to load admin orders", e);
       // Graceful fallback to mocked state if Endpoint missing
       if (e?.response?.status === 404) {
          toast.error("Backend Gap: GET /api/v1/orders/admin missing. Cannot poll global system orders.");
       } else {
          toast.error("Failed to fetch order timeline.");
       }
       setOrders([]);
    } finally {
       setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(pagination.page);
  }, [pagination.page]);

  const updateStatus = async (id: string, currentStatus: string) => {
    // Simple state machine for demo
    const nextStatus = currentStatus === 'PROCESSING' ? 'SHIPPED' : currentStatus === 'SHIPPED' ? 'DELIVERED' : 'PROCESSING';
    try {
       await orderService.updateOrderStatus(id, nextStatus);
       toast.success(`Order #${id.substring(0,8)} marked as ${nextStatus}`);
       fetchOrders(pagination.page);
    } catch (e: any) {
       toast.error("Status Mutation Failed. Is PATCH /api/v1/orders/:id/status implemented?");
    }
  };

  const columns = [
    { 
       header: 'Order Details', 
       accessor: (row: any) => (
         <div>
           <span className="block font-medium tracking-wide text-primary-950 uppercase text-xs">#{row._id?.substring(0,10) || row.id}</span>
           <span className="block text-xs text-gray-500 mt-1">{new Date(row.createdAt || row.date).toLocaleString()}</span>
         </div>
       )
    },
    { 
       header: 'Customer', 
       accessor: (row: any) => (
         <div>
           <span className="block font-medium text-gray-900">{row.user?.name || row.shippingAddress?.fullName || 'Guest Customer'}</span>
           <span className="block text-xs text-gray-500 mt-0.5">{row.user?.email || row.user?.mobile || 'No Contact Data'}</span>
         </div>
       )
    },
    { 
       header: 'Revenue', 
       accessor: (row: any) => (
         <div>
           <span className="block font-medium text-gray-900">₹{row.totalAmount?.toLocaleString('en-IN') || 0}</span>
           <span className="block text-xs text-gray-500 tracking-wider uppercase mt-0.5">{row.paymentMethod || 'COD'}</span>
         </div>
       )
    },
    { 
       header: 'Status Axis', 
       accessor: (row: any) => {
          const status = row.orderStatus || row.status || 'PENDING';
          const isDelivered = status === 'DELIVERED';
          const isProcessing = status === 'PROCESSING';
          const colorClass = isDelivered ? 'bg-green-50 text-green-700 border-green-200' : isProcessing ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-yellow-50 text-yellow-700 border-yellow-200';
          
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
       accessor: () => (
         <div className="flex items-center space-x-2">
           <button className="p-1.5 text-gray-400 hover:text-primary-700 transition-colors" title="View Secure Log">
             <Eye size={16} />
           </button>
           <button className="p-1.5 text-gray-400 hover:text-green-600 transition-colors" title="Payment Sync">
             <DollarSign size={16} />
           </button>
         </div>
       )
    }
  ];

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center">
            <ShoppingBag className="w-6 h-6 mr-3 text-primary-700" /> Administrative Orders Hub
          </h1>
          <p className="text-sm text-gray-500">Monitor fulfillment workflows, payment captures, and logistic dispatches.</p>
        </div>
      </div>

      {/* Main DataTable Wrapper */}
      <DataTable 
         columns={columns as any}
         data={orders}
         loading={loading}
         emptyMessage="No global orders detected across the application architecture."
         pagination={{
           page: pagination.page,
           limit: pagination.limit,
           total: Math.max(pagination.total, orders.length),
           onPageChange: (newPage) => setPagination({...pagination, page: newPage})
         }}
      />
    </div>
  );
};

export default AdminOrdersPage;
