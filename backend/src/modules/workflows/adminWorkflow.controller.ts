import { Request, Response } from 'express';
import { WorkflowTask, WorkflowStatus, IWorkflowTask } from './workflow.model';
import { generateTaskNumber, updateWorkflowTaskStatus, updateTailorWorkload } from './workflow.service';
import { Tailor } from '../tailors/tailor.model';
import { NotFoundError, BadRequestError, ConflictError, ForbiddenError } from '../../common/errors';
import { emitRealtimeEvent, ERP_EVENTS } from '../../realtime';
import type {
  WorkflowAssignedPayload,
  WorkflowDiffPayload,
  WorkflowEscalatedPayload,
  WorkflowReassignedPayload,
  WorkflowNoteAddedPayload,
} from '../../realtime';

/** Build a Kanban-friendly diff payload from a freshly mutated task doc. */
const buildDiffPayload = (task: IWorkflowTask, previousStatus?: string): WorkflowDiffPayload => ({
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
});

const buildAssignedPayload = (task: IWorkflowTask): WorkflowAssignedPayload => ({
  ...buildDiffPayload(task),
  taskDescription: task.taskDescription,
});

/** Branch authorization helper for managers — admins skip this. */
const enforceBranchAccess = (req: Request, task: IWorkflowTask): void => {
  if (req.admin) return;
  if (!req.manager?.branchId) return; // legacy tokens without branchId pass-through
  if (task.branchId && task.branchId !== req.manager.branchId) {
    throw new ForbiddenError('Workflow belongs to a different branch');
  }
};

const actorFromReq = (req: Request) => ({
  actorType: (req.admin ? 'admin' : 'manager') as 'admin' | 'manager',
  actorId: req.admin?.adminId || req.manager?.managerId || null,
});

export const createWorkflowTask = async (req: Request, res: Response) => {
  // adminId might be an admin or a manager
  const assignedById = req.admin?.adminId || req.manager?.managerId;
  const assignedByModel = req.admin ? 'Admin' : 'Manager';
  const taskData = req.body;

  // Workload Enforcement & Override
  const tailor = await Tailor.findById(taskData.tailorId);
  if (!tailor || !tailor.isActive) {
    throw new BadRequestError('Invalid or inactive Tailor selected');
  }

  const override = req.body.override === true;
  if (!override && tailor.currentAssignedCount >= (tailor.dailyCapacity || 5)) {
    throw new BadRequestError(`Tailor is overloaded (Capacity: ${tailor.dailyCapacity || 5}). Use override=true if you are a SENIOR_MANAGER.`);
  }

  // If override used, require reason
  if (override && !req.body.overrideReason) {
    throw new BadRequestError('overrideReason is required when bypassing tailor capacity limits.');
  }

  const taskNumber = await generateTaskNumber();

  const task = await WorkflowTask.create({
    ...taskData,
    taskNumber,
    assignedBy: assignedById,
    assignedByModel,
    // Denormalize branch scope from the assigned tailor so realtime broadcasts
    // and downstream queries don't need a join.
    branchId: tailor.branchId ?? null,
    branchName: tailor.branchName ?? null,
    revision: 1,
    statusTimeline: [{
      status: WorkflowStatus.ASSIGNED,
      note: 'Task initially assigned',
      updatedByModel: assignedByModel,
      updatedBy: assignedById,
    }],
    eventHistory: [{
      eventType: 'ASSIGNED',
      newState: WorkflowStatus.ASSIGNED,
      reason: override ? `OVERRIDE: ${req.body.overrideReason}` : 'Initial assignment',
      changedByModel: assignedByModel,
      changedBy: assignedById,
      timestamp: new Date()
    }]
  });

  // Update workload
  await updateTailorWorkload(task.tailorId);

  // Realtime broadcast: new workflow assigned
  emitRealtimeEvent({
    type: ERP_EVENTS.WORKFLOW_ASSIGNED,
    branchId: task.branchId ?? null,
    entity: { entityType: 'workflow', entityId: String(task._id) },
    actor: {
      actorType: req.admin ? 'admin' : 'manager',
      actorId: assignedById ? String(assignedById) : null,
    },
    workflowRevision: task.revision,
    payload: buildAssignedPayload(task),
  });

  res.status(201).json({
    status: 'success',
    data: task
  });
};

