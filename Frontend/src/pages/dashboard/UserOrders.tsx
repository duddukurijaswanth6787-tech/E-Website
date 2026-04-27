import { useEffect, useState } from 'react';
import { orderService } from '../../api/services/order.service';
import { Package, Clock, CheckCircle, XCircle, ArrowUpRight, Truck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Skeleton, ImageWithSkeleton } from '../../components/common/Skeleton';

const UserOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderService.getUserOrders();
        setOrders((res as any).data?.data || (res as any).data || res || []);
      } catch (err) {
        console.error("Orders fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
     return (
       <div className="p-6 md:p-8 space-y-6">
         <Skeleton className="h-10 w-48 mb-6" />
         {[...Array(3)].map((_, i) => (
           <Skeleton key={i} className="h-40 w-full rounded-xl" />
         ))}
       </div>
     );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <h1 className="text-2xl font-serif text-primary-950 mb-6">Order History</h1>
      
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-gray-100">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-serif text-gray-900 mb-2">No Orders Found</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">You haven't placed any orders yet. Start exploring our curations to find something you love.</p>
          <Link to="/shop" className="bg-primary-950 text-white px-8 py-3 rounded text-sm font-bold uppercase tracking-widest hover:bg-primary-800 transition-colors">Browse Collections</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            let StatusIcon = Clock;
            let statusColor = "text-orange-600 bg-orange-50 border-orange-200";
            
            const status = (order.status || 'pending').toUpperCase();
            if (status === 'DELIVERED') {
               StatusIcon = CheckCircle;
               statusColor = "text-green-700 bg-green-50 border-green-200";
            } else if (status === 'CANCELLED') {
               StatusIcon = XCircle;
               statusColor = "text-red-700 bg-red-50 border-red-200";
            }

            return (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                   <div className="flex flex-col sm:flex-row sm:gap-8">
                     <div>
                       <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1">Order Placed</p>
                       <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                     </div>
                     <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
                     <div>
                       <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1">Total Amount</p>
                       <p className="font-medium text-gray-900">₹{(order.total || 0).toLocaleString('en-IN')}</p>
                     </div>
                     <div className="hidden sm:block w-px h-10 bg-gray-200"></div>
                     <div>
                       <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1">Order ID</p>
                       <p className="font-medium text-primary-800">#{order._id.substring(0,8).toUpperCase()}</p>
                     </div>
                   </div>
                   
                   <div className="flex items-center gap-4">
                     {order.trackingUrl && (
                       <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs font-bold uppercase tracking-widest text-[#D4AF37] hover:text-[#B38D19]">
                         Track <Truck className="w-4 h-4 ml-1" />
                       </a>
                     )}
                     <Link to={`/my/orders/${order._id}`} className="flex items-center text-sm font-bold uppercase tracking-widest text-primary-700 hover:text-primary-900">
                       Details <ArrowUpRight className="w-4 h-4 ml-1" />
                     </Link>
                   </div>
                </div>
                
                <div className="p-6">
                   <div className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-semibold mb-6 ${statusColor}`}>
                     <StatusIcon className="w-5 h-5 mr-2" />
                     {order.status} {order.status?.toUpperCase() === 'DELIVERED' ? 'ON ' + new Date(order.updatedAt).toLocaleDateString() : ''}
                   </div>
                   
                   <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                     {order.items.map((item: any, idx: number) => (
                       <div key={idx} className="flex-shrink-0 w-24 h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                          <ImageWithSkeleton src={item.image || item.product?.images?.[0] || 'https://placehold.co/400x600/f3f4f6/A51648?text=Item'} alt={item.name || item.product?.name || 'Product'} className="w-full h-full object-cover" containerClassName="w-full h-full" />
                       </div>
                     ))}
                   </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserOrders;
