import mongoose, { Schema, Document } from 'mongoose';

export enum WorkflowStatus {
  ASSIGNED = 'Assigned',
  FABRIC_RECEIVED = 'Fabric Received',
  CUTTING = 'Cutting',
  STITCHING = 'Stitching',
  EMBROIDERY = 'Embroidery',
  TRIAL_READY = 'Trial Ready',
  ALTERATION = 'Alteration',
  QC = 'QC',
  REWORK = 'Rework',
  COMPLETED = 'Completed',
  DELIVERED = 'Delivered'
}

export enum TaskPriority {
  LOW = 'Low',
  NORMAL = 'Normal',
  HIGH = 'High',
  URGENT = 'Urgent',
  CRITICAL = 'Critical'
}

export enum EscalationSeverity {
  NORMAL = 'Normal',
  WARNING = 'Warning',
  HIGH_RISK = 'High Risk',
  BLOCKED = 'Blocked',
  CUSTOMER_DELAYED = 'Customer Delayed'
}

export enum EscalationFlag {
  DELAYED = 'Delayed',
  URGENT = 'Urgent',
  CUSTOMER_WAITING = 'Customer Waiting',
  REWORK_REQUIRED = 'Rework Required',
  FABRIC_MISSING = 'Fabric Missing',
  TAILOR_ABSENT = 'Tailor Absent',
  MEASUREMENT_ISSUE = 'Measurement Issue'
}

export interface IWorkflowTask extends Document {
  taskNumber: string; // e.g., WT-1001
  
  // Relations
  tailorId: mongoose.Types.ObjectId;
  orderId?: mongoose.Types.ObjectId; 
  customBlouseId?: mongoose.Types.ObjectId; 
  
  // Task Details
  taskDescription: string;
  measurementsSnapshot: any;
  referenceImages: string[];
  attachments: string[];
  dependencies: string[]; // e.g. ["Embroidery", "Dyeing"]
  
  // Workflow & Deadlines
  status: WorkflowStatus;
  priority: TaskPriority;
  escalationSeverity: EscalationSeverity;
  escalationFlags: EscalationFlag[];
  
  // SLA & Timeline
  deadline: Date; // Final deadline
  expectedCompletionDate: Date; // SLA expected
  actualCompletionDate?: Date;
  delayDurationMinutes: number;
  isSlaViolated: boolean;
  estimatedHours?: number;
  
  // Stage Timestamps
  cuttingStartedAt?: Date;
  stitchingStartedAt?: Date;
  qcCompletedAt?: Date;
  deliveredAt?: Date;
  completedAt?: Date;
  
  // Timelines & Audit
  statusTimeline: {
    status: WorkflowStatus;
    note?: string;
    updatedByModel: 'Admin' | 'Tailor' | 'Manager';
    updatedBy: mongoose.Types.ObjectId;
    updatedAt: Date;
  }[];

  // Immutable Event Timeline (ERP History)
  eventHistory: {
    eventType: 'STATUS_CHANGED' | 'PRIORITY_CHANGED' | 'DEADLINE_UPDATED' | 'ESCALATED' | 'REASSIGNED' | 'QC_REJECTED' | 'ASSIGNED' | 'BLOCKED';
    previousState?: string;
    newState?: string;
    reason?: string;
    changedByModel: 'Admin' | 'Manager' | 'System';
    changedBy?: mongoose.Types.ObjectId;
    timestamp: Date;
  }[];
  
  tailorNotes: {
    note: string;
    createdAt: Date;
  }[];
  
  adminNotes: {
    note: string;
    adminId: mongoose.Types.ObjectId;
    adminModel: 'Admin' | 'Manager';
    createdAt: Date;
  }[];
  
  qcNotes: {
    note: string;
    qcManagerId: mongoose.Types.ObjectId;
    createdAt: Date;
  }[];

  assignedBy: mongoose.Types.ObjectId;
  assignedByModel: 'Admin' | 'Manager';

