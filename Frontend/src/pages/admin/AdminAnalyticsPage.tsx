import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, ShoppingBag, PieChart, Activity, Zap, AlertCircle } from 'lucide-react';
import { analyticsService, type DashboardAnalytics } from '../../api/services/analytics.service';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Loader } from '../../components/common/Loader';

const AdminAnalyticsPage = () => {
  const [data, setData] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await analyticsService.getDashboardMetrics();
      if (res && res.data) {
        setData(res.data);
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

  if (loading) return <Loader fullPage message="Compiling executive intelligence..." />;

  return (
    <div className="space-y-10 max-w-[100vw] overflow-hidden pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-serif font-bold text-stone-950 tracking-tight flex items-center">
            <BarChart3 className="w-10 h-10 mr-4 text-primary-900" /> Executive Analytics
          </h1>
          <p className="text-sm text-stone-500 mt-2">Deeper revenue insights, production vectors, and boutique growth metrics.</p>
        </div>
        <button 
          onClick={fetchMetrics}
          className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-100 border border-stone-200 transition-all"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Verified Revenue', val: `₹${(data?.totalRevenue || 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Active Customers', val: (data?.totalUsers || 0).toLocaleString(), icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Lifetime Orders', val: (data?.totalOrders || 0).toLocaleString(), icon: ShoppingBag, color: 'text-indigo-600 bg-indigo-50' },
          { label: 'Active Catalog', val: (data?.totalProducts || 0).toLocaleString(), icon: PieChart, color: 'text-purple-600 bg-purple-50' }
        ].map((k, i) => (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             key={i} 
             className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex items-center justify-between transition-all hover:shadow-xl group"
           >
              <div>
                <span className="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-black block mb-1">{k.label}</span>
                <span className="text-2xl font-bold text-stone-950">{k.val}</span>
              </div>
              <div className={`w-12 h-12 ${k.color} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500`}>
                <k.icon size={24} />
              </div>
           </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
        {/* Production Efficiency Matrix */}
        <div className="lg:col-span-2 bg-stone-950 rounded-[2.5rem] p-8 text-white shadow-2xl">
           <div className="flex justify-between items-center mb-10">
              <h3 className="text-xl font-serif font-bold">Production Efficiency Vectors</h3>
              <Activity className="text-primary-400" size={24} />
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Order Fulfilment Rate</span>
                       <span className="text-xs font-bold text-emerald-400">94.2%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: '94.2%' }} />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">QC Pass Velocity</span>
                       <span className="text-xs font-bold text-blue-400">88.5%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-blue-500" style={{ width: '88.5%' }} />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between mb-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">SLA Adherence</span>
                       <span className="text-xs font-bold text-purple-400">91.8%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-purple-500" style={{ width: '91.8%' }} />
                    </div>
                 </div>
              </div>

              <div className="flex flex-col justify-center items-center text-center p-8 bg-white/5 rounded-[2rem] border border-white/10 relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Zap size={100} />
                 </div>
                 <h4 className="text-sm font-black uppercase tracking-[0.2em] text-stone-400 mb-2">Growth Index</h4>
                 <p className="text-5xl font-serif font-bold mb-4">A+</p>
                 <p className="text-xs text-stone-500 leading-relaxed max-w-[200px]">
                   Boutique production performance is optimal. Scaling capacity recommended.
                 </p>
              </div>
           </div>
        </div>

        {/* Structural Aggregates */}
        <div className="bg-white border border-stone-100 rounded-[2.5rem] p-8 shadow-sm flex flex-col justify-between">
           <div>
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-8">Alert Thresholds</h3>
              <div className="space-y-4">
                <div className="p-5 bg-rose-50/50 rounded-[2rem] border border-rose-100 flex items-center justify-between group hover:bg-rose-50 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-rose-500 rounded-2xl flex items-center justify-center text-white">
                          <AlertCircle size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-rose-400">Low Stock</p>
                          <p className="text-sm font-bold text-stone-900">Critical Items</p>
                       </div>
                    </div>
                    <span className="text-xl font-bold text-rose-700">{data?.lowStockProducts || 0}</span>
                </div>
                
                <div className="p-5 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 flex items-center justify-between group hover:bg-indigo-50 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-white">
                          <ShoppingBag size={20} />
                       </div>
                       <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Custom Queue</p>
                          <p className="text-sm font-bold text-stone-900">Pending Bespoke</p>
                       </div>
                    </div>
                    <span className="text-xl font-bold text-indigo-700">{data?.pendingBlouseRequests || 0}</span>
                </div>
              </div>
           </div>

           <div className="mt-10 p-6 bg-stone-50 rounded-[2rem] border border-stone-100">
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-2">Quick Insight</p>
              <p className="text-xs text-stone-600 leading-relaxed">
                Aggregates show a 12% increase in bespoke requests compared to last month.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
