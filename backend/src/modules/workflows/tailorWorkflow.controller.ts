import { Request, Response } from 'express';
import { WorkflowTask } from './workflow.model';
import { updateWorkflowTaskStatus } from './workflow.service';
import { NotFoundError, BadRequestError, ConflictError } from '../../common/errors';

export const getAssignedTasks = async (req: Request, res: Response) => {
  const tailorId = req.tailor!.tailorId;
  const { status } = req.query;

  const filter: any = { tailorId };
  if (status) filter.status = status;

  // Tailors usually just see tasks grouped or sorted by deadline
  const tasks = await WorkflowTask.find(filter)
    .sort({ deadline: 1, priority: -1 })
    .select('-adminNotes') // Hide admin notes from tailor
    .populate('assignedBy', 'name');

  res.status(200).json({
    status: 'success',
    data: tasks
  });
};

export const getTaskDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tailorId = req.tailor!.tailorId;

  const task = await WorkflowTask.findOne({ _id: id, tailorId })
    .populate('assignedBy', 'name');

  if (!task) throw new NotFoundError('Task not found or not assigned to you');

  res.status(200).json({
    status: 'success',
    data: task
  });
};

export const updateStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note, expectedRevision } = req.body;
  const tailorId = req.tailor!.tailorId;

  // First verify the task belongs to this tailor
  const taskCheck = await WorkflowTask.findOne({ _id: id, tailorId });
  if (!taskCheck) throw new NotFoundError('Task not found or not assigned to you');

  if (typeof expectedRevision === 'number' && expectedRevision !== taskCheck.revision) {
    throw new ConflictError(
      `Workflow revision conflict (expected ${expectedRevision}, got ${taskCheck.revision})`,
    );
  }

  const updatedTask = await updateWorkflowTaskStatus(
    String(id),
    status,
    'Tailor',
    tailorId,
    note
  );

  res.status(200).json({
    status: 'success',
    data: updatedTask
  });
};

export const addTailorNote = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { note } = req.body;
  const tailorId = req.tailor!.tailorId;

  const task = await WorkflowTask.findOne({ _id: id, tailorId });
  if (!task) throw new NotFoundError('Task not found');

  task.tailorNotes.push({
    note,
    createdAt: new Date(),
  });

  task.revision = (task.revision || 0) + 1;
  await task.save();

  const { emitRealtimeEvent, ERP_EVENTS } = await import('../../realtime');
  emitRealtimeEvent({
    type: ERP_EVENTS.WORKFLOW_NOTE_ADDED,
    branchId: task.branchId ?? null,
    entity: { entityType: 'workflow', entityId: String(task._id) },
    actor: { actorType: 'tailor', actorId: tailorId },
    workflowRevision: task.revision,
    payload: {
      workflowId: String(task._id),
      branchId: task.branchId ?? '',
      noteType: 'tailor',
      authorId: tailorId,
      authorModel: 'Tailor',
      note,
      createdAt: new Date().toISOString(),
      revision: task.revision,
    },
  });

  res.status(200).json({
    status: 'success',
    data: task
  });
};

export const uploadAttachment = async (req: Request, res: Response) => {
  const { id } = req.params;
  const tailorId = req.tailor!.tailorId;

  const task = await WorkflowTask.findOne({ _id: id, tailorId });
  if (!task) throw new NotFoundError('Task not found');

  // Assuming a middleware like multer handles the file and puts the URL in req.body.attachmentUrl
  const { attachmentUrl } = req.body;
  if (!attachmentUrl) throw new BadRequestError('Attachment URL is required');

  task.attachments.push(attachmentUrl);
  await task.save();

  res.status(200).json({
    status: 'success',
    data: task
  });
};
