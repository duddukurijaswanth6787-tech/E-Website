import { create } from 'zustand';

export type SocketConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'disconnected'
  | 'unauthorized';

interface SocketState {
  managerState: SocketConnectionState;
  tailorState: SocketConnectionState;
  workflowState: SocketConnectionState;
  notificationsState: SocketConnectionState;
  /** Last time we received any server event — used by hooks for staleness UI. */
  lastEventAt: number | null;
  /** Highest workflowRevision seen this session, for resync gap detection. */
  lastSeenRevision: number | null;
  setManagerState: (s: SocketConnectionState) => void;
  setTailorState: (s: SocketConnectionState) => void;
  setWorkflowState: (s: SocketConnectionState) => void;
  setNotificationsState: (s: SocketConnectionState) => void;
  noteEvent: (revision?: number) => void;
}

/**
 * Lightweight global state for socket health + last-seen revision.
 * Decouples UI status indicators from the socket plumbing.
 */
export const useSocketStore = create<SocketState>((set, get) => ({
  managerState: 'idle',
  tailorState: 'idle',
  workflowState: 'idle',
  notificationsState: 'idle',
  lastEventAt: null,
  lastSeenRevision: null,

  setManagerState: (s) => set({ managerState: s }),
  setTailorState: (s) => set({ tailorState: s }),
  setWorkflowState: (s) => set({ workflowState: s }),
  setNotificationsState: (s) => set({ notificationsState: s }),

  noteEvent: (revision) => {
    const cur = get().lastSeenRevision ?? 0;
    set({
      lastEventAt: Date.now(),
      lastSeenRevision:
        typeof revision === 'number' && revision > cur ? revision : cur,
    });
  },
}));
