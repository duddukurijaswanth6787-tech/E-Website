import React, { useMemo } from 'react';
import { 
  Users, Activity, Search, Filter, 
  Monitor, Play, Coffee, LogOut, 
  AlertCircle, 
  TrendingUp, CheckCircle2, AlertTriangle,
  Layers, Zap, Clock, Package
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useWorkforceStatus } from '../../../hooks/useWorkforceStatus';
import { DashboardSkeleton } from '../../../components/common/Skeleton';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '../../../lib/utils';

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, any> = {
    online: { color: 'bg-emerald-500', text: 'Online', icon: <Monitor size={10} /> },
    offline: { color: 'bg-stone-400', text: 'Offline', icon: <LogOut size={10} /> },
    working: { color: 'bg-blue-500', text: 'Working', icon: <Play size={10} />, animate: true },
    on_break: { color: 'bg-amber-500', text: 'On Break', icon: <Coffee size={10} /> },
    idle: { color: 'bg-stone-500', text: 'Idle', icon: <Activity size={10} /> },
  };
  const config = configs[status] || configs.offline;
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
      config.color.replace('bg-', 'text-'),
      config.color.replace('bg-', 'bg-opacity-10 bg-'),
      config.color.replace('bg-', 'border-opacity-20 border-')
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.color, config.animate && "animate-pulse")} />
      {config.text}
    </div>
  );
};

