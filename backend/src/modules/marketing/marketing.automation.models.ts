import { Schema, model, Document } from 'mongoose';

// --- M-15: Notification & Campaign Delivery ---

export interface INotificationTemplate extends Document {
  tenantId: string;
  name: string;
  channel: 'email' | 'whatsapp' | 'sms' | 'push' | 'in-app';
  subject?: string;
  content: string; // Template string with placeholders
  metadata?: Record<string, any>;
}

const NotificationTemplateSchema = new Schema<INotificationTemplate>({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  channel: { type: String, enum: ['email', 'whatsapp', 'sms', 'push', 'in-app'], required: true },
  subject: String,
  content: { type: String, required: true },
  metadata: { type: Map, of: Schema.Types.Mixed }
}, { timestamps: true });

export interface INotificationCampaign extends Document {
  tenantId: string;
  name: string;
  template: Schema.Types.ObjectId;
  targetSegments: string[]; // e.g., ['loyal_customers', 'inactive_30d']
  scheduledAt?: Date;
  status: 'draft' | 'scheduled' | 'sending' | 'completed' | 'failed';
  analytics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    converted: number;
  };
}

const NotificationCampaignSchema = new Schema<INotificationCampaign>({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  template: { type: Schema.Types.ObjectId, ref: 'NotificationTemplate', required: true },
  targetSegments: [{ type: String }],
  scheduledAt: Date,
  status: { type: String, enum: ['draft', 'scheduled', 'sending', 'completed', 'failed'], default: 'draft' },
  analytics: {
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    converted: { type: Number, default: 0 }
  }
}, { timestamps: true });

NotificationCampaignSchema.index({ tenantId: 1, status: 1 });

// --- M-16: AI Marketing Automation ---

export interface IAIPrediction extends Document {
  tenantId: string;
  customer: Schema.Types.ObjectId;
  type: 'churn' | 'conversion' | 'ltv' | 'recommendation';
  score: number; // 0 to 1
  insights: string[];
  lastCalculated: Date;
}

const AIPredictionSchema = new Schema<IAIPrediction>({
  tenantId: { type: String, required: true, index: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['churn', 'conversion', 'ltv', 'recommendation'], required: true },
  score: { type: Number, required: true },
  insights: [{ type: String }],
  lastCalculated: { type: Date, default: Date.now }
});

AIPredictionSchema.index({ tenantId: 1, customer: 1, type: 1 });

export interface IAutomationRule extends Document {
  tenantId: string;
  name: string;
  trigger: 'event' | 'behavior' | 'prediction';
  condition: Record<string, any>;
  action: {
    type: 'send_notification' | 'apply_coupon' | 'segment_user';
    templateId?: Schema.Types.ObjectId;
    couponId?: Schema.Types.ObjectId;
  };
  isActive: boolean;
}

const AutomationRuleSchema = new Schema<IAutomationRule>({
  tenantId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  trigger: { type: String, enum: ['event', 'behavior', 'prediction'], required: true },
  condition: { type: Map, of: Schema.Types.Mixed },
  action: {
    type: { type: String, enum: ['send_notification', 'apply_coupon', 'segment_user'], required: true },
    templateId: { type: Schema.Types.ObjectId, ref: 'NotificationTemplate' },
    couponId: { type: Schema.Types.ObjectId, ref: 'Coupon' }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

AutomationRuleSchema.index({ tenantId: 1, isActive: 1 });

export const NotificationTemplate = model<INotificationTemplate>('NotificationTemplate', NotificationTemplateSchema);
export const NotificationCampaign = model<INotificationCampaign>('NotificationCampaign', NotificationCampaignSchema);
export const AIPrediction = model<IAIPrediction>('AIPrediction', AIPredictionSchema);
export const AutomationRule = model<IAutomationRule>('AutomationRule', AutomationRuleSchema);

