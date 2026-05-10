import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useNotificationStore } from '../realtime/notificationStore';

const API_BASE = '/api/v1/notifications';

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const markReadOptimistic = useNotificationStore((s) => s.markReadOptimistic);

  // Paginated History
  const historyQuery = useInfiniteQuery({
    queryKey: ['notifications', 'history'],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await axios.get(`${API_BASE}?page=${pageParam}&limit=15`);
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.pagination) return undefined;
      const { page, total, limit } = lastPage.pagination;
      return page * limit < total ? page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.patch(`${API_BASE}/${id}/read`);
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
      await axios.patch(`${API_BASE}/mark-all-read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // Store update will come via Socket.IO fanout NOTIFICATION_COUNT_UPDATE
    },
  });

  return {
    history: historyQuery.data?.pages.flatMap((p) => p.data) || [],
    isLoading: historyQuery.isLoading,
    isFetchingNextPage: historyQuery.isFetchingNextPage,
    hasNextPage: historyQuery.hasNextPage,
    fetchNextPage: historyQuery.fetchNextPage,
    markRead: markReadMutation.mutate,
    markAllRead: markAllReadMutation.mutate,
  };
};
