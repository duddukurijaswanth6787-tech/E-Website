import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core';
import { adminWorkflowService } from '../../../api/services/adminWorkflow.service';
import type { WorkflowTask } from '../../../api/services/tailorWorkflow.service';
import { WorkflowStatus } from '../../../api/services/tailorWorkflow.service';
import KanbanColumn from '../../../components/manager/KanbanColumn';
import WorkflowCard from '../../../components/manager/WorkflowCard';
import WorkflowDetailDrawer from '../../../components/manager/WorkflowDetailDrawer';
import { Search, Filter, RefreshCw, AlertCircle, TrendingUp, Users, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWorkflowRealtime } from '../../../realtime/hooks/useWorkflowRealtime';
import { useSocketStore } from '../../../realtime/socketStore';
import { Loader } from '../../../components/common/Loader';
import { WORKFLOW_STAGES } from '../../../utils/workflowPalette';

const COLUMNS = Object.values(WORKFLOW_STAGES);

const VALID_TRANSITIONS: Record<string, string[]> = {
  [WorkflowStatus.ASSIGNED]: [WorkflowStatus.FABRIC_RECEIVED, WorkflowStatus.CUTTING],
  [WorkflowStatus.FABRIC_RECEIVED]: [WorkflowStatus.CUTTING],
  [WorkflowStatus.CUTTING]: [WorkflowStatus.STITCHING],
  [WorkflowStatus.STITCHING]: [WorkflowStatus.EMBROIDERY, WorkflowStatus.TRIAL_READY, WorkflowStatus.QC],
  [WorkflowStatus.EMBROIDERY]: [WorkflowStatus.TRIAL_READY, WorkflowStatus.QC],
  [WorkflowStatus.TRIAL_READY]: [WorkflowStatus.ALTERATION, WorkflowStatus.QC],
  [WorkflowStatus.ALTERATION]: [WorkflowStatus.TRIAL_READY, WorkflowStatus.QC],
  [WorkflowStatus.QC]: [WorkflowStatus.REWORK, WorkflowStatus.COMPLETED],
  [WorkflowStatus.REWORK]: [WorkflowStatus.STITCHING, WorkflowStatus.EMBROIDERY, WorkflowStatus.QC],
  [WorkflowStatus.COMPLETED]: [WorkflowStatus.DELIVERED],
  [WorkflowStatus.DELIVERED]: [],
};

