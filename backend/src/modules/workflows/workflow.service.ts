import mongoose from 'mongoose';
import { WorkflowTask, WorkflowStatus, IWorkflowTask } from './workflow.model';
import { Tailor } from '../tailors/tailor.model';
import { NotFoundError, BadRequestError } from '../../common/errors';
import { logger } from '../../common/logger';
import { emitRealtimeEvent, ERP_EVENTS } from '../../realtime';
import type { WorkflowDiffPayload, SlaViolatedPayload } from '../../realtime';

// 7. Workload tracking hooks logic
export const updateTailorWorkload = async (tailorId: mongoose.Types.ObjectId) => {
  const currentAssignedCount = await WorkflowTask.countDocuments({
    tailorId,
    status: { $nin: [WorkflowStatus.COMPLETED, WorkflowStatus.DELIVERED] },
  });

  const completedOrdersCount = await WorkflowTask.countDocuments({
    tailorId,
    status: { $in: [WorkflowStatus.COMPLETED, WorkflowStatus.DELIVERED] },
  });

  await Tailor.findByIdAndUpdate(tailorId, {
    currentAssignedCount,
    completedOrdersCount,
  });
};

const getStageTimestampField = (status: WorkflowStatus): string | null => {
  switch (status) {
    case WorkflowStatus.CUTTING: return 'cuttingStartedAt';
    case WorkflowStatus.STITCHING: return 'stitchingStartedAt';
    case WorkflowStatus.QC: return 'qcCompletedAt';
    case WorkflowStatus.COMPLETED: return 'completedAt';
    case WorkflowStatus.DELIVERED: return 'deliveredAt';
    default: return null;
  }
};

const validTransitions: Record<string, WorkflowStatus[]> = {
  [WorkflowStatus.ASSIGNED]: [WorkflowStatus.FABRIC_RECEIVED, WorkflowStatus.CUTTING],
  [WorkflowStatus.FABRIC_RECEIVED]: [WorkflowStatus.CUTTING],
  [WorkflowStatus.CUTTING]: [WorkflowStatus.STITCHING],
  [WorkflowStatus.STITCHING]: [WorkflowStatus.EMBROIDERY, WorkflowStatus.TRIAL_READY, WorkflowStatus.QC],
  [WorkflowStatus.EMBROIDERY]: [WorkflowStatus.TRIAL_READY, WorkflowStatus.QC],
  [WorkflowStatus.TRIAL_READY]: [WorkflowStatus.ALTERATION, WorkflowStatus.QC],
  [WorkflowStatus.ALTERATION]: [WorkflowStatus.TRIAL_READY, WorkflowStatus.QC],
  [WorkflowStatus.QC]: [WorkflowStatus.REWORK, WorkflowStatus.COMPLETED],
  [WorkflowStatus.REWORK]: [WorkflowStatus.STITCHING, WorkflowStatus.EMBROIDERY, WorkflowStatus.QC],
  [WorkflowStatus.COMPLETED]: [WorkflowStatus.DELIVERED],
  [WorkflowStatus.DELIVERED]: []
};

