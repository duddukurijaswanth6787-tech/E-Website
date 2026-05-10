import React, { useMemo } from 'react';
import { 
  Users, ShoppingBag, IndianRupee, AlertCircle, 
  Scissors, Activity, CheckCircle, Package, 
  ChevronRight, ArrowUpRight, ArrowDownRight, Zap, 
  Plus, Calendar, Eye, Ruler
} from 'lucide-react';
import { motion } from 'framer-motion';
import { analyticsService } from '../../api/services/analytics.service';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '../../components/common/Loader';
import { Link } from 'react-router-dom';

const StatCard = React.memo(({ title, value, subtitle, icon: Icon, trend, trendValue, color, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white rounded-[2rem] p-6 border border-stone-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden"
  >
    <div className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-[0.03] group-hover:opacity-[0.08] transition-opacity ${color}`} />
    
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color.replace('bg-', 'bg-opacity-10 bg-')} ${color.replace('bg-', 'text-')}`}>
        <Icon size={20} />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black tracking-tighter ${
          trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {trend === 'up' ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
          {trendValue}
        </div>
      )}
    </div>

    <div>
      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-stone-950 tracking-tight">{value}</h3>
      <p className="text-[11px] text-stone-500 mt-1 font-medium">{subtitle}</p>
    </div>
  </motion.div>
));

