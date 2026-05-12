import mongoose, { Schema, Document } from 'mongoose';

export enum AuditSeverity {
  INFO = 'info',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface IAuditLog extends Document {
  timestamp: Date;
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  actorEmail: string;
  actorRole: string;
  module: string;
  action: string;
  entityType: string;
  entityId?: string;
  description: string;
  previousValue?: any;
  newValue?: any;
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: string;
  browserInfo?: string;
  location?: string;
  severity: AuditSeverity;
  riskScore: number;
  status: 'success' | 'failure' | 'denied';
  sessionId?: string;
  branchId?: string;
  metadata?: Record<string, any>;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    timestamp: { type: Date, default: Date.now },
    actorId: { type: Schema.Types.ObjectId, required: true },
    actorName: { type: String, required: true },
    actorEmail: { type: String, required: true },
    actorRole: { type: String, required: true },
    module: { type: String, required: true },
    action: { type: String, required: true },
    entityType: { type: String, required: true },
    entityId: { type: String },
    description: { type: String, required: true },
    previousValue: { type: Schema.Types.Mixed },
    newValue: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
    deviceInfo: { type: String },
    browserInfo: { type: String },
    location: { type: String },
    severity: { 
      type: String, 
      enum: Object.values(AuditSeverity), 
      default: AuditSeverity.INFO
    },
    riskScore: { type: Number, default: 0 },
    status: { type: String, enum: ['success', 'failure', 'denied'], default: 'success' },
    sessionId: { type: String },
    branchId: { type: String },
    metadata: { type: Schema.Types.Mixed }
  },
  { 
    timestamps: true,
    // Enterprise logs should be persistent, but capped collection can be used for high-frequency logs.
    // For now, let's keep it as a standard collection with good indexing.
  }
);

AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ module: 1, timestamp: -1 });
AuditLogSchema.index({ severity: 1, timestamp: -1 });
AuditLogSchema.index({ actorId: 1, timestamp: -1 });
AuditLogSchema.index({ branchId: 1, timestamp: -1 });
AuditLogSchema.index({ status: 1, timestamp: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
