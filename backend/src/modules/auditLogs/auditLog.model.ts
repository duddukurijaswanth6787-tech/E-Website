import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  admin: mongoose.Types.ObjectId;
  adminEmail: string;
  action: string;
  module: string;
  targetId?: string;
  description: string;
  changes?: {
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
  };
  ip?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    admin: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    adminEmail: { type: String, required: true },
    action: { type: String, required: true },
    module: { type: String, required: true },
    targetId: { type: String },
    description: { type: String, required: true },
    changes: {
      before: { type: Schema.Types.Mixed },
      after: { type: Schema.Types.Mixed },
    },
    ip: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true, capped: { size: 50 * 1024 * 1024 } }, // 50MB cap
);

AuditLogSchema.index({ admin: 1 });
AuditLogSchema.index({ module: 1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