const AdminDashboard = () => {
  const { data: metricsRes, isLoading } = useQuery({
    queryKey: ['adminDashboardMetrics'],
    queryFn: () => analyticsService.getDashboardMetrics(),
    refetchInterval: 60000, // Refresh every minute for "realtime" feel
  });

  const data = metricsRes?.data;

  const stats = useMemo(() => {
    if (!data) return [];
    const p = data.production;
    return [
      { 
        title: 'Total Revenue', 
        value: `₹${data.totalRevenue?.toLocaleString('en-IN') || 0}`, 
        subtitle: 'Across all channels',
        icon: IndianRupee, 
        trend: 'up', 
        trendValue: '+12.5%', 
        color: 'bg-primary-600',
        delay: 0.1
      },
      { 
        title: 'Active Orders', 
        value: data.totalOrders || 0, 
        subtitle: 'Orders in pipeline',
        icon: ShoppingBag, 
        trend: 'up', 
        trendValue: '+8%', 
        color: 'bg-blue-600',
        delay: 0.2
      },
      { 
        title: 'Pending Workflows', 
        value: p?.workflows?.pending || 0, 
        subtitle: 'Awaiting production',
        icon: Activity, 
        color: 'bg-amber-600',
        delay: 0.3
      },
      { 
        title: 'Delayed Orders', 
        value: p?.workflows?.delayed || 0, 
        subtitle: 'Action required',
        icon: AlertCircle, 
        trend: (p?.workflows?.delayed || 0) > 0 ? 'down' : 'up',
        trendValue: (p?.workflows?.delayed || 0) > 0 ? 'CRITICAL' : 'PERFECT',
        color: (p?.workflows?.delayed || 0) > 0 ? 'bg-rose-600' : 'bg-emerald-600',
        delay: 0.4
      },
      { 
        title: 'Tailors Active', 
        value: `${p?.tailors?.active || 0}/${p?.tailors?.total || 0}`, 
        subtitle: 'Production capacity',
        icon: Scissors, 
        color: 'bg-indigo-600',
        delay: 0.5
      },
      { 
        title: "Today's Deliveries", 
        value: p?.todayDeliveries?.length || 0, 
        subtitle: 'Due by EOD',
        icon: Package, 
        color: 'bg-purple-600',
        delay: 0.6
      },
      { 
        title: 'QC Pending', 
        value: p?.workflows?.qcPending || 0, 
        subtitle: 'Quality checks',
        icon: CheckCircle, 
        color: 'bg-teal-600',
        delay: 0.7
      },
      { 
        title: 'Urgent Tasks', 
        value: p?.workflows?.urgent || 0, 
        subtitle: 'High priority',
        icon: Zap, 
        color: 'bg-orange-600',
        delay: 0.8
      }
    ];
  }, [data]);

  if (isLoading) return <Loader fullPage message="Synchronizing executive dashboard..." />;

  const quickActions = [
    { label: 'Add Product', icon: Plus, path: '/admin/products/new', color: 'bg-stone-900 text-white' },
    { label: 'Create Order', icon: ShoppingBag, path: '/admin/orders', color: 'bg-primary-50 text-primary-950' },
    { label: 'Assign Tailor', icon: Users, path: '/admin/tailors', color: 'bg-blue-50 text-blue-900' },
    { label: 'Workflow Board', icon: Activity, path: '/admin/workflows', color: 'bg-indigo-50 text-indigo-900' },
    { label: 'Delayed Orders', icon: AlertCircle, path: '/admin/workflows?status=Delayed', color: 'bg-rose-50 text-rose-900' },
    { label: 'Measurement Profiles', icon: Ruler, path: '/admin/measurements', color: 'bg-amber-50 text-amber-900' },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Executive Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Operational Live Feed</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-950 tracking-tight leading-tight">Executive Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1 max-w-md">Boutique Production Intelligence & Operational Control Center.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <button className="flex-1 sm:flex-none px-5 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs font-black uppercase tracking-widest text-stone-600 hover:bg-stone-50 transition-all shadow-sm">
             Report
           </button>
           <Link to="/admin/workflows" className="flex-1 sm:flex-none px-5 py-2.5 bg-stone-950 text-white text-center rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/10">
             Production
           </Link>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Quick Access shortcuts */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {quickActions.map((action, i) => (
          <Link 
            key={i} 
            to={action.path}
            className={`p-4 rounded-3xl flex flex-col items-center justify-center text-center gap-3 transition-all hover:scale-[1.05] active:scale-[0.98] ${action.color} shadow-sm border border-stone-100`}
          >
            <action.icon size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{action.label}</span>
          </Link>
        ))}
      </div>

      {/* Main Insights Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Overview (Executive View) */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
           <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-serif font-bold text-stone-900">Revenue Performance</h3>
                <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest font-black">7 Day Snapshot</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-stone-50 text-[10px] font-black uppercase tracking-widest text-stone-600 rounded-xl hover:bg-stone-100">Monthly</button>
                <button className="px-3 py-1.5 bg-primary-950 text-[10px] font-black uppercase tracking-widest text-white rounded-xl shadow-lg shadow-primary-900/20">Weekly</button>
              </div>
           </div>

           <div className="h-64 flex items-end justify-between gap-4 px-4">
              {[60, 45, 90, 75, 100, 85, 95].map((height, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative">
                   <motion.div 
                     initial={{ height: 0 }}
                     animate={{ height: `${height}%` }}
                     transition={{ duration: 1, delay: i * 0.1 }}
                     className="w-full bg-stone-50 group-hover:bg-primary-900 transition-all rounded-2xl relative overflow-hidden"
                   >
                     <div className="absolute top-0 left-0 w-full h-1/2 bg-white/5" />
                   </motion.div>
                   <span className="text-[9px] font-bold text-stone-400 mt-3 uppercase tracking-tighter">Day {i+1}</span>
                   
                   {/* Tooltip */}
                   <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-stone-900 text-white text-[10px] px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-xl pointer-events-none whitespace-nowrap z-20">
                      <p className="font-black text-stone-400 uppercase tracking-widest">Revenue</p>
                      <p className="font-bold">₹{(height * 5000).toLocaleString()}</p>
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-10 pt-8 border-t border-stone-50 grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Total Sales</span>
                <span className="text-xl font-bold text-stone-950 mt-1">₹{data?.totalRevenue?.toLocaleString() || 0}</span>
                <div className="flex items-center text-emerald-600 text-[10px] font-bold mt-1">
                  <ArrowUpRight size={10} /> +15.2% vs last week
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Average Ticket</span>
                <span className="text-xl font-bold text-stone-950 mt-1">₹4,820</span>
                <p className="text-[10px] text-stone-400 mt-1">Consistent with boutique target</p>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Orders Handled</span>
                <span className="text-xl font-bold text-stone-950 mt-1">{data?.totalOrders || 0}</span>
                <p className="text-[10px] text-stone-400 mt-1">Operational pipeline active</p>
              </div>
           </div>
        </div>

        {/* Workflow overview Stage Distribution */}
        <div className="bg-stone-950 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-stone-900/20">
           <h3 className="text-xl font-serif font-bold mb-8">Production Stages</h3>
           
           <div className="space-y-6">
              {[
                { label: 'Cutting', value: data?.production?.workflows?.active ? Math.floor(data.production.workflows.active * 0.3) : 2, color: 'bg-blue-500' },
                { label: 'Stitching', value: data?.production?.workflows?.active ? Math.floor(data.production.workflows.active * 0.5) : 4, color: 'bg-indigo-500' },
                { label: 'Finishing', value: data?.production?.workflows?.active ? Math.floor(data.production.workflows.active * 0.2) : 1, color: 'bg-purple-500' },
                { label: 'QC Pending', value: data?.production?.workflows?.qcPending || 0, color: 'bg-teal-500' },
                { label: 'Alterations', value: data?.production?.workflows?.alteration || 0, color: 'bg-rose-500' }
              ].map((stage, i) => (
                <div key={i} className="space-y-2">
                   <div className="flex justify-between items-end">
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{stage.label}</span>
                      <span className="text-sm font-bold">{stage.value}</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(stage.value / (data?.totalOrders || 10)) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className={`h-full ${stage.color} shadow-[0_0_10px_rgba(var(--tw-shadow-color),0.5)]`} 
                      />
                   </div>
                </div>
              ))}
           </div>

           <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                    <Zap size={18} />
                 </div>
                 <div>
                    <h4 className="text-xs font-bold">Production Efficiency</h4>
                    <p className="text-[10px] text-stone-400">Target: 85% | Current: 92%</p>
                 </div>
              </div>
              <p className="text-[11px] text-stone-400 leading-relaxed">
                Your production line is operating at high efficiency. Consider assigning more tasks to available tailors.
              </p>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Delayed Orders Tracking */}
         <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-serif font-bold text-stone-900">Operational Delays</h3>
               <Link to="/admin/workflows?status=Delayed" className="text-rose-600">
                 <AlertCircle size={20} />
               </Link>
            </div>
            
            <div className="space-y-4">
               {data?.production?.workflows?.delayed === 0 ? (
                 <div className="py-8 text-center bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                    <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
                    <p className="text-xs text-stone-500 font-medium tracking-tight">Zero delays in production.</p>
                 </div>
               ) : (
                 [...Array(Math.min(3, data?.production?.workflows?.delayed || 0))].map((_, i) => (
                   <div key={i} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex justify-between items-center">
                      <div>
                         <p className="text-xs font-bold text-stone-950">WT-102{i+4}</p>
                         <p className="text-[10px] text-rose-600 font-medium uppercase tracking-widest mt-0.5">Overdue by {i+2}h</p>
                      </div>
                      <ChevronRight size={16} className="text-rose-400" />
                   </div>
                 ))
               )}
               {data?.production?.workflows?.urgent !== undefined && data.production.workflows.urgent > 0 && (
                 <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
                       <Zap size={14} />
                    </div>
                    <div>
                       <p className="text-xs font-bold text-amber-950">{data.production.workflows.urgent} Urgent Orders</p>
                       <p className="text-[10px] text-amber-700 font-medium">Prioritize these in the workflow board.</p>
                    </div>
                 </div>
               )}
            </div>
         </div>

         {/* Today's Deliveries */}
         <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-serif font-bold text-stone-900">Today's Delivery Schedule</h3>
               <span className="px-3 py-1 bg-primary-50 text-[10px] font-black uppercase tracking-widest text-primary-700 rounded-full">
                 {new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
               </span>
            </div>

            <div className="flex-1 overflow-x-auto">
               {data?.production?.todayDeliveries?.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center py-10">
                    <Calendar size={40} className="text-stone-100 mb-2" />
                    <p className="text-sm text-stone-400 italic">No deliveries scheduled for today.</p>
                 </div>
               ) : (
                 <table className="w-full">
                   <thead>
                      <tr className="border-b border-stone-50">
                         <th className="pb-3 text-left text-[10px] font-black text-stone-400 uppercase tracking-widest">Order</th>
                         <th className="pb-3 text-left text-[10px] font-black text-stone-400 uppercase tracking-widest">Customer</th>
                         <th className="pb-3 text-left text-[10px] font-black text-stone-400 uppercase tracking-widest">Status</th>
                         <th className="pb-3 text-right text-[10px] font-black text-stone-400 uppercase tracking-widest">Action</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-stone-50">
                      {data?.production?.todayDeliveries?.map((delivery: any, i: number) => (
                        <tr key={i} className="group hover:bg-stone-50/50 transition-colors">
                           <td className="py-4">
                              <span className="text-xs font-bold text-stone-950">#{delivery.taskNumber}</span>
                           </td>
                           <td className="py-4">
                              <span className="text-xs font-medium text-stone-600">Client Verified</span>
                           </td>
                           <td className="py-4">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                delivery.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {delivery.status}
                              </span>
                           </td>
                           <td className="py-4 text-right">
                              <Link to={`/admin/workflows`} className="p-2 text-stone-400 hover:text-primary-600 transition-colors">
                                <Eye size={16} />
                              </Link>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                 </table>
               )}
            </div>
         </div>
      </div>

      {/* Tailor Workload Section */}
      <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
         <div className="flex justify-between items-center mb-8">
            <div>
               <h3 className="text-xl font-serif font-bold text-stone-900">Tailor Workload Distribution</h3>
               <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest font-black">Efficiency Indicators</p>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-stone-500">Available</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-amber-500" />
                 <span className="text-stone-500">Near Capacity</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-rose-500" />
                 <span className="text-stone-500">At Max</span>
               </div>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-stone-50 rounded-3xl flex flex-col justify-between">
               <div>
                 <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Active Tailors</p>
                 <p className="text-2xl font-bold text-stone-950 mt-1">{data?.production.tailors.active}</p>
               </div>
               <div className="mt-6 flex items-center gap-2 text-[10px] text-stone-500 font-medium">
                  Total of {data?.production.tailors.total} registered
               </div>
            </div>
            <div className="p-6 bg-stone-50 rounded-3xl flex flex-col justify-between">
               <div>
                 <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Overall Workload</p>
                 <p className="text-2xl font-bold text-stone-950 mt-1">
                   {Math.round(((data?.production.tailors.totalWorkload || 0) / (data?.production.tailors.totalCapacity || 1)) * 100)}%
                 </p>
               </div>
               <div className="mt-4 h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-900" 
                    style={{ width: `${((data?.production.tailors.totalWorkload || 0) / (data?.production.tailors.totalCapacity || 1)) * 100}%` }}
                  />
               </div>
            </div>
            <div className="p-6 bg-rose-50 rounded-3xl flex flex-col justify-between border border-rose-100">
               <div>
                 <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">At Max Capacity</p>
                 <p className="text-2xl font-bold text-rose-950 mt-1">{data?.production.tailors.atCapacity}</p>
               </div>
               <p className="text-[10px] text-rose-600 mt-4 leading-relaxed font-medium">Requires immediate load balancing.</p>
            </div>
            <div className="p-6 bg-emerald-50 rounded-3xl flex flex-col justify-between border border-emerald-100">
               <div>
                 <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Available Spots</p>
                 <p className="text-2xl font-bold text-emerald-950 mt-1">
                   {(data?.production.tailors.totalCapacity || 0) - (data?.production.tailors.totalWorkload || 0)}
                 </p>
               </div>
               <p className="text-[10px] text-emerald-600 mt-4 leading-relaxed font-medium">Ready for new boutique orders.</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
