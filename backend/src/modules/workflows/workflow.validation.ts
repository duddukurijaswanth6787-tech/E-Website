import { z } from 'zod';
import { WorkflowStatus, TaskPriority, EscalationFlag } from './workflow.model';

export const createWorkflowTaskSchema = z.object({
  body: z.object({
    tailorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Tailor ID'),
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Order ID').optional(),
    customBlouseId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Custom Blouse ID').optional(),
    taskDescription: z.string().min(3, 'Task description is required'),
    measurementsSnapshot: z.any().optional(),
    referenceImages: z.array(z.string()).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
    estimatedHours: z.number().min(0).optional(),
  }).refine((data) => data.orderId || data.customBlouseId, {
    message: "Either orderId or customBlouseId must be provided"
  }),
});

export const updateWorkflowStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(WorkflowStatus),
    note: z.string().optional(),
    /** Optional optimistic-concurrency token; when present must match server. */
    expectedRevision: z.number().int().nonnegative().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Task ID'),
  }),
});

export const addNoteSchema = z.object({
  body: z.object({
    note: z.string().min(1, 'Note cannot be empty'),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Task ID'),
  }),
});

export const reassignTailorSchema = z.object({
  body: z.object({
    tailorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Tailor ID'),
    reason: z.string().min(3, 'Reassignment reason is required'),
    override: z.boolean().optional(),
    overrideReason: z.string().optional(),
    expectedRevision: z.number().int().nonnegative().optional(),
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Task ID'),
  }),
});

export const updateDeadlineSchema = z.object({
  body: z.object({
    deadline: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
    expectedRevision: z.number().int().nonnegative().optional(),
  }).refine((data) => data.deadline || data.priority, {
    message: "Either deadline or priority must be provided"
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Task ID'),
  }),
});

export const updateEscalationSchema = z.object({
  body: z.object({
    escalationFlags: z.array(z.nativeEnum(EscalationFlag)).optional(),
    escalationSeverity: z.string().optional(),
    reason: z.string().optional(),
    expectedRevision: z.number().int().nonnegative().optional(),
  }).refine((data) => data.escalationFlags || data.escalationSeverity, {
    message: 'Either escalationFlags or escalationSeverity must be provided',
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Task ID'),
  }),
});

export const getWorkflowsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10),
    tailorId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Tailor ID').optional(),
    status: z.nativeEnum(WorkflowStatus).optional(),
    priority: z.nativeEnum(TaskPriority).optional(),
  }),
});
