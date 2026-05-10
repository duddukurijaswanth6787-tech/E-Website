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
import { adminWorkflowService } from '../../api/services/adminWorkflow.service';
import type { WorkflowTask } from '../../api/services/tailorWorkflow.service';
import { WorkflowStatus } from '../../api/services/tailorWorkflow.service';
import KanbanColumn from '../../components/manager/KanbanColumn';
import WorkflowCard from '../../components/manager/WorkflowCard';
import WorkflowDetailDrawer from '../../components/manager/WorkflowDetailDrawer';
import { Search, Filter, RefreshCw, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useWorkflowRealtime } from '../../realtime/hooks/useWorkflowRealtime';
import { useSocketStore } from '../../realtime/socketStore';

const COLUMNS: { id: WorkflowStatus; title: string }[] = [
  { id: WorkflowStatus.ASSIGNED, title: 'Assigned' },
  { id: WorkflowStatus.FABRIC_RECEIVED, title: 'Fabric Received' },
  { id: WorkflowStatus.CUTTING, title: 'Cutting' },
  { id: WorkflowStatus.STITCHING, title: 'Stitching' },
  { id: WorkflowStatus.EMBROIDERY, title: 'Embroidery' },
  { id: WorkflowStatus.TRIAL_READY, title: 'Trial Ready' },
  { id: WorkflowStatus.ALTERATION, title: 'Alteration' },
  { id: WorkflowStatus.QC, title: 'QC' },
  { id: WorkflowStatus.REWORK, title: 'Rework' },
  { id: WorkflowStatus.COMPLETED, title: 'Completed' },
];

const VALID_TRANSITIONS: Record<WorkflowStatus, WorkflowStatus[]> = {
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

  // Fetch all tasks for the board.
  // Realtime push (via Socket.IO) keeps the cache fresh; we keep a slow
  // safety-net poll (5 min) for catastrophic disconnect scenarios.
  const { data: workflowsRes, isLoading, refetch } = useQuery({
    queryKey: ['managerWorkflows'],
    queryFn: () => adminWorkflowService.getAllWorkflows({ limit: 1000 }),
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  // Subscribe to socket events and reconcile the React Query cache.
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
      // Specific UX for revision conflict so concurrent edits surface clearly.
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

  const groupedTasks = useMemo(() => {
    return COLUMNS.reduce((acc, col) => {
      acc[col.id] = tasks.filter(t => 
        t.status === col.id && 
        (t.taskNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
         t.taskDescription.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      return acc;
    }, {} as Record<WorkflowStatus, WorkflowTask[]>);
  }, [tasks, searchQuery]);

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

    // Frontend State Machine Validation
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

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-stone-200 border-t-amber-500 rounded-full animate-spin"></div>
          <p className="text-stone-500 font-medium uppercase tracking-widest text-xs">Syncing Production Board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="bg-white border-b border-stone-200 p-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-20">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search workflows..." 
              className="w-full pl-9 pr-4 py-1.5 bg-stone-100 border-none rounded-lg text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-stone-400 mr-4">
            <span
              className={`w-2 h-2 rounded-full ${
                isLive
                  ? 'bg-emerald-500 animate-pulse'
                  : managerSocketState === 'reconnecting'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-stone-300'
              }`}
            />
            {isLive
              ? 'Live Updates Active'
              : managerSocketState === 'reconnecting'
              ? 'Reconnecting…'
              : 'Offline'}
          </div>
          <button 
            onClick={() => refetch()}
            className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${mutation.isPending ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Kanban Scroll Area */}
      <div className="flex-1 overflow-x-auto p-6 bg-stone-50">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-h-[calc(100vh-12rem)]">
            {COLUMNS.map((col) => (
              <KanbanColumn 
                key={col.id} 
                id={col.id} 
                title={col.title} 
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
              <div className="w-80 opacity-80 pointer-events-none scale-105 rotate-2 shadow-2xl">
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