  // Branch scoping for RBAC + realtime room isolation. Denormalized from
  // the assigned tailor on create/reassign so we don't need a join at
  // broadcast time.
  branchId?: string | null;
  branchName?: string | null;

  /**
   * Monotonic revision counter — incremented on every meaningful mutation.
   * Used by clients for optimistic-UI conflict detection (HTTP 409) and
   * by realtime listeners to reject stale events.
   */
  revision: number;

  createdAt: Date;
  updatedAt: Date;
}

const WorkflowTaskSchema = new Schema<IWorkflowTask>({
  taskNumber: { type: String, required: true, unique: true },
  
  tailorId: { type: Schema.Types.ObjectId, ref: 'Tailor', required: true },
  orderId: { type: Schema.Types.ObjectId, ref: 'Order' },
  customBlouseId: { type: Schema.Types.ObjectId, ref: 'CustomBlouse' },
  
  taskDescription: { type: String, required: true },
  measurementsSnapshot: { type: Schema.Types.Mixed },
  referenceImages: [{ type: String }],
  attachments: [{ type: String }],
  dependencies: [{ type: String }],
  
  status: { type: String, enum: Object.values(WorkflowStatus), default: WorkflowStatus.ASSIGNED },
  priority: { type: String, enum: Object.values(TaskPriority), default: TaskPriority.NORMAL },
  escalationSeverity: { type: String, enum: Object.values(EscalationSeverity), default: EscalationSeverity.NORMAL },
  escalationFlags: [{ type: String, enum: Object.values(EscalationFlag) }],
  
  deadline: { type: Date, required: true },
  expectedCompletionDate: { type: Date, required: true },
  actualCompletionDate: { type: Date },
  delayDurationMinutes: { type: Number, default: 0 },
  isSlaViolated: { type: Boolean, default: false },
  estimatedHours: { type: Number },
  
  cuttingStartedAt: { type: Date },
  stitchingStartedAt: { type: Date },
  qcCompletedAt: { type: Date },
  deliveredAt: { type: Date },
  completedAt: { type: Date },
  
  statusTimeline: [{
    status: { type: String, enum: Object.values(WorkflowStatus), required: true },
    note: { type: String },
    updatedByModel: { type: String, enum: ['Admin', 'Tailor', 'Manager'], required: true },
    updatedBy: { type: Schema.Types.ObjectId, required: true },
    updatedAt: { type: Date, default: Date.now }
  }],

  eventHistory: [{
    eventType: { type: String, required: true },
    previousState: { type: String },
    newState: { type: String },
    reason: { type: String },
    changedByModel: { type: String, enum: ['Admin', 'Manager', 'System'], required: true },
    changedBy: { type: Schema.Types.ObjectId },
    timestamp: { type: Date, default: Date.now }
  }],
  
  tailorNotes: [{
    note: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  
  adminNotes: [{
    note: { type: String, required: true },
    adminId: { type: Schema.Types.ObjectId, required: true, refPath: 'adminNotes.adminModel' },
    adminModel: { type: String, enum: ['Admin', 'Manager'], required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  
  qcNotes: [{
    note: { type: String, required: true },
    qcManagerId: { type: Schema.Types.ObjectId, ref: 'Manager', required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  
  assignedBy: { type: Schema.Types.ObjectId, required: true, refPath: 'assignedByModel' },
  assignedByModel: { type: String, enum: ['Admin', 'Manager'], required: true },

  branchId: { type: String, default: null },
  branchName: { type: String, default: null },

  revision: { type: Number, default: 0, required: true },
}, {
  timestamps: true
});

WorkflowTaskSchema.index({ tailorId: 1, status: 1 });
WorkflowTaskSchema.index({ deadline: 1 });
WorkflowTaskSchema.index({ branchId: 1, status: 1 });

export const WorkflowTask = mongoose.model<IWorkflowTask>('WorkflowTask', WorkflowTaskSchema);
