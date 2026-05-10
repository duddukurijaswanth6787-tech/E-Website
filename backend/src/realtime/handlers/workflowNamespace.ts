import type { Namespace, Socket } from 'socket.io';
import { logger } from '../../common/logger';
import { socketAuthMiddleware, type SocketPrincipal } from '../auth/socketAuth';
import { workflowRoom } from '../rooms/roomNames';
import {
  ERP_CLIENT_INTENTS,
  ERP_EVENTS,
  ERP_EVENT_VERSION,
  type RealtimeResponse
} from '../events/erpEvents';
import { collaborationManager } from '../collaboration';

const MAX_WORKFLOW_SUBSCRIPTIONS_PER_SOCKET = 50;

const branchOccupancyRoom = (branchId: string) => `branch:workflow:occupancy:${branchId}`;

export const registerWorkflowNamespace = (nsp: Namespace): void => {
  nsp.use(socketAuthMiddleware('any'));

  nsp.on('connection', (socket: Socket) => {
    const principal = socket.data.principal as SocketPrincipal;
    // Track workflows this socket is actively collaborating on
    const activeCollaborations = new Set<string>();

    // Join branch-level occupancy room for broad awareness (e.g. Kanban board)
    if (principal.branchId) {
      socket.join(branchOccupancyRoom(principal.branchId));
    }

    const broadcastCollaborators = async (workflowId: string) => {
      const collaborators = await collaborationManager.getCollaborators(workflowId);
      const payload = {
        workflowId,
        collaborators,
        timestamp: Date.now()
      };

      // 1. Notify individual workflow viewers
      nsp.to(workflowRoom(workflowId)).emit(ERP_EVENTS.WORKFLOW_COLLABORATORS_UPDATE, payload);

      // 2. Notify branch-level board viewers
      if (principal.branchId) {
        nsp.to(branchOccupancyRoom(principal.branchId)).emit(ERP_EVENTS.WORKFLOW_COLLABORATORS_UPDATE, payload);
      }
    };

    /**
     * Start Viewing/Collaborating on a Workflow
     */
    socket.on(ERP_CLIENT_INTENTS.WORKFLOW_VIEW_START, async (payload: { workflowId: string }, ack?: (r: RealtimeResponse) => void) => {
      const { workflowId } = payload;
      if (!workflowId) return ack?.({ ok: false, error: 'workflowId required' });

      socket.join(workflowRoom(workflowId));
      activeCollaborations.add(workflowId);

      await collaborationManager.trackPresence({
        workflowId,
        userId: principal.id,
        role: principal.role,
        name: principal.name || 'Unknown',
        isEditing: false
      });

      await broadcastCollaborators(workflowId);
      ack?.({ ok: true });
    });

    /**
     * Stop Viewing
     */
    socket.on(ERP_CLIENT_INTENTS.WORKFLOW_VIEW_END, async (payload: { workflowId: string }, ack?: (r: RealtimeResponse) => void) => {
      const { workflowId } = payload;
      socket.leave(workflowRoom(workflowId));
      activeCollaborations.delete(workflowId);

      await collaborationManager.removePresence(workflowId, principal.id);
      await broadcastCollaborators(workflowId);
      ack?.({ ok: true });
    });

    /**
     * Start Editing Session
     */
    socket.on(ERP_CLIENT_INTENTS.WORKFLOW_EDIT_START, async (payload: { workflowId: string }, ack?: (r: RealtimeResponse) => void) => {
      const { workflowId } = payload;
      
      // Check if someone else is already editing
      const currentEditor = await collaborationManager.getActiveEditor(workflowId, principal.id);
      if (currentEditor) {
        return ack?.({ 
          ok: false, 
          error: `Workflow is currently being edited by ${currentEditor.name}` 
        });
      }

      await collaborationManager.trackPresence({
        workflowId,
        userId: principal.id,
        role: principal.role,
        name: principal.name || 'Unknown',
        isEditing: true
      });

      await broadcastCollaborators(workflowId);
      ack?.({ ok: true });
    });

    /**
     * Stop Editing Session
     */
    socket.on(ERP_CLIENT_INTENTS.WORKFLOW_EDIT_END, async (payload: { workflowId: string }, ack?: (r: RealtimeResponse) => void) => {
      const { workflowId } = payload;
      
      await collaborationManager.trackPresence({
        workflowId,
        userId: principal.id,
        role: principal.role,
        name: principal.name || 'Unknown',
        isEditing: false
      });

      await broadcastCollaborators(workflowId);
      ack?.({ ok: true });
    });

    /**
     * Administrative Lock Override
     * Allows Super Admins / Senior Managers to break a lock.
     */
    socket.on(ERP_CLIENT_INTENTS.WORKFLOW_LOCK_OVERRIDE, async (payload: { workflowId: string; reason: string }, ack?: (r: RealtimeResponse) => void) => {
      const { workflowId, reason } = payload;
      
      // 1. Permission Guard
      const isAuthorized = principal.role === 'admin' || principal.role === 'super_admin';
      if (!isAuthorized) {
        return ack?.({ ok: false, error: 'Unauthorized: Lock override requires Senior Management privileges.' });
      }

      // 2. Resolve current lock owner for auditing
      const currentEditor = await collaborationManager.getActiveEditor(workflowId);
      if (!currentEditor) {
        return ack?.({ ok: false, error: 'No active edit lock found for this workflow.' });
      }

      // 3. Forcibly Release
      await collaborationManager.removePresence(workflowId, currentEditor.userId);
      
      // 4. Audit Log
      await collaborationManager.logOverride({
        workflowId,
        actorId: principal.id,
        actorName: principal.name || 'Admin',
        reason: reason || 'Administrative Override',
        previousEditorId: currentEditor.userId,
        previousEditorName: currentEditor.name
      });

      // 5. Broadcast to everyone (including the person who just lost their lock)
      await broadcastCollaborators(workflowId);
      ack?.({ ok: true });
    });

    socket.on('disconnect', async () => {
      for (const workflowId of activeCollaborations) {
        await collaborationManager.removePresence(workflowId, principal.id);
        await broadcastCollaborators(workflowId);
      }
      activeCollaborations.clear();
    });
  });
};
