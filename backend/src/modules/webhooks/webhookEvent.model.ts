import mongoose, { Schema, Document } from 'mongoose';

export interface IWebhookEvent extends Document {
  eventId: string;
  eventType: string;
  processed: boolean;
  processedAt?: Date;
  payloadHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebhookEventSchema = new Schema<IWebhookEvent>(
  {
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String, required: true },
    processed: { type: Boolean, default: false },
    processedAt: { type: Date },
    payloadHash: { type: String, required: true },
  },
  { timestamps: true }
);

// High concurrency indexes mapping exactly to idempotent lookups
WebhookEventSchema.index({ eventId: 1 });
WebhookEventSchema.index({ payloadHash: 1 });
WebhookEventSchema.index({ createdAt: -1 });

export const WebhookEvent = mongoose.model<IWebhookEvent>('WebhookEvent', WebhookEventSchema);
