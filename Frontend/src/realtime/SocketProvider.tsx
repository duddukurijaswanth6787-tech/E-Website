import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { createErpSocket } from './createSocket';
import {
  ERP_CLIENT_INTENTS,
  ERP_EVENTS,
  ERP_NAMESPACES,
  type ConnectionReadyPayload,
  type ErpNamespace,
  type RealtimeEvent,
  type SyncRequiredPayload,
} from './events';
import { useSocketStore, type SocketConnectionState } from './socketStore';

import { config } from '../config/env.config';

interface RealtimeContextValue {
  managerSocket: Socket | null;
  tailorSocket: Socket | null;
  workflowSocket: Socket | null;
  notificationsSocket: Socket | null;
  requestResync: () => void;
}

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const socketBase = config.socketUrl;

const namespacesForRole = (role: string | undefined): ErpNamespace[] => {
  if (!role) return [];
  if (role === 'manager' || role === 'admin' || role === 'super_admin') {
    return [
      ERP_NAMESPACES.MANAGER,
      ERP_NAMESPACES.WORKFLOW,
      ERP_NAMESPACES.NOTIFICATIONS,
    ];
  }
  if (role === 'tailor') {
    return [ERP_NAMESPACES.TAILOR, ERP_NAMESPACES.NOTIFICATIONS];
  }
  return [];
};

