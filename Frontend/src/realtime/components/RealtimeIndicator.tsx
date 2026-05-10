import { useSocketStore, type SocketConnectionState } from '../socketStore';

interface RealtimeIndicatorProps {
  /** Which namespace to reflect. Defaults to manager (Kanban context). */
  channel?: 'manager' | 'tailor' | 'workflow' | 'notifications';
  /** Compact mode shows only the dot. */
  compact?: boolean;
}

const labelFor = (state: SocketConnectionState): string => {
  switch (state) {
    case 'connected':
      return 'Live Updates Active';
    case 'connecting':
      return 'Connecting…';
    case 'reconnecting':
      return 'Reconnecting…';
    case 'unauthorized':
      return 'Realtime: unauthorized';
    case 'disconnected':
      return 'Offline';
    default:
      return 'Realtime: idle';
  }
};

const dotClassFor = (state: SocketConnectionState): string => {
  switch (state) {
    case 'connected':
      return 'bg-emerald-500 animate-pulse';
    case 'connecting':
    case 'reconnecting':
      return 'bg-amber-500 animate-pulse';
    case 'unauthorized':
      return 'bg-red-500';
    case 'disconnected':
      return 'bg-stone-300';
    default:
      return 'bg-stone-200';
  }
};

/**
 * Lightweight UI badge showing realtime socket health for a given channel.
 *
 * Use anywhere a "Live" indicator is needed, instead of hand-rolling
 * connection state tracking per page.
 */
export const RealtimeIndicator = ({
  channel = 'manager',
  compact = false,
}: RealtimeIndicatorProps) => {
  const state = useSocketStore((s) => {
    switch (channel) {
      case 'manager':
        return s.managerState;
      case 'tailor':
        return s.tailorState;
      case 'workflow':
        return s.workflowState;
      case 'notifications':
        return s.notificationsState;
    }
  });

  return (
    <div className="flex items-center gap-2 text-xs text-stone-500">
      <span className={`w-2 h-2 rounded-full ${dotClassFor(state)}`} />
      {!compact && <span>{labelFor(state)}</span>}
    </div>
  );
};
