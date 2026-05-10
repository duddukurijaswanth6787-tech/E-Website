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
  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['managerDashboardAnalytics'],
    queryFn: managerDashboardService.getDashboardAnalytics,
    refetchInterval: 60000, // Poll every minute for live ops
  });

  if (isLoading) {
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

        {/* Placeholder for Alerts/Escalations which will come from another API later */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6">
          <h3 className="text-lg font-bold text-stone-900 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            Active Escalations
          </h3>
          <div className="flex flex-col items-center justify-center py-12 text-center text-stone-500">
            <AlertTriangle className="w-12 h-12 text-stone-300 mb-3" />
            <p>No active escalations detected.</p>
            <p className="text-sm mt-1">Production floor is running smoothly.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboardOverview;