export const getWorkflows = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  const { tailorId, status, priority } = req.query;

  const filter: any = {};
  if (tailorId) filter.tailorId = tailorId;
  if (status) filter.status = status;
  if (priority) filter.priority = priority;

  // Branch scoping: managers only see their branch. Admins see all unless
  // they explicitly belong to a branch (then they see that branch + global
  // null-branch tasks).
  if (req.manager?.branchId) {
    filter.branchId = req.manager.branchId;
  }

  const tasks = await WorkflowTask.find(filter)
    .sort({ deadline: 1, priority: -1 })
    .skip(skip)
    .limit(limit)
    .populate('tailorId', 'name tailorCode profileImage branchId')
    .populate('assignedBy', 'name');

  const total = await WorkflowTask.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    data: {
      tasks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    },
  });
};

export const getWorkflowById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const task = await WorkflowTask.findById(id)
    .populate('tailorId', 'name tailorCode profileImage branchId')
    .populate('assignedBy', 'name')
    .populate('statusTimeline.updatedBy', 'name email')
    .populate('adminNotes.adminId', 'name');

  if (!task) throw new NotFoundError('Task not found');
  enforceBranchAccess(req, task);

  res.status(200).json({
    status: 'success',
    data: task
  });
};

export const reassignTailor = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { tailorId, reason, override, overrideReason, expectedRevision } = req.body;
  const assignedById = req.admin?.adminId || req.manager?.managerId;
  const assignedByModel = req.admin ? 'Admin' : 'Manager';

  const task = await WorkflowTask.findById(id);
  if (!task) throw new NotFoundError('Task not found');
  enforceBranchAccess(req, task);

  if (typeof expectedRevision === 'number' && expectedRevision !== task.revision) {
    throw new ConflictError(
      `Workflow revision conflict (expected ${expectedRevision}, got ${task.revision})`,
    );
  }

  if (!reason) throw new BadRequestError('Reassignment reason is mandatory for audit tracking.');

  const oldTailorId = task.tailorId;

  if (oldTailorId.toString() === tailorId) {
    throw new BadRequestError('Task is already assigned to this Tailor');
  }

  const newTailor = await Tailor.findById(tailorId);
  if (!newTailor || !newTailor.isActive) {
    throw new BadRequestError('Invalid or inactive Tailor selected');
  }

  if (!override && newTailor.currentAssignedCount >= ((newTailor as any).dailyCapacity || 5)) {
    throw new BadRequestError(`Target Tailor is overloaded. Use override=true if you are a SENIOR_MANAGER.`);
  }
  if (override && !overrideReason) {
    throw new BadRequestError('overrideReason is required when bypassing tailor capacity limits.');
  }

  task.tailorId = tailorId;
  // Re-denormalize branch from new tailor (could move across branches)
  task.branchId = newTailor.branchId ?? task.branchId ?? null;
  task.branchName = newTailor.branchName ?? task.branchName ?? null;
  task.revision = (task.revision || 0) + 1;

  task.statusTimeline.push({
    status: task.status,
    note: `Reassigned to new Tailor. Reason: ${reason}`,
    updatedByModel: assignedByModel,
    updatedBy: assignedById,
    updatedAt: new Date(),
  } as any);

  task.eventHistory.push({
    eventType: 'REASSIGNED',
    previousState: oldTailorId.toString(),
    newState: tailorId,
    reason: override ? `${reason} (OVERRIDE: ${overrideReason})` : reason,
    changedByModel: assignedByModel,
    changedBy: assignedById ? new (require('mongoose').Types.ObjectId)(String(assignedById)) : undefined,
    timestamp: new Date()
  });

  await task.save();

  // Update workloads for both tailors
  await updateTailorWorkload(oldTailorId);
  await updateTailorWorkload(task.tailorId);

  const reassignedPayload: WorkflowReassignedPayload = {
    ...buildDiffPayload(task),
    previousTailorId: oldTailorId ? String(oldTailorId) : null,
    reason,
  };
  emitRealtimeEvent({
    type: ERP_EVENTS.WORKFLOW_REASSIGNED,
    branchId: task.branchId ?? null,
    entity: { entityType: 'workflow', entityId: String(task._id) },
    actor: actorFromReq(req),
    workflowRevision: task.revision,
    payload: reassignedPayload,
  });

  res.status(200).json({
    status: 'success',
    data: task
  });
};

