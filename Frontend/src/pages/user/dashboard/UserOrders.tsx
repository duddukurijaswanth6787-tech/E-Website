import { useEffect, useState } from 'react';
import { orderService } from '../../../api/services/order.service';
import { Package, Clock, CheckCircle, XCircle, ArrowUpRight, Truck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ImageWithSkeleton } from '../../../components/common/Skeleton';
import { Loader } from '../../../components/common/Loader';
import { EmptyState } from '../../../components/common/EmptyState';

const UserOrders = () => {
  const navigate = useNavigate();
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

  if (loading) return <Loader fullPage message="Fetching your order history..." />;

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <h1 className="text-2xl font-serif text-primary-950 mb-6">Order History</h1>
      {orders.length === 0 ? (
        <div className="py-16 max-w-2xl mx-auto">
          <EmptyState 
            icon={Package} 
            title="No Orders Yet" 
            description="You haven't placed any orders with Vasanthi Creations yet. Explore our bespoke collections and discover your next favorite piece." 
            actionLabel="Start Shopping"
            onAction={() => navigate('/shop')}
          />
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
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                   <div className="flex flex-col sm:flex-row sm:gap-8">
                     <div>
                       <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1">Order Placed</p>
                       <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</p>
                     </div>
                     <div>
                       <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1">Total Amount</p>
                       <p className="font-medium text-gray-900">₹{(order.total || 0).toLocaleString('en-IN')}</p>
                     </div>
                     <div>
                       <p className="text-xs font-semibold tracking-widest uppercase text-gray-500 mb-1">Order ID</p>
                       <p className="font-medium text-primary-800">#{order._id.substring(0,8).toUpperCase()}</p>
                     </div>
                   </div>
                   <div className="flex items-center gap-4">
                     {order.trackingUrl && <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold uppercase tracking-widest text-[#D4AF37]">Track <Truck className="w-4 h-4 ml-1 inline" /></a>}
                     <Link to={`/my/orders/${order._id}`} className="text-sm font-bold uppercase tracking-widest text-primary-700">Details <ArrowUpRight className="w-4 h-4 ml-1 inline" /></Link>
                   </div>
                </div>
                <div className="p-6">
                   <div className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-semibold mb-6 ${statusColor}`}><StatusIcon className="w-5 h-5 mr-2" />{order.status}</div>
                   <div className="flex gap-4 overflow-x-auto pb-4">
                     {order.items.map((item: any, idx: number) => (
                       <div key={idx} className="flex-shrink-0 w-24 h-32 bg-gray-100 rounded-lg overflow-hidden border">
                          <ImageWithSkeleton src={(typeof item.image === 'string' ? item.image : item.image?.url) || (typeof item.product?.images?.[0] === 'string' ? item.product?.images?.[0] : item.product?.images?.[0]?.url) || 'https://placehold.co/400x600'} alt="" className="w-full h-full object-cover" />
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
