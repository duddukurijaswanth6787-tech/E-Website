import mongoose, { Schema, Document } from 'mongoose';

export interface ISupportTicket extends Document {
  user?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  mobile?: string;
  subject: string;
  message: string;
  status: string;
  adminNotes?: string;
  assignedTo?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    mobile: { type: String },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    adminNotes: { type: String },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'Admin' },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

SupportTicketSchema.index({ status: 1 });
SupportTicketSchema.index({ email: 1 });

export const SupportTicket = mongoose.model<ISupportTicket>('SupportTicket', SupportTicketSchema);
