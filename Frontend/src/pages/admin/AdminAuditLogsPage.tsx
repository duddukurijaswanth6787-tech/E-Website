import { useState } from 'react';
import { 
  Shield, Activity, Search,
  Terminal, AlertTriangle, ShieldAlert,
  Globe, Monitor, 
  Download, RefreshCcw, ChevronRight, 
  ChevronDown, Database
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import { useAuditStream } from '../../hooks/useAuditStream';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '../../lib/utils';
import { publicApi } from '../../lib/api';
import { useEffect } from 'react';

const SeverityBadge = ({ severity }: { severity: string }) => {
  const configs: Record<string, any> = {
    critical: { color: 'text-rose-500 bg-rose-500/10 border-rose-500/20', icon: <ShieldAlert size={10} /> },
    high: { color: 'text-orange-500 bg-orange-500/10 border-orange-500/20', icon: <AlertTriangle size={10} /> },
    medium: { color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', icon: <Activity size={10} /> },
    low: { color: 'text-blue-500 bg-blue-500/10 border-blue-500/20', icon: <Monitor size={10} /> },
    info: { color: 'text-stone-400 bg-stone-400/10 border-stone-400/20', icon: <Terminal size={10} /> },
  };
  const config = configs[severity] || configs.info;
  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest border",
      config.color
    )}>
      {config.icon}
      {severity}
    </div>
  );
};

