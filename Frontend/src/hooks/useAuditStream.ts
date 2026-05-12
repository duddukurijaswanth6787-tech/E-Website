import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { auditLogService, type AuditLogEntry } from '../api/services/audit-log.service';
import { useRealtime } from '../realtime/SocketProvider';

export const useAuditStream = (enableRealtime = true) => {
  const queryClient = useQueryClient();
  const { notificationsSocket: socket } = useRealtime();

  const { data: logsData, isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: () => auditLogService.getLogs({ limit: 50 }),
    refetchOnWindowFocus: false
  });

  const { data: stats } = useQuery({
    queryKey: ['auditStats'],
    queryFn: () => auditLogService.getStats(),
    refetchInterval: 60000 // Refetch stats every minute
  });

  useEffect(() => {
    if (!socket || !enableRealtime) return;

    const handleNewLog = (newLog: AuditLogEntry) => {
      queryClient.setQueryData(['auditLogs'], (old: any) => {
        if (!old) return old;
        const updatedLogs = [newLog, ...old.data.logs].slice(0, 100);
        return {
          ...old,
          data: {
            ...old.data,
            logs: updatedLogs
          }
        };
      });

      // Also invalidate stats to keep counters fresh
      queryClient.invalidateQueries({ queryKey: ['auditStats'] });
    };

    socket.on('NEW_AUDIT_LOG', handleNewLog);

    return () => {
      socket.off('NEW_AUDIT_LOG', handleNewLog);
    };
  }, [socket, queryClient, enableRealtime]);

  return {
    logs: logsData?.data?.logs || [],
    pagination: logsData?.data?.pagination,
    stats: stats?.data,
    isLoading
  };
};
