import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useRealtime } from '../SocketProvider';
import {
  ERP_EVENTS,
  type RealtimeEvent,
  type WorkflowAssignedPayload,
  type WorkflowDiffPayload,
  type WorkflowReassignedPayload,
} from '../events';
import { useSocketStore } from '../socketStore';
import { useAuthStore } from '../../store/authStore';
import type { WorkflowTask } from '../../api/services/tailorWorkflow.service';

type TasksListCache = { data: WorkflowTask[] } | undefined;
type TaskDetailCache = { data: WorkflowTask } | undefined;

/**
 * Patch a single task in the list cache with revision gating.
 */
const patchTaskInList = (
  cache: TasksListCache,
  diff: WorkflowDiffPayload,
): TasksListCache => {
  if (!cache?.data) return cache;
  let mutated = false;
  const tasks = cache.data.map((t) => {
    if (t._id !== diff.workflowId) return t;
    const currentRev = typeof t.revision === 'number' ? t.revision : -1;
    if (diff.revision <= currentRev) return t; // stale event
    mutated = true;
    return {
      ...t,
      status: diff.status as any,
      priority: diff.priority as any,
      deadline: diff.deadline ?? t.deadline,
      isSlaViolated: diff.isSlaViolated,
      escalationSeverity: diff.escalationSeverity as any,
      revision: diff.revision,
      updatedAt: diff.updatedAt,
    };
  });
  if (!mutated) return cache;
  return { ...cache, data: tasks };
};

/**
 * Patch a single task in the detail cache with revision gating.
 */
const patchTaskDetail = (
  cache: TaskDetailCache,
  diff: WorkflowDiffPayload,
): TaskDetailCache => {
  if (!cache?.data || cache.data._id !== diff.workflowId) return cache;
  const currentRev = typeof cache.data.revision === 'number' ? cache.data.revision : -1;
  if (diff.revision <= currentRev) return cache; // stale event
  return {
    ...cache,
    data: {
      ...cache.data,
      status: diff.status as any,
      priority: diff.priority as any,
      deadline: diff.deadline ?? cache.data.deadline,
      isSlaViolated: diff.isSlaViolated,
      escalationSeverity: diff.escalationSeverity as any,
      revision: diff.revision,
      updatedAt: diff.updatedAt,
    },
  };
};

/**
 * Tailor-side realtime: invalidates/patches the tailor's task lists and
 * surfaces toasts for high-signal events (new assignments, QC rejections).
 */