const ManagerWorkflowsBoard = () => {
  const queryClient = useQueryClient();
  const [activeTask, setActiveTask] = useState<WorkflowTask | null>(null);
  const [selectedTask, setSelectedTask] = useState<WorkflowTask | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const { data: workflowsRes, isLoading, refetch } = useQuery({
    queryKey: ['managerWorkflows'],
    queryFn: () => adminWorkflowService.getAllWorkflows({ limit: 1000 }),
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  useWorkflowRealtime();

  const managerSocketState = useSocketStore((s) => s.managerState);
  const isLive = managerSocketState === 'connected';

  const mutation = useMutation({
    mutationFn: ({ id, status, expectedRevision }: { id: string; status: WorkflowStatus; expectedRevision?: number }) =>
      adminWorkflowService.updateWorkflowStatus(id, { status, expectedRevision }),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['managerWorkflows'] });
      const previousWorkflows = queryClient.getQueryData(['managerWorkflows']);

      queryClient.setQueryData(['managerWorkflows'], (old: any) => {
        if (!old?.data?.tasks) return old;
        return {
          ...old,
          data: {
            ...old.data,
            tasks: old.data.tasks.map((t: WorkflowTask) =>
              t._id === id ? { ...t, status } : t
            )
          }
        };
      });

      return { previousWorkflows };
    },
    onSuccess: () => {
      toast.success('Workflow stage updated');
    },
    onError: (err: any, _variables, context) => {
      if (context?.previousWorkflows) {
        queryClient.setQueryData(['managerWorkflows'], context.previousWorkflows);
      }
      const status = err?.response?.status || err?.statusCode;
      const isConflict = status === 409 || /revision conflict/i.test(err?.message ?? '');
      if (isConflict) {
        toast.error('Another user updated this card — refreshing.', { duration: 3500 });
        queryClient.invalidateQueries({ queryKey: ['managerWorkflows'] });
      } else {
        toast.error(err.message || 'Transition rejected by engine');
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['managerWorkflows'] });
    }
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const tasks = workflowsRes?.data?.tasks || [];

  const stats = useMemo(() => {
    const total = tasks.length;
    const delayed = tasks.filter(t => t.isSlaViolated).length;
    const urgent = tasks.filter(t => t.priority === 'Urgent').length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    return { total, delayed, urgent, completed };
  }, [tasks]);

  const groupedTasks = useMemo(() => {
    return COLUMNS.reduce((acc, col) => {
      acc[col.id] = tasks.filter(t => {
        const matchesSearch = t.taskNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             t.taskDescription.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
        return t.status === col.id && matchesSearch && matchesPriority;
      });
      return acc;
    }, {} as Record<string, WorkflowTask[]>);
  }, [tasks, searchQuery, priorityFilter]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(event.active.data.current as WorkflowTask);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as WorkflowStatus;
    const task = active.data.current as WorkflowTask;

    if (task.status === newStatus) return;

    const allowed = VALID_TRANSITIONS[task.status] || [];
    if (!allowed.includes(newStatus)) {
      toast.error(`Invalid transition: ${task.status} → ${newStatus}`, {
        icon: <AlertCircle className="text-red-500" />,
        duration: 3000,
      });
      return;
    }

    mutation.mutate({ id: taskId, status: newStatus, expectedRevision: task.revision });
  };

  const handleCardClick = (task: WorkflowTask) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  if (isLoading) return <Loader fullPage message="Syncing Production Board..." />;

  return (
    <div className="h-full flex flex-col bg-[var(--admin-card)]">
      {/* Production Stats Bar */}
      <div className="bg-[var(--admin-card)] text-[var(--admin-text-primary)] px-8 py-4 flex items-center gap-12 overflow-x-auto no-scrollbar">
         <div className="flex items-center gap-3 border-r border-[var(--admin-card-border)] pr-12">
            <TrendingUp size={20} className="text-emerald-400" />
            <div>
              <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Efficiency</p>
              <p className="text-sm font-bold">94% <span className="text-[10px] text-emerald-400">+2%</span></p>
            </div>
         </div>
         <div className="flex items-center gap-3 border-r border-[var(--admin-card-border)] pr-12">
            <Users size={20} className="text-primary-400" />
            <div>
              <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Workload</p>
              <p className="text-sm font-bold">{stats.total} Active Tasks</p>
            </div>
         </div>
         <div className="flex items-center gap-3 border-r border-[var(--admin-card-border)] pr-12">
            <Clock size={20} className="text-red-400" />
            <div>
              <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Delayed</p>
              <p className="text-sm font-bold text-red-400">{stats.delayed} Critical</p>
            </div>
         </div>
         <div className="flex items-center gap-3 pr-12">
            <CheckCircle2 size={20} className="text-amber-400" />
            <div>
              <p className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Ready</p>
              <p className="text-sm font-bold">{stats.completed} Pending Pickup</p>
            </div>
         </div>
      </div>

      <div className="bg-[var(--admin-card)] border-b border-[var(--admin-card-border)] px-8 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-6 flex-1">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search Production IDs..." 
              className="w-full pl-10 pr-4 py-2 bg-stone-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-stone-400" />
            <select 
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-xs font-bold text-stone-600 bg-transparent outline-none cursor-pointer"
            >
               <option value="all">All Priorities</option>
               <option value="Urgent">Urgent Only</option>
               <option value="High">High Priority</option>
               <option value="Normal">Normal</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400 mr-4">
            <span
              className={`w-2 h-2 rounded-full ${
                isLive
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : managerSocketState === 'reconnecting'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-stone-300'
              }`}
            />
            {isLive ? 'Operational Sync' : 'Reconnecting...'}
          </div>
          <button 
            onClick={() => refetch()}
            className="p-2 text-stone-500 hover:bg-stone-100 rounded-xl transition-all active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${mutation.isPending ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto p-8 custom-scrollbar">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-8 h-full min-h-[calc(100vh-16rem)]">
            {COLUMNS.map((col) => (
              <KanbanColumn 
                key={col.id} 
                id={col.id as WorkflowStatus} 
                title={col.label} 
                count={groupedTasks[col.id]?.length || 0}
              >
                {groupedTasks[col.id]?.map((task) => (
                  <WorkflowCard key={task._id} task={task} onClick={handleCardClick} />
                ))}
              </KanbanColumn>
            ))}
          </div>

          <DragOverlay>
            {activeTask ? (
              <div className="w-80 opacity-90 pointer-events-none scale-105 rotate-3 shadow-2xl">
                <WorkflowCard task={activeTask} onClick={() => {}} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {selectedTask && (
          <WorkflowDetailDrawer 
            task={selectedTask}
            isOpen={isDrawerOpen}
            onClose={() => setIsDrawerOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default ManagerWorkflowsBoard;