const OperationsCommandCenter = () => {
  const { overview, operations, isLoading } = useWorkforceStatus();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterRole] = React.useState('all');

  const filteredWorkforce = useMemo(() => {
    if (!overview?.workforce) return [];
    return overview.workforce.filter((m: any) => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (m.tailorCode || m.managerCode || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || m.type === filterRole;
      return matchesSearch && matchesRole;
    });
  }, [overview, searchTerm, filterRole]);

  if (isLoading) return <div className="p-8"><DashboardSkeleton /></div>;

  const stats = [
    { label: 'Active Staff', value: operations?.metrics?.activeWorkforceCount || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'In Production', value: operations?.metrics?.delayedCount + operations?.metrics?.completedTodayCount || 0, icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Completed Today', value: operations?.metrics?.completedTodayCount || 0, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Blocked/Delayed', value: operations?.metrics?.delayedCount || 0, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const pipelineStages = [
    { label: 'Fabric', status: 'Fabric Received' },
    { label: 'Cutting', status: 'Cutting' },
    { label: 'Stitching', status: 'Stitching' },
    { label: 'Embroidery', status: 'Embroidery' },
    { label: 'QC', status: 'QC' },
    { label: 'Ready', status: 'Completed' },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-stone-500 uppercase tracking-[0.3em]">Boutique Intelligence Unit</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight leading-tight">Operations Command Center</h1>
          <p className="text-stone-500 text-sm mt-1">Live visibility into production, workforce, and bottlenecks.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <div className="relative flex-1 sm:w-64">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
             <input 
               type="text"
               placeholder="Search workforce..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm outline-none shadow-sm transition-all focus:ring-2 focus:ring-blue-500"
             />
           </div>
           <button className="p-3 bg-white border border-stone-200 rounded-2xl text-stone-600 hover:bg-stone-50 shadow-sm transition-all">
             <Filter size={20} />
           </button>
        </div>
      </div>

      {/* Main Grid: Pipeline and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pipeline Distribution */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm group">
           <div className="flex justify-between items-center mb-8">
             <h2 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
               <Layers className="text-blue-600" size={20} />
               Production Pipeline
             </h2>
             <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Real-time Stages</span>
           </div>
           
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              {pipelineStages.map((stage, i) => (
                <div key={i} className="flex flex-col items-center group/stage">
                   <div className="relative mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 group-hover/stage:bg-blue-600 group-hover/stage:text-white transition-all duration-300 shadow-inner">
                         <Activity size={20} />
                      </div>
                      {operations?.pipeline?.[stage.status] > 0 && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                          {operations.pipeline[stage.status]}
                        </div>
                      )}
                   </div>
                   <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest text-center">{stage.label}</p>
                </div>
              ))}
           </div>

           {/* Efficiency Visualization */}
           <div className="mt-10 pt-8 border-t border-stone-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                   <TrendingUp size={20} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Global Efficiency</p>
                   <p className="text-xl font-bold text-stone-900">{operations?.metrics?.efficiencyScore}%</p>
                </div>
              </div>
              <div className="flex -space-x-3">
                {overview?.workforce?.slice(0, 5).map((m: any, i: number) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-stone-200 border-4 border-white overflow-hidden shadow-lg">
                    {m.profileImage ? <img src={m.profileImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-xs">{m.name[0]}</div>}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-blue-600 border-4 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                  +{overview?.workforce?.length - 5}
                </div>
              </div>
           </div>
        </div>

        {/* Live Alerts Panel */}
        <div className="bg-stone-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl" />
           <div className="relative z-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-serif font-bold text-white">Live Intelligence</h2>
                <span className="px-2 py-1 bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest rounded-lg border border-rose-500/20">Critical</span>
              </div>

              <div className="space-y-6">
                 {operations?.alerts?.length > 0 ? operations.alerts.map((alert: any, i: number) => (
                   <div key={i} className="flex gap-4 group cursor-pointer">
                      <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500 h-fit group-hover:scale-110 transition-transform">
                         <AlertCircle size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-stone-100 mb-1 leading-relaxed">{alert.message}</p>
                        <p className="text-[9px] font-black text-stone-500 uppercase tracking-widest flex items-center gap-1">
                          <Clock size={10} /> {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                   </div>
                 )) : (
                   <div className="text-center py-10">
                      <CheckCircle2 className="mx-auto text-emerald-500 mb-4" size={32} />
                      <p className="text-stone-400 text-sm font-medium">Operations stable. No critical bottlenecks detected.</p>
                   </div>
                 )}
              </div>

              <button className="w-full mt-8 py-3 bg-white/5 hover:bg-white/10 text-stone-400 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">
                View All Escalations
              </button>
           </div>
        </div>
      </div>

      {/* Workforce Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex items-center justify-between group hover:shadow-xl transition-all"
          >
            <div>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-stone-900">{stat.value}</h3>
            </div>
            <div className={cn("p-4 rounded-2xl transition-all group-hover:scale-110", stat.bg, stat.color)}>
              <stat.icon size={24} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Workforce Live Feed Table */}
      <div className="bg-white border border-stone-100 rounded-[2.5rem] overflow-hidden shadow-sm">
         <div className="p-8 border-b border-stone-50 flex justify-between items-center">
            <h2 className="text-xl font-serif font-bold text-stone-900">Personnel Status</h2>
            <div className="flex gap-2">
               <button className="px-4 py-2 bg-stone-50 text-stone-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-stone-100">Export Report</button>
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50/50">
                  <th className="px-8 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Employee</th>
                  <th className="px-8 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Attendance</th>
                  <th className="px-8 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Current Task</th>
                  <th className="px-8 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Last Active</th>
                  <th className="px-8 py-4 text-[10px] font-black text-stone-400 uppercase tracking-widest">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {filteredWorkforce.map((member: any) => (
                  <tr key={member._id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center font-bold text-stone-400 overflow-hidden shadow-inner">
                          {member.profileImage ? <img src={member.profileImage} className="w-full h-full object-cover" /> : member.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-stone-900">{member.name}</p>
                          <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest">{member.type} • {member.tailorCode || member.managerCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <StatusBadge status={member.liveStatus} />
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                         <div className={cn("w-1.5 h-1.5 rounded-full", member.isPresent ? "bg-emerald-500" : "bg-stone-300")} />
                         <span className="text-xs font-bold text-stone-600">{member.isPresent ? 'Present' : 'Absent'}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       {member.liveStatus === 'working' ? (
                         <div className="flex items-center gap-2 text-blue-600">
                           <Package size={14} />
                           <span className="text-xs font-bold">Stitching WT-204</span>
                         </div>
                       ) : (
                         <span className="text-xs text-stone-400">No active task</span>
                       )}
                    </td>
                    <td className="px-8 py-5 text-xs text-stone-500 font-medium">
                      {member.lastActive ? formatDistanceToNow(new Date(member.lastActive), { addSuffix: true }) : 'N/A'}
                    </td>
                    <td className="px-8 py-5">
                       <button className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                         <TrendingUp size={18} />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
};

export default OperationsCommandCenter;
