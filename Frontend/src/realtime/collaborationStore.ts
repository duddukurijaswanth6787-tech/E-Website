import { create } from 'zustand';

export interface WorkflowCollaborator {
  userId: string;
  role: string;
  name: string;
  isEditing: boolean;
  lastSeen: number;
}

interface CollaborationState {
  // workflowId -> collaborators
  occupancy: Record<string, WorkflowCollaborator[]>;
  // Workflows current user is actively editing
  editingWorkflows: Set<string>;
  
  setOccupancy: (workflowId: string, collaborators: WorkflowCollaborator[]) => void;
  removeWorkflowOccupancy: (workflowId: string) => void;
  
  setEditing: (workflowId: string, isEditing: boolean) => void;
  isSomeoneElseEditing: (workflowId: string, myUserId: string) => WorkflowCollaborator | null;
}

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  occupancy: {},
  editingWorkflows: new Set(),

  setOccupancy: (workflowId, collaborators) => set((state) => ({
    occupancy: { ...state.occupancy, [workflowId]: collaborators }
  })),

  removeWorkflowOccupancy: (workflowId) => set((state) => {
    const newOccupancy = { ...state.occupancy };
    delete newOccupancy[workflowId];
    return { occupancy: newOccupancy };
  }),

  setEditing: (workflowId, isEditing) => set((state) => {
    const newEditing = new Set(state.editingWorkflows);
    if (isEditing) newEditing.add(workflowId);
    else newEditing.delete(workflowId);
    return { editingWorkflows: newEditing };
  }),

  isSomeoneElseEditing: (workflowId, myUserId) => {
    const collaborators = get().occupancy[workflowId] || [];
    return collaborators.find(c => c.isEditing && c.userId !== myUserId) || null;
  }
}));
