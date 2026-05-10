import { Schema, model, Document, Types } from 'mongoose';
import { NOTIFICATION_PRIORITIES, NOTIFICATION_TYPES } from '../../realtime/events/erpEvents';

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  recipientRole: 'admin' | 'manager' | 'tailor';
  branchId: Types.ObjectId | null;
  
  type: string;
  priority: string;
  title: string;
  message: string;
  
  isRead: boolean;
  readAt: Date | null;
  
  metadata: Record<string, any>;
  link?: string;
  
  channels: ('socket' | 'email' | 'push')[];
  deliveredAt: {
    socket?: Date;
    email?: Date;
    push?: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, required: true, refPath: 'recipientRoleModel' },
    recipientRole: { type: String, required: true, enum: ['admin', 'manager', 'tailor'] },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', default: null },
    
    type: { 
      type: String, 
      required: true, 
      enum: Object.values(NOTIFICATION_TYPES) 
    },
    priority: { 
      type: String, 
      required: true, 
      enum: Object.values(NOTIFICATION_PRIORITIES),
      default: NOTIFICATION_PRIORITIES.NORMAL 
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    
    metadata: { type: Schema.Types.Mixed, default: {} },
    link: { type: String },
    
    channels: [{ type: String, enum: ['socket', 'email', 'push'], default: ['socket'] }],
    deliveredAt: {
      socket: { type: Date },
      email: { type: Date },
      push: { type: Date },
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for dynamic ref mapping
NotificationSchema.virtual('recipientRoleModel').get(function() {
  switch(this.recipientRole) {
    case 'admin': return 'Admin';
    case 'manager': return 'Manager';
    case 'tailor': return 'Tailor';
    default: return 'Admin';
  }
});

// Indexes for fast retrieval
NotificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ branchId: 1, createdAt: -1 });

export const Notification = model<INotification>('Notification', NotificationSchema);
