import mongoose, { Schema, Document } from 'mongoose';

export type EmployeeStatus = 'online' | 'offline' | 'idle' | 'working' | 'on_break' | 'busy' | 'in_meeting';

export interface IWorkforceStatus extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeType: 'admin' | 'manager' | 'tailor';
  currentStatus: EmployeeStatus;
  lastActiveAt: Date;
  currentTaskId?: mongoose.Types.ObjectId;
  currentTaskType?: string;
  branchId?: mongoose.Types.ObjectId;
  sessionStartTime?: Date;
  productivityScore?: number; // 0-100
  metadata?: Record<string, any>;
}

const WorkforceStatusSchema = new Schema<IWorkforceStatus>({
  employeeId: { type: Schema.Types.ObjectId, required: true, unique: true, refPath: 'employeeType' },
  employeeType: { type: String, required: true, enum: ['admin', 'manager', 'tailor'] },
  currentStatus: { 
    type: String, 
    enum: ['online', 'offline', 'idle', 'working', 'on_break', 'busy', 'in_meeting'], 
    default: 'offline' 
  },
  lastActiveAt: { type: Date, default: Date.now },
  currentTaskId: { type: Schema.Types.ObjectId },
  currentTaskType: { type: String },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  sessionStartTime: { type: Date },
  productivityScore: { type: Number, default: 0 },
  metadata: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

WorkforceStatusSchema.index({ employeeId: 1, currentStatus: 1 });
WorkforceStatusSchema.index({ lastActiveAt: -1 });
WorkforceStatusSchema.index({ branchId: 1, currentStatus: 1 });
WorkforceStatusSchema.index({ currentStatus: 1 });

export const WorkforceStatus = mongoose.model<IWorkforceStatus>('WorkforceStatus', WorkforceStatusSchema);