export const updateDeadline = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { deadline, priority, expectedRevision } = req.body;

  const task = await WorkflowTask.findById(id);
  if (!task) throw new NotFoundError('Task not found');
  enforceBranchAccess(req, task);

  if (typeof expectedRevision === 'number' && expectedRevision !== task.revision) {
    throw new ConflictError(
      `Workflow revision conflict (expected ${expectedRevision}, got ${task.revision})`,
    );
  }

  const previousPriority = task.priority;
  if (deadline) task.deadline = new Date(deadline);
  if (priority) task.priority = priority;
  task.revision = (task.revision || 0) + 1;
  await task.save();

  if (priority && priority !== previousPriority) {
    emitRealtimeEvent({
      type: ERP_EVENTS.WORKFLOW_PRIORITY_CHANGED,
      branchId: task.branchId ?? null,
      entity: { entityType: 'workflow', entityId: String(task._id) },
      actor: actorFromReq(req),
      workflowRevision: task.revision,
      payload: buildDiffPayload(task),
    });
  }
  if (deadline) {
    emitRealtimeEvent({
      type: ERP_EVENTS.WORKFLOW_DEADLINE_CHANGED,
      branchId: task.branchId ?? null,
      entity: { entityType: 'workflow', entityId: String(task._id) },
      actor: actorFromReq(req),
      workflowRevision: task.revision,
      payload: buildDiffPayload(task),
    });
  }

  res.status(200).json({
    status: 'success',
    data: task
  });
};

export const escalateWorkflow = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { escalationFlags, escalationSeverity, reason, expectedRevision } = req.body;
  const changedById = req.admin?.adminId || req.manager?.managerId;
  const changedByModel = req.admin ? 'Admin' : 'Manager';

  const task = await WorkflowTask.findById(id);
  if (!task) throw new NotFoundError('Task not found');
  enforceBranchAccess(req, task);

  if (typeof expectedRevision === 'number' && expectedRevision !== task.revision) {
    throw new ConflictError(
      `Workflow revision conflict (expected ${expectedRevision}, got ${task.revision})`,
    );
  }

  const previousSeverity = task.escalationSeverity;
  
  if (escalationFlags) task.escalationFlags = escalationFlags;
  if (escalationSeverity) task.escalationSeverity = escalationSeverity;
  task.revision = (task.revision || 0) + 1;

  task.eventHistory.push({
    eventType: 'ESCALATED',
    previousState: previousSeverity,
    newState: escalationSeverity || previousSeverity,
    reason: reason || 'Manual Escalation',
    changedByModel,
    changedBy: changedById ? new (require('mongoose').Types.ObjectId)(String(changedById)) : undefined,
    timestamp: new Date()
  });

  await task.save();

  const escalatedPayload: WorkflowEscalatedPayload = {
    ...buildDiffPayload(task),
    previousSeverity,
    reason,
    escalationFlags: task.escalationFlags as unknown as string[],
  };
  emitRealtimeEvent({
    type: ERP_EVENTS.WORKFLOW_ESCALATED,
    branchId: task.branchId ?? null,
    entity: { entityType: 'workflow', entityId: String(task._id) },
    actor: actorFromReq(req),
    workflowRevision: task.revision,
    payload: escalatedPayload,
  });

  res.status(200).json({
    status: 'success',
    data: task
  });
};

