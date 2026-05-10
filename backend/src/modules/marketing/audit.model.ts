import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  tenantId: string;
  adminId: Schema.Types.ObjectId;
  action: string;
  resource: string;
  payload?: any;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  tenantId: { type: String, required: true, index: true },
  adminId: { type: Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
  action: { type: String, required: true, index: true },
  resource: { type: String, required: true },
  payload: Schema.Types.Mixed,
  ipAddress: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// Auto-expire logs after 1 year for retention compliance
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 31536000 });

export const MarketingAuditLog = model<IAuditLog>('MarketingAuditLog', AuditLogSchema);
