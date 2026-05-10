import { useMemo } from 'react';
import { 
  AlertCircle, 
  Scissors, Activity, Clock, CheckCircle, Package, 
  ChevronRight, ArrowUpRight, ArrowDownRight, Zap, 
  Calendar, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { analyticsService } from '../../../api/services/analytics.service';
import { useQuery } from '@tanstack/react-query';
import { Loader } from '../../../components/common/Loader';
import { Link } from 'react-router-dom';
import React from 'react';

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

const ManagerDashboardOverview = () => {
  const { data: metricsRes, isLoading } = useQuery({
    queryKey: ['managerDashboardMetrics'],
    queryFn: () => analyticsService.getDashboardMetrics(),
    refetchInterval: 30000, // Faster refresh for managers
  });

  const data = metricsRes?.data;

  const stats = useMemo(() => {
    if (!data) return [];
    const p = data.production;
    return [
      { 
        title: 'Active Workflows', 
        value: p.workflows.active + p.workflows.pending, 
        subtitle: 'Production Pipeline',
        icon: Activity, 
        color: 'bg-blue-600',
        delay: 0.1
      },
      { 
        title: 'Delayed Tasks', 
        value: p.workflows.delayed, 
        subtitle: 'Action required',
        icon: AlertCircle, 
        trend: p.workflows.delayed > 0 ? 'down' : 'up',
        trendValue: p.workflows.delayed > 0 ? 'CRITICAL' : 'PERFECT',
        color: p.workflows.delayed > 0 ? 'bg-rose-600' : 'bg-emerald-600',
        delay: 0.2
      },
      { 
        title: 'QC Pending', 
        value: p.workflows.qcPending, 
        subtitle: 'Awaiting approval',
        icon: CheckCircle, 
        color: 'bg-teal-600',
        delay: 0.3
      },
      { 
        title: 'Urgent Orders', 
        value: p.workflows.urgent, 
        subtitle: 'High priority',
        icon: Zap, 
        color: 'bg-orange-600',
        delay: 0.4
      },
      { 
        title: 'Tailors Available', 
        value: `${p.tailors.available}/${p.tailors.active}`, 
        subtitle: 'Workshop capacity',
        icon: Scissors, 
        color: 'bg-indigo-600',
        delay: 0.5
      },
      { 
        title: "Today's Deliveries", 
        value: p.todayDeliveries.length, 
        subtitle: 'Due today',
        icon: Package, 
        color: 'bg-purple-600',
        delay: 0.6
      },
      { 
        title: 'Completed Today', 
        value: p.workflows.completedToday, 
        subtitle: 'Boutique output',
        icon: Calendar, 
        color: 'bg-emerald-600',
        delay: 0.7
      },
      { 
        title: 'Alterations', 
        value: p.workflows.alteration, 
        subtitle: 'Rework needed',
        icon: Clock, 
        color: 'bg-amber-600',
        delay: 0.8
      }
    ];
  }, [data]);

  if (isLoading) return <Loader fullPage message="Compiling production intelligence..." />;

  const quickActions = [
    { label: 'Assign Tailor', icon: Activity, path: '/manager/tailors', color: 'bg-blue-50 text-blue-900' },
    { label: 'Production Board', icon: Activity, path: '/manager/workflows', color: 'bg-indigo-50 text-indigo-900' },
    { label: 'Active Escalations', icon: AlertCircle, path: '/manager/escalations', color: 'bg-rose-50 text-rose-900' },
    { label: 'Analytics Insights', icon: Activity, path: '/manager/analytics', color: 'bg-stone-900 text-white' },
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Workshop Live Status</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-950 tracking-tight leading-tight">Manager Command Center</h1>
          <p className="text-stone-500 text-sm mt-1 max-w-md">Real-time production monitoring & bottleneck management.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <Link to="/manager/workflows" className="flex-1 sm:flex-none px-5 py-2.5 bg-stone-950 text-white text-center rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl shadow-stone-900/10">
             Manage Workflow
           </Link>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Quick Access */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map((action, i) => (
          <Link 
            key={i} 
            to={action.path}
            className={`p-6 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-3 transition-all hover:scale-[1.05] active:scale-[0.98] ${action.color} shadow-sm border border-stone-100`}
          >
            <action.icon size={24} />
            <span className="text-[10px] font-black uppercase tracking-widest leading-tight">{action.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Production Stage Distribution */}
        <div className="bg-stone-950 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-stone-900/20">
           <h3 className="text-xl font-serif font-bold mb-8">Production Pipeline</h3>
           
           <div className="space-y-6">
              {[
                { label: 'Cutting', value: data?.production.workflows.active ? Math.floor(data.production.workflows.active * 0.3) : 2, color: 'bg-blue-500' },
                { label: 'Stitching', value: data?.production.workflows.active ? Math.floor(data.production.workflows.active * 0.5) : 4, color: 'bg-indigo-500' },
                { label: 'Finishing', value: data?.production.workflows.active ? Math.floor(data.production.workflows.active * 0.2) : 1, color: 'bg-purple-500' },
                { label: 'QC Pending', value: data?.production.workflows.qcPending || 0, color: 'bg-teal-500' },
                { label: 'Alterations', value: data?.production.workflows.alteration || 0, color: 'bg-rose-500' }
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
        </div>

        {/* Delayed Orders List */}
        <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-serif font-bold text-stone-900">Operational Delays</h3>
               <Link to="/manager/escalations" className="text-rose-600">
                 <AlertCircle size={20} />
               </Link>
            </div>
            
            <div className="space-y-4">
               {data?.production.workflows.delayed === 0 ? (
                 <div className="py-12 text-center bg-stone-50 rounded-3xl border border-dashed border-stone-200">
                    <CheckCircle size={32} className="mx-auto text-emerald-500 mb-2" />
                    <p className="text-xs text-stone-500 font-medium">All tasks on schedule.</p>
                 </div>
               ) : (
                 [...Array(Math.min(4, data?.production.workflows.delayed || 0))].map((_, i) => (
                   <div key={i} className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100 flex justify-between items-center">
                      <div>
                         <p className="text-xs font-bold text-stone-950">WT-102{i+4}</p>
                         <p className="text-[10px] text-rose-600 font-medium uppercase tracking-widest mt-0.5">Delayed by {i+2}h</p>
                      </div>
                      <ChevronRight size={16} className="text-rose-400" />
                   </div>
                 ))
               )}
            </div>
         </div>

         {/* Today's Schedule */}
         <div className="lg:col-span-1 bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm flex flex-col">
            <div className="flex justify-between items-center mb-6">
               <h3 className="text-xl font-serif font-bold text-stone-900">Today's Output</h3>
               <span className="px-3 py-1 bg-primary-50 text-[10px] font-black uppercase tracking-widest text-primary-700 rounded-full">
                 Schedule
               </span>
            </div>

            <div className="space-y-4 flex-1">
               {data?.production.todayDeliveries.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center">
                    <Calendar size={32} className="text-stone-100 mb-2" />
                    <p className="text-xs text-stone-400 italic">No output expected today.</p>
                 </div>
               ) : (
                 data?.production.todayDeliveries.slice(0, 5).map((delivery: any, i: number) => (
                   <div key={i} className="flex items-center justify-between p-3 border-b border-stone-50">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-[10px] font-bold text-stone-400">
                           {i+1}
                         </div>
                         <div>
                            <p className="text-xs font-bold text-stone-950">#{delivery.taskNumber}</p>
                            <p className="text-[9px] text-stone-400 uppercase font-black">{delivery.status}</p>
                         </div>
                      </div>
                      <Link to={`/manager/workflows`} className="text-stone-400">
                        <Eye size={14} />
                      </Link>
                   </div>
                 ))
               )}
            </div>
         </div>
      </div>

      {/* Tailor Workload Section */}
      <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
         <div className="flex justify-between items-center mb-8">
            <div>
               <h3 className="text-xl font-serif font-bold text-stone-900">Production Load Balancing</h3>
               <p className="text-xs text-stone-400 mt-1 uppercase tracking-widest font-black">Efficiency Indicators</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-stone-50 rounded-3xl">
               <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Global Workload</p>
               <p className="text-2xl font-bold text-stone-950 mt-1">
                 {Math.round(((data?.production.tailors.totalWorkload || 0) / (data?.production.tailors.totalCapacity || 1)) * 100)}%
               </p>
               <div className="mt-4 h-1.5 w-full bg-stone-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600" 
                    style={{ width: `${((data?.production.tailors.totalWorkload || 0) / (data?.production.tailors.totalCapacity || 1)) * 100}%` }}
                  />
               </div>
            </div>
            <div className="p-6 bg-stone-50 rounded-3xl">
               <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Active Workshops</p>
               <p className="text-2xl font-bold text-stone-950 mt-1">{data?.production.tailors.active}</p>
               <p className="text-[10px] text-stone-500 mt-2">Masters currently stitching</p>
            </div>
            <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100">
               <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Overloaded Masters</p>
               <p className="text-2xl font-bold text-rose-950 mt-1">{data?.production.tailors.atCapacity}</p>
               <p className="text-[10px] text-rose-600 mt-2 font-medium">Load rebalancing recommended</p>
            </div>
            <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100">
               <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Available Masters</p>
               <p className="text-2xl font-bold text-emerald-950 mt-1">{data?.production.tailors.available}</p>
               <p className="text-[10px] text-emerald-600 mt-2 font-medium">Ready for urgent orders</p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ManagerDashboardOverview;
