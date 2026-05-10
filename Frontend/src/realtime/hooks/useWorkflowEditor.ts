export const useWorkflowEditor = (_workflowId: string) => ({ isEditing: false, activeEditor: null, startEditing: async () => true, stopEditing: () => {}, canEdit: true });