export const addAdminNote = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { note } = req.body;
  const adminId = req.admin?.adminId || req.manager?.managerId;
  const adminModel = req.admin ? 'Admin' : 'Manager';

  const task = await WorkflowTask.findById(id);
  if (!task) throw new NotFoundError('Task not found');
  enforceBranchAccess(req, task);

  task.adminNotes.push({
    note,
    adminId: adminId ? new (require('mongoose').Types.ObjectId)(String(adminId)) : undefined,
    adminModel,
    createdAt: new Date(),
  });
  task.revision = (task.revision || 0) + 1;
  await task.save();

  const notePayload: WorkflowNoteAddedPayload = {
    workflowId: String(task._id),
    branchId: task.branchId ?? '',
    noteType: 'admin',
    authorId: adminId ? String(adminId) : '',
    authorModel: adminModel,
    note,
    createdAt: new Date().toISOString(),
    revision: task.revision,
  };
  emitRealtimeEvent({
    type: ERP_EVENTS.WORKFLOW_NOTE_ADDED,
    branchId: task.branchId ?? null,
    entity: { entityType: 'workflow', entityId: String(task._id) },
    actor: actorFromReq(req),
    workflowRevision: task.revision,
    payload: notePayload,
  });

  res.status(200).json({
    status: 'success',
    data: task
  });
};

export const addQcNote = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { note } = req.body;
  const qcManagerId = req.admin?.adminId || req.manager?.managerId; // QC notes can be by admin or manager

  const task = await WorkflowTask.findById(id);
  if (!task) throw new NotFoundError('Task not found');
  enforceBranchAccess(req, task);

  task.qcNotes.push({
    note,
    qcManagerId: qcManagerId ? new (require('mongoose').Types.ObjectId)(String(qcManagerId)) : undefined,
    createdAt: new Date(),
  });
  task.revision = (task.revision || 0) + 1;
  await task.save();

  const notePayload: WorkflowNoteAddedPayload = {
    workflowId: String(task._id),
    branchId: task.branchId ?? '',
    noteType: 'qc',
    authorId: qcManagerId ? String(qcManagerId) : '',
    authorModel: req.admin ? 'Admin' : 'Manager',
    note,
    createdAt: new Date().toISOString(),
    revision: task.revision,
  };
  emitRealtimeEvent({
    type: ERP_EVENTS.WORKFLOW_NOTE_ADDED,
    branchId: task.branchId ?? null,
    entity: { entityType: 'workflow', entityId: String(task._id) },
    actor: actorFromReq(req),
    workflowRevision: task.revision,
    payload: notePayload,
  });

  res.status(200).json({
    status: 'success',
    data: task
  });
};

/**
 * Admin/Manager status update.
 * Mirrors the tailor route but with admin/manager auth + branch checks.
 *
 * The frontend (`Frontend/src/api/services/adminWorkflow.service.ts`) was
 * already calling this URL but the route was missing — implement it here.
 */
export const updateWorkflowStatusAsAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note, expectedRevision } = req.body;
  const actorId = req.admin?.adminId || req.manager?.managerId;
  const actorModel: 'Admin' | 'Manager' = req.admin ? 'Admin' : 'Manager';

  if (!actorId) throw new BadRequestError('Authenticated principal required');

  // Pre-flight branch check (the service mutates separately).
  const existing = await WorkflowTask.findById(id);
  if (!existing) throw new NotFoundError('Task not found');
  enforceBranchAccess(req, existing);

  if (typeof expectedRevision === 'number' && expectedRevision !== existing.revision) {
    throw new ConflictError(
      `Workflow revision conflict (expected ${expectedRevision}, got ${existing.revision})`,
    );
  }

  // updateWorkflowTaskStatus internally emits WORKFLOW_UPDATED (and any
  // specialized events like WORKFLOW_COMPLETED / WORKFLOW_QC_REJECTED /
  // SLA_VIOLATED). We do NOT re-emit here to avoid duplicate broadcasts.
  const updated = await updateWorkflowTaskStatus(String(id), status, actorModel, String(actorId), note);

  res.status(200).json({
    status: 'success',
    data: updated,
  });
};