export function SocketProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const role = useAuthStore((s) => s.user?.role);

  const setManagerState = useSocketStore((s) => s.setManagerState);
  const setTailorState = useSocketStore((s) => s.setTailorState);
  const setWorkflowState = useSocketStore((s) => s.setWorkflowState);
  const setNotificationsState = useSocketStore((s) => s.setNotificationsState);
  const noteEvent = useSocketStore((s) => s.noteEvent);

  const managerRef = useRef<Socket | null>(null);
  const tailorRef = useRef<Socket | null>(null);
  const workflowRef = useRef<Socket | null>(null);
  const notificationsRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !role) {
      [managerRef, tailorRef, workflowRef, notificationsRef].forEach((ref) => {
        if (ref.current) ref.current.disconnect();
        ref.current = null;
      });
      setManagerState('idle');
      setTailorState('idle');
      setWorkflowState('idle');
      setNotificationsState('idle');
      return;
    }

    const targets = namespacesForRole(role);
    if (targets.length === 0) return;

    const getToken = () => useAuthStore.getState().token;

    const setStateFor = (
      ns: ErpNamespace,
      state: SocketConnectionState,
    ) => {
      switch (ns) {
        case ERP_NAMESPACES.MANAGER:
          setManagerState(state);
          break;
        case ERP_NAMESPACES.TAILOR:
          setTailorState(state);
          break;
        case ERP_NAMESPACES.WORKFLOW:
          setWorkflowState(state);
          break;
        case ERP_NAMESPACES.NOTIFICATIONS:
          setNotificationsState(state);
          break;
      }
    };

    const connect = (ns: ErpNamespace, ref: React.MutableRefObject<Socket | null>) => {
      if (ref.current) return;
      const socket = createErpSocket({ baseUrl: socketBase, namespace: ns, getToken });
      ref.current = socket;

      setStateFor(ns, 'connecting');

      socket.on('connect', () => {
        setStateFor(ns, 'connected');
        const lastSeen = useSocketStore.getState().lastSeenRevision ?? undefined;
        socket.emit(ERP_CLIENT_INTENTS.RESYNC_REQUEST, { lastSeenRevision: lastSeen });
      });

      socket.on('reconnect_attempt', () => setStateFor(ns, 'reconnecting'));
      socket.on('disconnect', () => setStateFor(ns, 'disconnected'));
      socket.on('connect_error', (err: Error) => {
        const msg = err?.message || '';
        if (/unauth/i.test(msg) || /forbidden/i.test(msg)) {
          setStateFor(ns, 'unauthorized');
        } else {
          setStateFor(ns, 'reconnecting');
        }
      });

      const observe = (event: RealtimeEvent<unknown>) => {
        noteEvent(event.workflowRevision);
      };

      Object.values(ERP_EVENTS).forEach((evtType) => {
        socket.on(evtType, observe);
      });

      socket.on(ERP_EVENTS.SYNC_REQUIRED, (event: RealtimeEvent<SyncRequiredPayload>) => {
        queryClient.invalidateQueries({ queryKey: ['managerWorkflows'] });
        queryClient.invalidateQueries({ queryKey: ['adminWorkflows'] });
        queryClient.invalidateQueries({ queryKey: ['tailorTasks'] });
        queryClient.invalidateQueries({ queryKey: ['workforceOverview'] });
        queryClient.invalidateQueries({ queryKey: ['operationsIntelligence'] });
        queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
        queryClient.invalidateQueries({ queryKey: ['auditStats'] });
        observe(event);
      });

      socket.on(ERP_EVENTS.CONNECTION_READY, (payload: ConnectionReadyPayload) => {
        if (payload.eventVersion !== 1) {
          console.warn('[realtime] event version mismatch', payload.eventVersion);
        }
      });

      socket.connect();
    };

    if (targets.includes(ERP_NAMESPACES.MANAGER)) {
      connect(ERP_NAMESPACES.MANAGER, managerRef);
    }
    if (targets.includes(ERP_NAMESPACES.TAILOR)) {
      connect(ERP_NAMESPACES.TAILOR, tailorRef);
    }
    if (targets.includes(ERP_NAMESPACES.WORKFLOW)) {
      connect(ERP_NAMESPACES.WORKFLOW, workflowRef);
    }
    if (targets.includes(ERP_NAMESPACES.NOTIFICATIONS)) {
      connect(ERP_NAMESPACES.NOTIFICATIONS, notificationsRef);
    }

    // Heartbeat Interval to maintain enterprise presence stability
    const heartbeatInterval = setInterval(() => {
      if (notificationsRef.current?.connected) {
        notificationsRef.current.emit(ERP_CLIENT_INTENTS.PRESENCE_HEARTBEAT);
      }
    }, 30000); // 30s heartbeats

    return () => {
      clearInterval(heartbeatInterval);
      [managerRef, tailorRef, workflowRef, notificationsRef].forEach((ref) => {
        if (ref.current) {
          const s = ref.current;
          s.removeAllListeners();
          if (s.connected || (s as any).connecting) {
            s.disconnect();
          }
          ref.current = null;
        }
      });
    };
  }, [isAuthenticated, role, queryClient, noteEvent, setManagerState, setNotificationsState, setTailorState, setWorkflowState]);

  const value = useMemo<RealtimeContextValue>(
    () => ({
      managerSocket: managerRef.current,
      tailorSocket: tailorRef.current,
      workflowSocket: workflowRef.current,
      notificationsSocket: notificationsRef.current,
      requestResync: () => {
        const last = useSocketStore.getState().lastSeenRevision ?? undefined;
        [managerRef, tailorRef, workflowRef, notificationsRef].forEach((ref) => {
          ref.current?.emit(ERP_CLIENT_INTENTS.RESYNC_REQUEST, { lastSeenRevision: last });
        });
      },
    }),
    [isAuthenticated, role, managerRef, tailorRef, workflowRef, notificationsRef],
  );

  return (
    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
  );
}

export function useRealtime(): RealtimeContextValue;
export function useRealtime(ns: 'manager' | 'tailor' | 'workflow' | 'notifications'): { socket: Socket | null; state: SocketConnectionState };
export function useRealtime(ns?: string): any {
  const ctx = useContext(RealtimeContext);
  const states = useSocketStore();

  if (!ctx) {
    const idleValue = {
      managerSocket: null,
      tailorSocket: null,
      workflowSocket: null,
      notificationsSocket: null,
      requestResync: () => undefined,
    };
    if (!ns) return idleValue;
    return { socket: null, state: 'idle' };
  }

  if (!ns) return ctx;

  switch (ns) {
    case 'manager':
      return { socket: ctx.managerSocket, state: states.managerState };
    case 'tailor':
      return { socket: ctx.tailorSocket, state: states.tailorState };
    case 'workflow':
      return { socket: ctx.workflowSocket, state: states.workflowState };
    case 'notifications':
      return { socket: ctx.notificationsSocket, state: states.notificationsState };
    default:
      return { socket: null, state: 'idle' };
  }
}
