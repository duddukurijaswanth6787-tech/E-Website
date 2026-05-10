import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tailorWorkflowService } from '../api/services/tailorWorkflow.service';
import toast from 'react-hot-toast';

/**
 * Tailor list hook.
 *
 * Realtime push (`useTailorRealtime`) drives invalidations in real time;
 * we keep a slow safety-net poll for catastrophic disconnect scenarios.
 */
export const useAssignedTasks = (statusFilter?: string) => {
  return useQuery({
    queryKey: ['tailorTasks', statusFilter],
    queryFn: () => tailorWorkflowService.getAssignedTasks(statusFilter === 'All' || statusFilter === 'Active' ? undefined : statusFilter),
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useTaskDetails = (taskId: string | undefined) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => tailorWorkflowService.getTaskDetails(taskId as string),
    enabled: !!taskId,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

/**
 * Update task status. Includes `expectedRevision` so the server can return
 * 409 Conflict on concurrent edits, which we surface as a UX-friendly toast.
 */
export const useUpdateTaskStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      status,
      note,
      expectedRevision,
    }: {
      taskId: string;
      status: string;
      note?: string;
      expectedRevision?: number;
    }) => tailorWorkflowService.updateStatus(taskId, status, note, expectedRevision),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['tailorTasks'] });
      toast.success('Workflow status updated successfully');
    },
    onError: (err: any) => {
      const status = err?.response?.status || err?.statusCode;
      const isConflict = status === 409 || /revision conflict/i.test(err?.message ?? '');
      if (isConflict) {
        toast.error('This task was just updated elsewhere — refreshing.', { duration: 3500 });
        queryClient.invalidateQueries({ queryKey: ['tailorTasks'] });
      } else {
        toast.error(err.message || 'Failed to update workflow status');
      }
    }
  });
};

export const useAddTailorNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ taskId, note }: { taskId: string; note: string }) =>
      tailorWorkflowService.addTailorNote(taskId, note),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      toast.success('Production note added');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to add production note');
    }
  });
};