export const useTailorRealtime = (): void => {
  const { tailorSocket, notificationsSocket } = useRealtime();
  const queryClient = useQueryClient();
  const noteEvent = useSocketStore((s) => s.noteEvent);
  const currentTailorId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    const sockets = [tailorSocket, notificationsSocket].filter(Boolean);
    if (sockets.length === 0) return;

    const onAssigned = (event: RealtimeEvent<WorkflowAssignedPayload>) => {
      const diff = event.payload;
      noteEvent(diff.revision);

      // Add to list if not present, or patch if present (robustness)
      queryClient.setQueriesData<TasksListCache>({ queryKey: ['tailorTasks'] }, (old) => {
        if (!old?.data) return old;
        const exists = old.data.some((t) => t._id === diff.workflowId);
        if (exists) return patchTaskInList(old, diff);
        
        // Construct a partial task from the assignment payload. 
        // Real-world tasks usually require more fields (measurements, etc),
        // so we invalidate the specific detail cache to force a fresh fetch
        // when they click it, but add it to the list for visibility.
        const newTask: Partial<WorkflowTask> = {
          _id: diff.workflowId,
          taskNumber: diff.taskNumber,
          taskDescription: diff.taskDescription,
          status: diff.status as any,
          priority: diff.priority as any,
          deadline: diff.deadline ?? '',
          isSlaViolated: diff.isSlaViolated,
          escalationSeverity: diff.escalationSeverity as any,
          revision: diff.revision,
          updatedAt: diff.updatedAt,
          createdAt: diff.updatedAt,
          escalationFlags: [],
        };
        return { ...old, data: [newTask as WorkflowTask, ...old.data] };
      });

      toast.success(
        `New task assigned: ${diff.taskNumber}`,
        { icon: '✂️', duration: 5000 }
      );
    };

    const onReassigned = (event: RealtimeEvent<WorkflowReassignedPayload>) => {
      const diff = event.payload;
      noteEvent(diff.revision);

      // If reassigned AWAY from current tailor, remove from list
      if (diff.previousTailorId === currentTailorId && diff.tailorId !== currentTailorId) {
        queryClient.setQueriesData<TasksListCache>({ queryKey: ['tailorTasks'] }, (old) => {
          if (!old?.data) return old;
          return { ...old, data: old.data.filter((t) => t._id !== diff.workflowId) };
        });
        queryClient.invalidateQueries({ queryKey: ['task', diff.workflowId] });
      } 
      // If reassigned TO current tailor (from someone else), add to list
      else if (diff.tailorId === currentTailorId) {
        onAssigned(event as any);
      }
    };

    const onUpdated = (event: RealtimeEvent<WorkflowDiffPayload>) => {
      const diff = event.payload;
      noteEvent(diff.revision);

      queryClient.setQueriesData<TasksListCache>({ queryKey: ['tailorTasks'] }, (old) => 
        patchTaskInList(old, diff)
      );
      queryClient.setQueriesData<TaskDetailCache>({ queryKey: ['task', diff.workflowId] }, (old) =>
        patchTaskDetail(old, diff)
      );
    };

    const onQcRejected = (event: RealtimeEvent<WorkflowDiffPayload>) => {
      onUpdated(event);
      toast.error(`QC rejected on ${event.payload.taskNumber}. Returned for rework.`, { 
        duration: 6000,
        icon: '⚠️'
      });
    };

    const onEscalated = (event: RealtimeEvent<WorkflowDiffPayload>) => {
      onUpdated(event);
      toast.error(`Task ${event.payload.taskNumber} has been ESCALATED!`, { 
        duration: 5000,
        icon: '🚨'
      });
    };

    const subs: Array<() => void> = [];
    sockets.forEach((socket) => {
      socket!.on(ERP_EVENTS.WORKFLOW_ASSIGNED, onAssigned);
      socket!.on(ERP_EVENTS.WORKFLOW_REASSIGNED, onReassigned);
      socket!.on(ERP_EVENTS.WORKFLOW_UPDATED, onUpdated);
      socket!.on(ERP_EVENTS.WORKFLOW_PRIORITY_CHANGED, onUpdated);
      socket!.on(ERP_EVENTS.WORKFLOW_DEADLINE_CHANGED, onUpdated);
      socket!.on(ERP_EVENTS.WORKFLOW_QC_REJECTED, onQcRejected);
      socket!.on(ERP_EVENTS.WORKFLOW_ESCALATED, onEscalated);
      socket!.on(ERP_EVENTS.WORKFLOW_COMPLETED, onUpdated);

      subs.push(() => {
        socket!.off(ERP_EVENTS.WORKFLOW_ASSIGNED, onAssigned);
        socket!.off(ERP_EVENTS.WORKFLOW_REASSIGNED, onReassigned);
        socket!.off(ERP_EVENTS.WORKFLOW_UPDATED, onUpdated);
        socket!.off(ERP_EVENTS.WORKFLOW_PRIORITY_CHANGED, onUpdated);
        socket!.off(ERP_EVENTS.WORKFLOW_DEADLINE_CHANGED, onUpdated);
        socket!.off(ERP_EVENTS.WORKFLOW_QC_REJECTED, onQcRejected);
        socket!.off(ERP_EVENTS.WORKFLOW_ESCALATED, onEscalated);
        socket!.off(ERP_EVENTS.WORKFLOW_COMPLETED, onUpdated);
      });
    });

    return () => subs.forEach((u) => u());
  }, [tailorSocket, notificationsSocket, queryClient, noteEvent, currentTailorId]);
};