const AuditLogRow = ({ log }: { log: any }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn(
      "border-b border-stone-50 transition-all",
      isExpanded ? "bg-stone-50/50" : "hover:bg-stone-50/30"
    )}>
      <div 
        className="flex items-center px-6 py-4 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-6 flex items-center justify-center text-stone-300 group-hover:text-blue-500 transition-colors">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        
        <div className="flex-1 grid grid-cols-12 gap-4 items-center">
          <div className="col-span-2 text-[10px] font-mono text-stone-400">
            {format(new Date(log.timestamp), 'HH:mm:ss.SSS')}
          </div>
          
          <div className="col-span-2">
            <SeverityBadge severity={log.severity} />
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-500 uppercase">
              {log.actorName[0]}
            </div>
            <div className="truncate">
              <p className="text-[10px] font-bold text-stone-900 truncate">{log.actorName}</p>
              <p className="text-[9px] font-black text-blue-500/70 uppercase tracking-tighter truncate">{log.actorRole}</p>
            </div>
          </div>

          <div className="col-span-2">
            <span className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded text-[9px] font-black uppercase tracking-widest border border-stone-200">
              {log.module}
            </span>
          </div>

          <div className="col-span-4">
            <p className="text-[11px] font-medium text-stone-600 truncate group-hover:text-stone-900 transition-colors">
              {log.description}
            </p>
          </div>
        </div>

        <div className="w-24 text-right">
           <span className={cn(
             "text-[9px] font-black uppercase px-2 py-0.5 rounded",
             log.status === 'success' ? "text-emerald-500" : "text-rose-500"
           )}>
             {log.status}
           </span>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-12 pb-6 pt-2">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">Payload Context</h4>
                    <div className="bg-stone-950 rounded-xl p-4 overflow-x-auto">
                       <pre className="text-[10px] font-mono text-emerald-500 leading-relaxed">
                         {JSON.stringify({
                           action: log.action,
                           entity: { type: log.entityType, id: log.entityId },
                           previous: log.previousValue,
                           current: log.newValue,
                           metadata: log.metadata
                         }, null, 2)}
                       </pre>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">Network Intelligence</h4>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">IP Address</p>
                            <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                               <Globe size={12} className="text-blue-500" /> {log.ipAddress || '127.0.0.1'}
                            </div>
                         </div>
                         <div className="p-3 bg-stone-50 rounded-xl border border-stone-100">
                            <p className="text-[9px] font-black text-stone-400 uppercase tracking-widest mb-1">Security Risk</p>
                            <div className="flex items-center gap-2 text-xs font-bold text-stone-900">
                               <Shield size={12} className={cn(log.riskScore > 50 ? "text-rose-500" : "text-emerald-500")} /> {log.riskScore}/100
                            </div>
                         </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-4">Session Analytics</h4>
                      <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-3">
                         <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">User Agent</span>
                            <span className="text-[10px] font-medium text-stone-600 truncate max-w-[200px]">{log.userAgent}</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Browser</span>
                            <span className="text-[10px] font-bold text-stone-900">Chrome/124.0.0</span>
                         </div>
                         <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-stone-400 uppercase tracking-widest">Platform</span>
                            <span className="text-[10px] font-bold text-stone-900">macOS Sonoma</span>
                         </div>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                       <button className="flex-1 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-colors">
                         Inspect Entity
                       </button>
                       <button className="flex-1 py-2 bg-stone-100 text-stone-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-stone-200 transition-colors">
                         Trace Actor
                       </button>
                    </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LiveCustomerStream = () => {
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchActivities = async () => {
      try {
        const res = await publicApi.get('/marketing/retention/public-activities');
        if (!isMounted) return;
        const list = res.data?.data || res.data || [];
        if (Array.isArray(list)) setActivities(list);
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (isLoading) return <div className="p-12 flex justify-center"><Activity className="animate-spin text-stone-300" /></div>;

  return (
    <div className="overflow-y-auto custom-scrollbar flex-1">
      {activities.length > 0 ? (
        <div className="min-w-[1000px]">
          <div className="grid grid-cols-12 gap-4 px-12 py-3 bg-stone-50/50 border-b border-stone-100 sticky top-0 z-10">
             <div className="col-span-2 text-[9px] font-black text-stone-400 uppercase tracking-widest">Time</div>
             <div className="col-span-2 text-[9px] font-black text-stone-400 uppercase tracking-widest">Type</div>
             <div className="col-span-3 text-[9px] font-black text-stone-400 uppercase tracking-widest">Customer</div>
             <div className="col-span-3 text-[9px] font-black text-stone-400 uppercase tracking-widest">Item/Action</div>
             <div className="col-span-2 text-[9px] font-black text-stone-400 uppercase tracking-widest">Location</div>
          </div>
          {activities.map((act: any, idx) => (
             <div key={idx} className="grid grid-cols-12 gap-4 px-12 py-4 border-b border-stone-50 hover:bg-stone-50/30 items-center">
               <div className="col-span-2 text-[10px] font-mono text-stone-400">
                 {formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}
               </div>
               <div className="col-span-2">
                 <span className={cn(
                   "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border",
                   act.activityType === 'order' ? "text-emerald-600 bg-emerald-50 border-emerald-100" :
                   act.activityType === 'view' ? "text-blue-600 bg-blue-50 border-blue-100" :
                   "text-pink-600 bg-pink-50 border-pink-100"
                 )}>
                   {act.activityType}
                 </span>
               </div>
               <div className="col-span-3">
                 <p className="text-[10px] font-bold text-stone-900">{act.customerDisplayName || 'Anonymous'}</p>
                 <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter">Visitor</p>
               </div>
               <div className="col-span-3">
                 <p className="text-[10px] font-bold text-stone-900 truncate">{act.title || 'Unknown Item'}</p>
               </div>
               <div className="col-span-2 flex items-center gap-1 text-[10px] text-stone-500 font-bold uppercase tracking-widest">
                 <Globe size={10} className="text-blue-500" /> {act.location || 'Unknown'}
               </div>
             </div>
          ))}
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center p-12">
           <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-200 mb-6">
              <Activity size={40} />
           </div>
           <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">No Live Activities</h3>
           <p className="text-stone-400 text-sm max-w-md">There are no active customer sessions right now.</p>
        </div>
      )}
    </div>
  );
};

const AdminAuditLogsPage = () => {
  const { logs, stats, isLoading } = useAuditStream();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'audit' | 'live'>('audit');

  if (isLoading) return <div className="p-8"><DashboardSkeleton /></div>;

  return (
    <div className="space-y-8 pb-20">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 bg-blue-500 rounded text-white">
              <Shield size={12} />
            </div>
            <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">SIEM & Audit Infrastructure</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight leading-tight">Global Audit Stream</h1>
          <p className="text-stone-500 text-sm mt-1">Real-time immutable ledger of all ERP operations and security events.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
           <div className="relative flex-1 sm:w-80">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
             <input 
               type="text"
               placeholder="Search by actor, action, or entity ID..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-11 pr-4 py-3 bg-white border border-stone-200 rounded-2xl text-sm outline-none shadow-sm transition-all focus:ring-2 focus:ring-blue-500"
             />
           </div>
           <button className="p-3 bg-white border border-stone-200 rounded-2xl text-stone-600 hover:bg-stone-50 shadow-sm transition-all">
             <Download size={20} />
           </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
         <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                  <Activity size={20} />
               </div>
               <span className="text-[10px] font-black text-emerald-500 uppercase">+12% Today</span>
            </div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Total Operations</p>
            <h3 className="text-2xl font-bold text-stone-900">{logs.length}+</h3>
         </div>

         <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                  <AlertTriangle size={20} />
               </div>
               <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Active Risks</span>
            </div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Medium Severity</p>
            <h3 className="text-2xl font-bold text-stone-900">
               {stats?.severityCounts?.find(s => s._id === 'medium')?.count || 0}
            </h3>
         </div>

         <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                  <ShieldAlert size={20} />
               </div>
               <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            </div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Security Alerts</p>
            <h3 className="text-2xl font-bold text-stone-900">
               {stats?.severityCounts?.find(s => s._id === 'critical')?.count || 0}
            </h3>
         </div>

         <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <div className="p-3 bg-stone-50 text-stone-600 rounded-2xl">
                  <Database size={20} />
               </div>
               <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">DB Cluster</span>
            </div>
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">System Status</p>
            <h3 className="text-2xl font-bold text-emerald-500 uppercase">Operational</h3>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-stone-200">
        <button 
          onClick={() => setActiveTab('audit')}
          className={cn(
            "pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all border-b-2",
            activeTab === 'audit' ? "border-blue-600 text-blue-600" : "border-transparent text-stone-400 hover:text-stone-600"
          )}
        >
          System Audit Stream
        </button>
        <button 
          onClick={() => setActiveTab('live')}
          className={cn(
            "pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2",
            activeTab === 'live' ? "border-emerald-500 text-emerald-600" : "border-transparent text-stone-400 hover:text-stone-600"
          )}
        >
          <div className={cn("w-1.5 h-1.5 rounded-full", activeTab === 'live' ? "bg-emerald-500 animate-pulse" : "bg-stone-300")} />
          Live Customer Stream
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
         <div className="p-6 border-b border-stone-50 flex items-center justify-between bg-stone-50/30">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                  <div className={cn("w-2 h-2 rounded-full animate-pulse", activeTab === 'live' ? "bg-emerald-500" : "bg-blue-500")} />
                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest">
                    {activeTab === 'live' ? 'Live Store Activity' : 'System Activity Feed'}
                  </span>
               </div>
               {activeTab === 'audit' && (
                 <>
                   <div className="h-4 w-[1px] bg-stone-200" />
                   <div className="flex gap-1">
                      {['AUTH', 'WORKFORCE', 'ORDER', 'INVENTORY'].map(m => (
                        <button key={m} className="px-2 py-1 text-[8px] font-black text-stone-400 hover:text-blue-500 uppercase tracking-widest transition-colors">
                          {m}
                        </button>
                      ))}
                   </div>
                 </>
               )}
            </div>
            <button className="p-2 text-stone-400 hover:text-stone-900 transition-colors">
               <RefreshCcw size={16} />
            </button>
         </div>

         {activeTab === 'live' ? (
           <LiveCustomerStream />
         ) : (
           <div className="overflow-y-auto custom-scrollbar flex-1">
              {logs.length > 0 ? (
                <div className="min-w-[1000px]">
                  <div className="grid grid-cols-12 gap-4 px-12 py-3 bg-stone-50/50 border-b border-stone-100 sticky top-0 z-10">
                     <div className="col-span-2 text-[9px] font-black text-stone-400 uppercase tracking-widest">Timestamp</div>
                     <div className="col-span-2 text-[9px] font-black text-stone-400 uppercase tracking-widest">Severity</div>
                     <div className="col-span-2 text-[9px] font-black text-stone-400 uppercase tracking-widest">Actor</div>
                     <div className="col-span-2 text-[9px] font-black text-stone-400 uppercase tracking-widest">Module</div>
                     <div className="col-span-4 text-[9px] font-black text-stone-400 uppercase tracking-widest">Operation Description</div>
                  </div>
                  {logs.map((log) => (
                    <AuditLogRow key={log._id} log={log} />
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12">
                   <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center text-stone-200 mb-6">
                      <Database size={40} />
                   </div>
                   <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">No Mutation Traces Identified</h3>
                   <p className="text-stone-400 text-sm max-w-md">The Security Log parser has not identified any operational signatures in the current cluster cycle.</p>
                </div>
              )}
           </div>
         )}

         <div className="p-4 border-t border-stone-50 bg-stone-50/30 flex justify-between items-center px-8">
            <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">
              Showing {activeTab === 'live' ? 'active' : logs.length} {activeTab === 'live' ? 'sessions' : 'operations'} • Real-time Sync Active
            </p>
            <div className="flex gap-2">
               <button className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-600 shadow-sm">Previous</button>
               <button className="px-4 py-2 bg-white border border-stone-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-stone-600 shadow-sm">Next Page</button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default AdminAuditLogsPage;
