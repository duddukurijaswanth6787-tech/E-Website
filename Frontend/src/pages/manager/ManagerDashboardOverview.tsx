import { useQuery } from '@tanstack/react-query';
import { managerDashboardService } from '../../api/services/managerDashboard.service';
import { 
  Activity, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Scissors, 
  RefreshCcw 
} from 'lucide-react';
import { WorkflowStatus } from '../../api/services/tailorWorkflow.service';

const ManagerDashboardOverview = () => {
  const { data: analyticsRes, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['managerDashboardAnalytics'],
    queryFn: managerDashboardService.getDashboardAnalytics,
    refetchInterval: 60000, // Poll every minute for live ops
  });

  const { data: escalationsRes, isLoading: loadingEscalations } = useQuery({
    queryKey: ['managerDashboardEscalations'],
    queryFn: managerDashboardService.getEscalations,
    refetchInterval: 30000, // Every 30s
  });

  if (loadingAnalytics) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 w-64 bg-stone-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-stone-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const analytics = analyticsRes?.data;
  const escalations = escalationsRes?.data || [];
  
  // Calculate total active tasks (excluding completed/delivered)
  const activeTaskCount = Object.entries(analytics?.statusCounts || {}).reduce((acc, [status, count]) => {
    if (status !== WorkflowStatus.COMPLETED && status !== WorkflowStatus.DELIVERED) {
      return acc + (count as number);
    }
    return acc;
  }, 0);

  const qcPendingCount = (analytics?.statusCounts[WorkflowStatus.QC] || 0);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Production Floor Status</h1>
        <p className="text-stone-500 mt-1">Real-time overview of current operations and bottlenecks.</p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* Active Workflows */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-16 h-16 text-stone-900" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-2">Active Workflows</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold text-stone-900">{activeTaskCount}</h3>
              <span className="text-sm font-medium text-emerald-600">On Floor</span>
            </div>
          </div>
        </div>

        {/* SLA Violations / Delayed */}
        <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm shadow-red-500/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-16 h-16 text-red-600" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-2">SLA Violations</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold text-red-600">{analytics?.delayedTasksCount || 0}</h3>
              <span className="text-sm font-medium text-red-500">Overdue</span>
            </div>
          </div>
          {analytics?.delayedTasksCount && analytics.delayedTasksCount > 0 ? (
            <div className="absolute bottom-0 left-0 w-full h-1 bg-red-500 animate-pulse" />
          ) : null}
        </div>

        {/* Pending QC */}
        <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 className="w-16 h-16 text-amber-500" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-wider mb-2">Pending QC</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold text-stone-900">{qcPendingCount}</h3>
              <span className="text-sm font-medium text-amber-600">Awaiting Check</span>
            </div>
          </div>
        </div>

        {/* Rework Loop */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <RefreshCcw className="w-16 h-16 text-stone-900" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-2">Rework Loop</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-4xl font-bold text-stone-900">{analytics?.reworkCount || 0}</h3>
              <span className="text-sm font-medium text-stone-500">In Correction</span>
            </div>
          </div>
        </div>

      </div>

      {/* Secondary Data Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
            <Scissors className="w-5 h-5 text-stone-400" />
            Stage Distribution
          </h3>
          <div className="space-y-4">
            {Object.entries(analytics?.statusCounts || {})
              .filter(([status]) => status !== WorkflowStatus.COMPLETED && status !== WorkflowStatus.DELIVERED)
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .map(([status, count]) => (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-stone-700">{status}</span>
                    <span className="font-bold text-stone-900">{count}</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2">
                    <div 
                      className="bg-stone-800 h-2 rounded-full" 
                      style={{ width: `${Math.min(((count as number) / Math.max(activeTaskCount, 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Active Escalations */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm flex flex-col">
          <div className="p-6 border-b border-stone-100">
             <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
               <AlertTriangle className="w-5 h-5 text-amber-500" />
               Active Escalations
             </h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] p-2">
            {loadingEscalations ? (
               <div className="flex flex-col items-center justify-center py-12 text-center text-stone-500 animate-pulse">
                  <Activity className="w-12 h-12 text-stone-300 mb-3" />
                  <p>Monitoring floor status...</p>
               </div>
            ) : escalations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-stone-500">
                <AlertTriangle className="w-12 h-12 text-stone-300 mb-3" />
                <p>No active escalations detected.</p>
                <p className="text-sm mt-1">Production floor is running smoothly.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {escalations.map((esc: any) => (
                  <div key={esc._id} className="p-4 bg-stone-50 rounded-lg border border-stone-100 hover:border-amber-200 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[0.65rem] font-bold uppercase tracking-widest text-stone-400">{esc.taskNumber}</span>
                      <span className={`text-[0.6rem] font-black uppercase tracking-tighter px-2 py-0.5 rounded ${
                        esc.escalationSeverity === 'Critical' ? 'bg-red-100 text-red-700' : 
                        esc.escalationSeverity === 'High Risk' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {esc.escalationSeverity}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-stone-900 truncate">{esc.taskDescription}</h4>
                    <div className="mt-3 flex items-center justify-between text-[0.7rem] text-stone-500">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-stone-200 flex items-center justify-center font-bold text-stone-600">
                           {esc.tailorId?.name.charAt(0)}
                        </div>
                        <span className="font-semibold">{esc.tailorId?.name}</span>
                      </div>
                      <span className="text-stone-400 font-medium">Due: {new Date(esc.deadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardOverview;
