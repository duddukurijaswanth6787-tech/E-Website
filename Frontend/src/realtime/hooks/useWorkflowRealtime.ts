import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useRealtime } from '../SocketProvider';
import {
  ERP_EVENTS,
  type RealtimeEvent,
  type WorkflowDiffPayload,
} from '../events';
import { useSocketStore } from '../socketStore';

type WorkflowsCache =
  | { data?: { tasks?: WorkflowTaskLike[] } }
  | undefined;

/**
 * Locally-known shape of the cached workflow task. Kept minimal to match
 * `Frontend/src/api/services/tailorWorkflow.service.ts:WorkflowTask` without
 * pulling the full type and creating a circular import.
 */
interface WorkflowTaskLike {
  _id: string;
  status: string;
  priority?: string;
  deadline?: string;
  isSlaViolated?: boolean;
  escalationSeverity?: string;
  tailorId?: unknown;
  revision?: number;
  updatedAt?: string;
}

/**
 * Patch a single workflow inside the manager Kanban cache, with revision
 * gating so stale events can never overwrite fresher local state.
 */
const patchWorkflowInCache = (
  cache: WorkflowsCache,
  diff: WorkflowDiffPayload,
): WorkflowsCache => {
  if (!cache?.data?.tasks) return cache;
  let mutated = false;
  const tasks = cache.data.tasks.map((t) => {
    if (t._id !== diff.workflowId) return t;
    const currentRev = typeof t.revision === 'number' ? t.revision : -1;
    if (diff.revision <= currentRev) return t; // stale event; ignore
    mutated = true;
    return {
      ...t,
      status: diff.status,
      priority: diff.priority,
      deadline: diff.deadline ?? t.deadline,
      isSlaViolated: diff.isSlaViolated,
      escalationSeverity: diff.escalationSeverity,
      revision: diff.revision,
      updatedAt: diff.updatedAt,
      // tailorId is left untouched here; reassign event handles it
    };
  });
  if (!mutated) return cache;
  return { ...cache, data: { ...cache.data, tasks } };
};

/**
 * Wire socket workflow events to React Query for the manager Kanban.
 * Use inside `ManagerWorkflowsBoard` (and `AdminWorkflowsPage` via the
 * same hook) to replace polling with push.
 */
export const useWorkflowRealtime = (options?: {
  /** When true, this hook also patches the `adminWorkflows` cache. */
  alsoPatchAdmin?: boolean;
}): void => {
  const { managerSocket, workflowSocket } = useRealtime();
  const queryClient = useQueryClient();
  const noteEvent = useSocketStore((s) => s.noteEvent);

  useEffect(() => {
    const sockets = [managerSocket, workflowSocket].filter(Boolean);
    if (sockets.length === 0) return;

    const applyDiff = (event: RealtimeEvent<WorkflowDiffPayload>) => {
      const diff = event.payload;
      noteEvent(diff.revision);

      queryClient.setQueriesData<WorkflowsCache>(
        { queryKey: ['managerWorkflows'] },
        (old) => patchWorkflowInCache(old, diff),
      );
      if (options?.alsoPatchAdmin) {
        queryClient.setQueriesData<WorkflowsCache>(
          { queryKey: ['adminWorkflows'] },
          (old) => patchWorkflowInCache(old, diff),
        );
      }
      // Detail cache: best-effort invalidation so the drawer refreshes.
      queryClient.invalidateQueries({ queryKey: ['task', diff.workflowId] });
      queryClient.invalidateQueries({
        queryKey: ['workflow', diff.workflowId],
      });
    };

    const handleReassigned = (event: RealtimeEvent<WorkflowDiffPayload & { previousTailorId?: string | null }>) => {
      const diff = event.payload;
      noteEvent(diff.revision);
      // Reassignment changes who owns the task; safest to invalidate so the
      // populated tailor object gets refetched (avoids stale joined data).
      queryClient.invalidateQueries({ queryKey: ['managerWorkflows'] });
      if (options?.alsoPatchAdmin) {
        queryClient.invalidateQueries({ queryKey: ['adminWorkflows'] });
      }
      queryClient.invalidateQueries({ queryKey: ['adminTailors'] });
      queryClient.invalidateQueries({ queryKey: ['task', diff.workflowId] });
    };

    const subs: Array<() => void> = [];
    sockets.forEach((socket) => {
      const onUpdated = applyDiff;
      const onCompleted = applyDiff;
      const onPriority = applyDiff;
      const onDeadline = applyDiff;
      const onEscalated = applyDiff;
      const onAssigned = (event: RealtimeEvent<WorkflowDiffPayload>) => {
        // Newly created workflow — always refetch the board so it appears.
        queryClient.invalidateQueries({ queryKey: ['managerWorkflows'] });
        if (options?.alsoPatchAdmin) {
          queryClient.invalidateQueries({ queryKey: ['adminWorkflows'] });
        }
        noteEvent(event.payload.revision);
      };

      socket!.on(ERP_EVENTS.WORKFLOW_UPDATED, onUpdated);
      socket!.on(ERP_EVENTS.WORKFLOW_COMPLETED, onCompleted);
      socket!.on(ERP_EVENTS.WORKFLOW_PRIORITY_CHANGED, onPriority);
      socket!.on(ERP_EVENTS.WORKFLOW_DEADLINE_CHANGED, onDeadline);
      socket!.on(ERP_EVENTS.WORKFLOW_ESCALATED, onEscalated);
      socket!.on(ERP_EVENTS.WORKFLOW_QC_REJECTED, onUpdated);
      socket!.on(ERP_EVENTS.WORKFLOW_REASSIGNED, handleReassigned);
      socket!.on(ERP_EVENTS.WORKFLOW_ASSIGNED, onAssigned);

      subs.push(() => {
        socket!.off(ERP_EVENTS.WORKFLOW_UPDATED, onUpdated);
        socket!.off(ERP_EVENTS.WORKFLOW_COMPLETED, onCompleted);
        socket!.off(ERP_EVENTS.WORKFLOW_PRIORITY_CHANGED, onPriority);
        socket!.off(ERP_EVENTS.WORKFLOW_DEADLINE_CHANGED, onDeadline);
        socket!.off(ERP_EVENTS.WORKFLOW_ESCALATED, onEscalated);
        socket!.off(ERP_EVENTS.WORKFLOW_QC_REJECTED, onUpdated);
        socket!.off(ERP_EVENTS.WORKFLOW_REASSIGNED, handleReassigned);
        socket!.off(ERP_EVENTS.WORKFLOW_ASSIGNED, onAssigned);
      });
    });

    return () => subs.forEach((u) => u());
  }, [managerSocket, workflowSocket, queryClient, noteEvent, options?.alsoPatchAdmin]);
};