export const updateWorkflowTaskStatus = async (
  taskId: string,
  newStatus: WorkflowStatus,
  updatedByModel: 'Admin' | 'Tailor' | 'Manager',
  updatedBy: string,
  note?: string,
  expectedRevision?: number
) => {
  const task = await WorkflowTask.findById(taskId);
  if (!task) {
    throw new NotFoundError('Workflow Task not found');
  }

  // Optimistic UI Conflict Detection (Phase 5 Stabilization)
  if (expectedRevision !== undefined && task.revision !== expectedRevision) {
    logger.warn(`[WorkflowService] Revision conflict on ${task.taskNumber}. Expected ${expectedRevision}, but found ${task.revision}.`);
    // Custom error that the controller will map to 409 Conflict
    const err = new Error('Revision conflict detected. Another user has updated this workflow.');
    (err as any).statusCode = 409;
    throw err;
  }

  // Prevent duplicate status updates back-to-back
  if (task.status === newStatus) {
    throw new BadRequestError(`Task is already marked as ${newStatus}`);
  }

  // State Machine Protection
  const allowedNext = validTransitions[task.status] || [];
  if (!allowedNext.includes(newStatus)) {
    throw new BadRequestError(`Invalid state transition from ${task.status} to ${newStatus}`);
  }

  const previousStatus = task.status;
  task.status = newStatus;

  // 6. Status timeline logic
  task.statusTimeline.push({
    status: newStatus,
    note,
    updatedByModel,
    updatedBy: new mongoose.Types.ObjectId(updatedBy),
    updatedAt: new Date(),
  });

  // ERP Event Logging — eventHistory.changedByModel does not allow 'Tailor';
  // surface tailor-driven changes as 'System' for audit purposes.
  const changedByModel: 'Admin' | 'Manager' | 'System' =
    updatedByModel === 'Tailor' ? 'System' : updatedByModel;
  task.eventHistory.push({
    eventType: 'STATUS_CHANGED',
    previousState: previousStatus,
    newState: newStatus,
    reason: note,
    changedByModel,
    changedBy: new mongoose.Types.ObjectId(updatedBy),
    timestamp: new Date()
  });

  // Stage Timestamps & SLA calculation
  const timestampField = getStageTimestampField(newStatus);
  if (timestampField && !(task as any)[timestampField]) {
    (task as any)[timestampField] = new Date();
  }

  if (newStatus === WorkflowStatus.COMPLETED) {
    task.actualCompletionDate = new Date();
    if (task.expectedCompletionDate && task.actualCompletionDate > task.expectedCompletionDate) {
      task.isSlaViolated = true;
      task.delayDurationMinutes = Math.round((task.actualCompletionDate.getTime() - task.expectedCompletionDate.getTime()) / 60000);
    }
  }

  // Bump revision for every state-machine transition so optimistic clients
  // can detect conflicts and stale realtime events can be discarded.
  // We use atomic increment here.
  task.revision = (task.revision || 0) + 1;

  await task.save();

  // 10. Audit-safe logging
  logger.info(`WorkflowTask ${task.taskNumber} status updated to ${newStatus} by ${updatedByModel} (${updatedBy})`);

  // Update workload if status changed to/from completed
  if (newStatus === WorkflowStatus.COMPLETED || newStatus === WorkflowStatus.DELIVERED) {
    await updateTailorWorkload(task.tailorId);
  }

  // Emit realtime domain events from the service layer (decoupled from
  // controllers so any caller — tailor, admin, manager, future scheduler —
  // produces the same broadcasts).
  const diff: WorkflowDiffPayload = {
    workflowId: String(task._id),
    taskNumber: task.taskNumber,
    status: task.status,
    previousStatus,
    priority: task.priority,
    tailorId: task.tailorId ? String(task.tailorId) : null,
    branchId: task.branchId ?? '',
    deadline: task.deadline ? task.deadline.toISOString() : null,
    isSlaViolated: !!task.isSlaViolated,
    escalationSeverity: task.escalationSeverity,
    revision: task.revision,
    updatedAt: (task.updatedAt ?? new Date()).toISOString(),
  };

  emitRealtimeEvent({
    type: ERP_EVENTS.WORKFLOW_UPDATED,
    branchId: task.branchId ?? null,
    entity: { entityType: 'workflow', entityId: String(task._id) },
    actor: {
      actorType: updatedByModel === 'Tailor' ? 'tailor' : updatedByModel === 'Admin' ? 'admin' : 'manager',
      actorId: String(updatedBy),
    },
    workflowRevision: task.revision,
    payload: diff,
  });

  if (newStatus === WorkflowStatus.COMPLETED) {
    emitRealtimeEvent({
      type: ERP_EVENTS.WORKFLOW_COMPLETED,
      branchId: task.branchId ?? null,
      entity: { entityType: 'workflow', entityId: String(task._id) },
      actor: {
        actorType: updatedByModel === 'Tailor' ? 'tailor' : updatedByModel === 'Admin' ? 'admin' : 'manager',
        actorId: String(updatedBy),
      },
      workflowRevision: task.revision,
      payload: diff,
    });
  }

  if (newStatus === WorkflowStatus.REWORK && previousStatus === WorkflowStatus.QC) {
    emitRealtimeEvent({
      type: ERP_EVENTS.WORKFLOW_QC_REJECTED,
      branchId: task.branchId ?? null,
      entity: { entityType: 'workflow', entityId: String(task._id) },
      actor: {
        actorType: updatedByModel === 'Tailor' ? 'tailor' : updatedByModel === 'Admin' ? 'admin' : 'manager',
        actorId: String(updatedBy),
      },
      workflowRevision: task.revision,
      payload: diff,
    });
  }

  if (task.isSlaViolated) {
    const slaPayload: SlaViolatedPayload = {
      ...diff,
      delayMinutes: task.delayDurationMinutes || 0,
    };
    emitRealtimeEvent({
      type: ERP_EVENTS.SLA_VIOLATED,
      branchId: task.branchId ?? null,
      entity: { entityType: 'workflow', entityId: String(task._id) },
      actor: { actorType: 'system', actorId: null },
      workflowRevision: task.revision,
      payload: slaPayload,
    });
  }

  return task;
};

// Generate Task Number
export const generateTaskNumber = async (): Promise<string> => {
  const currentYear = new Date().getFullYear();
  const lastTask = await WorkflowTask.findOne({ taskNumber: new RegExp(`^WT-${currentYear}-`) })
    .sort({ createdAt: -1 });

  if (!lastTask) {
    return `WT-${currentYear}-0001`;
  }

  const lastSeq = parseInt(lastTask.taskNumber.split('-')[2]);
  const nextSeq = (lastSeq + 1).toString().padStart(4, '0');
  return `WT-${currentYear}-${nextSeq}`;
};
