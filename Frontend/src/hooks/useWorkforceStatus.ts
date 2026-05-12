import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workforceService, type EmployeeLiveStatus } from '../api/services/workforce.service';
import { useRealtime } from '../realtime/SocketProvider';

export const useWorkforceStatus = (enableRealtime = true) => {
  const queryClient = useQueryClient();
  const { notificationsSocket: socket } = useRealtime();

  const { data: overview, isLoading: isOverviewLoading } = useQuery({
    queryKey: ['workforceOverview'],
    queryFn: () => workforceService.getOverview(),
    enabled: enableRealtime
  });

  const { data: operations, isLoading: isOpsLoading } = useQuery({
    queryKey: ['operationsIntelligence'],
    queryFn: () => workforceService.getOperationsIntelligence(),
    enabled: enableRealtime,
    refetchInterval: 30000 // Refetch production stats every 30s
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: EmployeeLiveStatus) => workforceService.updateStatus(status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workforceOverview'] });
      queryClient.invalidateQueries({ queryKey: ['operationsIntelligence'] });
    }
  });

  useEffect(() => {
    if (!socket || !enableRealtime) return;

    const handleUpdate = (data: { employeeId: string; status: EmployeeLiveStatus; lastActiveAt: string }) => {
      // Optimistically update the query cache
      queryClient.setQueryData(['workforceOverview'], (old: any) => {
        if (!old) return old;
        const updatedWorkforce = old.data.workforce.map((member: any) => {
          if (member._id === data.employeeId) {
            return {
              ...member,
              liveStatus: data.status,
              lastActive: data.lastActiveAt
            };
          }
          return member;
        });

        // Recalculate stats
        const stats = {
          total: updatedWorkforce.length,
          present: updatedWorkforce.filter((w: any) => w.isPresent).length,
          active: updatedWorkforce.filter((w: any) => w.liveStatus !== 'offline').length,
          online: updatedWorkforce.filter((w: any) => w.liveStatus === 'online').length,
          working: updatedWorkforce.filter((w: any) => w.liveStatus === 'working').length,
          onBreak: updatedWorkforce.filter((w: any) => w.liveStatus === 'on_break').length
        };

        return { ...old, data: { ...old.data, workforce: updatedWorkforce, stats } };
      });
      
      // Invalidate ops intelligence as well to ensure it reflects current workforce activity
      queryClient.invalidateQueries({ queryKey: ['operationsIntelligence'] });
    };

    socket.on('WORKFORCE_STATUS_UPDATE', handleUpdate);

    return () => {
      socket.off('WORKFORCE_STATUS_UPDATE', handleUpdate);
    };
  }, [socket, queryClient, enableRealtime]);

  return {
    overview: overview?.data,
    operations: operations?.data,
    isLoading: isOverviewLoading || isOpsLoading,
    updateStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending
  };
};
