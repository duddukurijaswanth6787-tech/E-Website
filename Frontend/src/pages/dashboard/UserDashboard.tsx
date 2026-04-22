import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { orderService } from '../../api/services/order.service';
import { Package, MapPin, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ orders: 0, processing: 0 });
  const [recentOrder, setRecentOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const ordersRes = await orderService.getUserOrders();
        const orders = ordersRes.data || [];
        
        setStats({
          orders: orders.length,
          processing: orders.filter((o: any) => o.orderStatus === 'PROCESSING').length
        });

        if (orders.length > 0) {
          setRecentOrder(orders[0]); // assuming sorted by newest first
        }
      } catch (err) {
        console.error("Dashboard fetch error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-serif text-primary-950 mb-2">Welcome Back, {user?.name}</h1>
      <p className="text-gray-600 mb-8 font-light">Here's a quick overview of your account and recent activity.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-primary-50 rounded-xl p-6 border border-primary-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase text-primary-800 mb-1">Total Orders</p>
            <h3 className="text-3xl font-bold text-primary-950">{loading ? '-' : stats.orders}</h3>
          </div>
          <Package className="w-10 h-10 text-primary-300" />
        </div>
        <div className="bg-orange-50 rounded-xl p-6 border border-orange-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase text-orange-800 mb-1">Processing</p>
            <h3 className="text-3xl font-bold text-orange-950">{loading ? '-' : stats.processing}</h3>
          </div>
          <Clock className="w-10 h-10 text-orange-300" />
        </div>
        <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-sm font-semibold tracking-widest uppercase text-emerald-800 mb-1">Addresses</p>
            <h3 className="text-3xl font-bold text-emerald-950">Active</h3>
          </div>
          <MapPin className="w-10 h-10 text-emerald-300" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-serif text-primary-950">Recent Order</h2>
          {recentOrder && (
            <Link to="/my/orders" className="text-sm font-semibold tracking-widest uppercase text-primary-700 hover:text-primary-900 flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          )}
        </div>
        <div className="p-6">
          {loading ? (
             <div className="animate-pulse flex space-x-4">
               <div className="flex-1 space-y-4 py-1">
                 <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                 <div className="space-y-2">
                   <div className="h-4 bg-gray-200 rounded"></div>
                   <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                 </div>
               </div>
             </div>
          ) : recentOrder ? (
            <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50 border border-gray-100 p-4 rounded-lg">
               <div>
                  <p className="font-semibold text-gray-900">Order #{recentOrder._id.substring(0,8).toUpperCase()}</p>
                  <p className="text-sm text-gray-500 mt-1">Placed on {new Date(recentOrder.createdAt).toLocaleDateString()}</p>
               </div>
               <div className="mt-4 sm:mt-0 text-center sm:text-right">
                  <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-widest ${recentOrder.orderStatus === 'DELIVERED' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                     {recentOrder.orderStatus}
                  </span>
                  <p className="text-gray-900 font-semibold mt-2">₹{recentOrder.totalAmount.toLocaleString('en-IN')}</p>
               </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">You haven't placed any orders yet.</p>
              <Link to="/shop" className="inline-block mt-4 bg-primary-950 text-white px-6 py-2 rounded text-sm font-bold uppercase tracking-widest hover:bg-primary-800 transition-colors">Start Shopping</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
