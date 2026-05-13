import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { useNotificationStore } from '../realtime/notificationStore';

const API_BASE = '/notifications';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const markReadOptimistic = useNotificationStore((s) => s.markReadOptimistic);

  // Paginated History
  const historyQuery = useInfiniteQuery({
    queryKey: ['notifications', 'history'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await api.get(`${API_BASE}?page=${pageParam}&limit=15`);
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;
      const { page, total, limit } = lastPage.pagination;
      return page * limit < total ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 60000,
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`${API_BASE}/${id}/read`);
    },
    onMutate: async (id) => {
      // Optimistic update
      markReadOptimistic(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await api.patch(`${API_BASE}/mark-all-read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // Store update will come via Socket.IO fanout NOTIFICATION_COUNT_UPDATE
    },
  });

  return {
    history: historyQuery.data?.pages.flatMap((p) => {
      if (!p?.data || !Array.isArray(p.data)) return [];
      return p.data.map((n: any) => ({
        ...n,
        id: n.id || n._id // Standardize ID field
      })).filter((n: any) => n.id); // Ensure ID exists
    }) || [],
    isLoading: historyQuery.isLoading,
    isFetchingNextPage: historyQuery.isFetchingNextPage,
    hasNextPage: historyQuery.hasNextPage,
    fetchNextPage: historyQuery.fetchNextPage,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
  };
};
