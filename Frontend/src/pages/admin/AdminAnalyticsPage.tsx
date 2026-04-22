import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, ShoppingBag } from 'lucide-react';
import { analyticsService } from '../../api/services/analytics.service';
import type { DashboardAnalytics } from '../../api/services/analytics.service';
import toast from 'react-hot-toast';

const AdminAnalyticsPage = () => {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getDashboardMetrics();
      if (res && res.data) {
        setData((res as any).data.data || res.data);
      }
    } catch (e) {
      console.error("Dashboard Analytics Error", e);
      toast.error('Failed to load global insight aggregations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6 max-w-[100vw] overflow-hidden">
      <div>
        <h1 className="text-2xl font-serif text-gray-900 mb-1 flex items-center">
          <BarChart3 className="w-6 h-6 mr-3 text-primary-700" /> Executive Analytics Console
        </h1>
        <p className="text-sm text-gray-500">Monitor deep revenue aggregates, retention vectors, and real Mongo accumulations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Gross Verified Revenue', val: loading ? '...' : `₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp },
          { label: 'Active User Database', val: loading ? '...' : (data?.totalUsers || 0).toLocaleString(), icon: Users },
          { label: 'Total Placed Orders', val: loading ? '...' : (data?.totalOrders || 0).toLocaleString(), icon: ShoppingBag },
          { label: 'Indexed Products', val: loading ? '...' : (data?.totalProducts || 0).toLocaleString(), icon: BarChart3 }
        ].map((k, i) => (
           <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between transition-all hover:-translate-y-1 hover:shadow-md">
              <div>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-bold block mb-1">{k.label}</span>
                <span className="text-2xl font-black text-gray-900">{k.val}</span>
              </div>
              <div className="w-12 h-12 bg-primary-50 rounded flex items-center justify-center border border-primary-100 shadow-inner">
                <k.icon className="text-primary-700" size={24} />
              </div>
           </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* DB Aggregation Output - Low Stock Matrix */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
           <h3 className="font-bold text-gray-900 mb-4 border-b pb-2 uppercase tracking-widest text-xs">Structural Aggregates</h3>
           <div className="flex flex-col space-y-4">
             <div className="flex justify-between items-center bg-red-50 p-3 rounded border border-red-100">
                <span className="text-sm font-medium text-red-900">Immediate Action: Low Stock Limit Reached</span>
                <span className="text-xl font-bold text-red-700">{data?.lowStockProducts || 0}</span>
             </div>
             <div className="flex justify-between items-center bg-blue-50 p-3 rounded border border-blue-100">
                <span className="text-sm font-medium text-blue-900">Pending Bespoke Alignments in Queue</span>
                <span className="text-xl font-bold text-blue-700">{data?.pendingBlouseRequests || 0}</span>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
