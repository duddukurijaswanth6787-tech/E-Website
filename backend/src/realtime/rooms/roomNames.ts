/**
 * Deterministic room name helpers.
 *
 * IMPORTANT: clients NEVER pick room names. The server assigns rooms
 * after authenticating the principal and resolving its branchId.
 */

const sanitize = (value: string | undefined | null): string => {
  if (!value) return 'unknown';
  return String(value).trim().replace(/\s+/g, '-');
};

export const branchRoom = (branchId: string) => `branch:${sanitize(branchId)}`;

export const branchManagersRoom = (branchId: string) =>
  `branch:${sanitize(branchId)}:managers`;

export const branchWorkflowsRoom = (branchId: string) =>
  `branch:${sanitize(branchId)}:workflows`;

export const branchEscalationsRoom = (branchId: string) =>
  `branch:${sanitize(branchId)}:escalations`;

export const branchQcRoom = (branchId: string) =>
  `branch:${sanitize(branchId)}:qc`;

export const branchPresenceRoom = (branchId: string) =>
  `branch:${sanitize(branchId)}:presence`;

export const managerRoom = (managerId: string) =>
  `manager:${sanitize(managerId)}`;

export const tailorRoom = (tailorId: string) => `tailor:${sanitize(tailorId)}`;

export const notificationRoom = (userId: string) =>
  `notification:${sanitize(userId)}`;

export const workflowRoom = (workflowId: string) =>
  `workflow:${sanitize(workflowId)}`;

export const adminGlobalRoom = () => 'admin:global';

/**
 * Resolve the canonical fan-out targets for a workflow event.
 * Centralizing this prevents accidental global broadcasts.
 */
export const fanOutForWorkflow = (params: {
  branchId: string;
  workflowId: string;
  tailorId?: string | null;
  includeAdminGlobal?: boolean;
}): string[] => {
  const rooms = [
    branchWorkflowsRoom(params.branchId),
    workflowRoom(params.workflowId),
  ];
  if (params.tailorId) rooms.push(tailorRoom(params.tailorId));
  if (params.includeAdminGlobal) rooms.push(adminGlobalRoom());
  return rooms;
};
