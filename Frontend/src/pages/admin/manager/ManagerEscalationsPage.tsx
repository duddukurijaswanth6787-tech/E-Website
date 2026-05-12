import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminWorkflowService } from '../../../api/services/adminWorkflow.service';
import type { WorkflowTask } from '../../../api/services/tailorWorkflow.service';
import { EscalationSeverity } from '../../../api/services/tailorWorkflow.service';
import { 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  Search,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import WorkflowDetailDrawer from '../../../components/manager/WorkflowDetailDrawer';

const ManagerEscalationsPage = () => {
  const [selectedTask, setSelectedTask] = useState<WorkflowTask | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: workflowsRes, isLoading, refetch } = useQuery({
    queryKey: ['managerEscalations'],
    queryFn: () => adminWorkflowService.getAllWorkflows({ limit: 500 }),
    refetchInterval: 30000,
  });

  const tasks = workflowsRes?.data?.tasks || [];

  const escalatedTasks = tasks.filter(t => 
    (t.escalationSeverity !== EscalationSeverity.NORMAL || t.isSlaViolated) &&
    (t.taskNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
     t.taskDescription.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => {
    const severityOrder = {
      [EscalationSeverity.BLOCKED]: 0,
      [EscalationSeverity.CUSTOMER_DELAYED]: 1,
      [EscalationSeverity.HIGH_RISK]: 2,
      [EscalationSeverity.WARNING]: 3,
      [EscalationSeverity.NORMAL]: 4,
    };
    const diff = severityOrder[a.escalationSeverity] - severityOrder[b.escalationSeverity];
    if (diff !== 0) return diff;
    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
  });

  const handleTaskClick = (task: WorkflowTask) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--admin-card-border)] border-t-red-500 rounded-full animate-spin"></div>
          <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">Scanning for Production Blockers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-1">
          <ShieldAlert className="w-6 h-6 text-red-600" />
          <h1 className="text-2xl font-black text-[var(--admin-text-primary)] tracking-tight uppercase">Critical Escalations</h1>
        </div>
        <p className="text-stone-500 text-sm font-medium">Production monitoring for SLA violations, blocks, and risk factors.</p>
      </div>

      <div className="bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-2xl p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search escalated tasks..." 
            className="w-full pl-10 pr-4 py-2 bg-[var(--admin-card)] border-[var(--admin-card-border)] rounded-xl text-sm focus:ring-2 focus:ring-red-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button onClick={() => refetch()} className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><RefreshCw className="w-4 h-4" /></button>
      </div>

      <div className="space-y-4">
        {escalatedTasks.length > 0 ? escalatedTasks.map((task) => (
          <div key={task._id} onClick={() => handleTaskClick(task)} className={`group bg-[var(--admin-card)] border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col md:flex-row items-center gap-6 ${task.escalationSeverity === EscalationSeverity.BLOCKED ? 'border-red-200 bg-red-50/10' : 'border-[var(--admin-card-border)]'} ${task.isSlaViolated ? 'border-l-4 border-l-red-600' : ''}`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${task.escalationSeverity === EscalationSeverity.BLOCKED ? 'bg-red-100 text-red-600 animate-pulse' : task.escalationSeverity === EscalationSeverity.CUSTOMER_DELAYED ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600'}`}><AlertTriangle className="w-6 h-6" /></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-tighter">#{task.taskNumber}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${task.escalationSeverity === EscalationSeverity.BLOCKED ? 'bg-red-600 text-[var(--admin-text-primary)]' : task.escalationSeverity === EscalationSeverity.CUSTOMER_DELAYED ? 'bg-purple-600 text-[var(--admin-text-primary)]' : 'bg-amber-500 text-[var(--admin-text-primary)]'}`}>{task.escalationSeverity}</span>
                {task.isSlaViolated && <span className="px-2 py-0.5 rounded bg-red-100 text-red-600 text-[9px] font-black uppercase">SLA VIOLATED</span>}
              </div>
              <h3 className="text-sm font-bold text-[var(--admin-text-primary)] truncate">{task.taskDescription}</h3>
              <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {format(new Date(task.deadline), 'MMM d, HH:mm')}</span>
                <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3" /> Status: {task.status}</span>
              </div>
            </div>
            <div className="shrink-0 text-right md:px-6 border-l border-[var(--admin-card-border)] hidden md:block">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Production Personnel</p>
              <span className="text-sm font-bold text-stone-800">{task.tailorId?.name || 'Unassigned'}</span>
            </div>
            <div className="shrink-0 flex items-center justify-center p-2 bg-[var(--admin-card)] rounded-full group-hover:bg-amber-500 group-hover:text-[var(--admin-text-primary)] transition-all"><ArrowRight className="w-5 h-5" /></div>
          </div>
        )) : (
          <div className="bg-[var(--admin-card)] border border-[var(--admin-card-border)] rounded-3xl p-20 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6"><ShieldAlert className="w-10 h-10 text-emerald-600" /></div>
            <h3 className="text-xl font-black text-[var(--admin-text-primary)] uppercase tracking-tight">System Clear</h3>
            <p className="text-stone-500 max-w-sm mt-2 text-sm font-medium">No critical escalations or SLA violations detected.</p>
          </div>
        )}
      </div>

      {selectedTask && (
        <WorkflowDetailDrawer 
          task={selectedTask}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />
      )}
    </div>
  );
};

export default ManagerEscalationsPage;


