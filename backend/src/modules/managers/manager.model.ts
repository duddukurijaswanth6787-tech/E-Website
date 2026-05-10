import mongoose, { Document, Schema } from 'mongoose';
import { MANAGER_PERMISSIONS, MANAGER_TYPES } from './manager.constants';

export interface IManager extends Document {
  managerCode: string;
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  managerType: string;
  department: string;
  permissions: string[];
  
  // Scoping & Multi-branch
  assignedTailors: mongoose.Types.ObjectId[];
  branchId?: string;
  branchName?: string;

  // Workload Analytics
  activeAssignmentsCount: number;
  completedAssignmentsCount: number;
  delayedAssignmentsCount: number;

  // Dashboard Preferences
  dashboardPreferences: {
    theme?: string;
    defaultView?: string;
  };
  favoriteFilters: string[];
  savedViews: any[];
  
  // Notification Preferences
  notificationPreferences: {
    emailAlerts: boolean;
    whatsappAlerts: boolean;
    pushNotifications: boolean;
  };

  // Activity Tracking
  lastActiveAt?: Date;
  currentSessionId?: string;
  recentActions: {
    action: string;
    targetId?: string;
    timestamp: Date;
  }[];

  // Refresh Tokens
  refreshTokens: string[];

  // Security & Audit
  profileImage?: string;
  isActive: boolean;
  isVerified: boolean;
  loginAttempts: number;
  accountLockedUntil?: Date;
  lastLoginAt?: Date;
  mustChangePassword?: boolean;
  
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  disabledBy?: mongoose.Types.ObjectId;
  disabledAt?: Date;
}

const ManagerSchema = new Schema<IManager>({
  managerCode: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  managerType: { type: String, enum: Object.values(MANAGER_TYPES), default: MANAGER_TYPES.FLOOR_MANAGER },
  department: { type: String, enum: ['PRODUCTION', 'QUALITY_CONTROL', 'GENERAL'], default: 'PRODUCTION' },
  permissions: [{ type: String, enum: Object.values(MANAGER_PERMISSIONS) }],
  
  assignedTailors: [{ type: Schema.Types.ObjectId, ref: 'Tailor' }],
  branchId: { type: String },
  branchName: { type: String },

  activeAssignmentsCount: { type: Number, default: 0 },
  completedAssignmentsCount: { type: Number, default: 0 },
  delayedAssignmentsCount: { type: Number, default: 0 },

  dashboardPreferences: {
    theme: { type: String, default: 'system' },
    defaultView: { type: String, default: 'table' },
  },
  favoriteFilters: [{ type: String }],
  savedViews: [{ type: Schema.Types.Mixed }],

  notificationPreferences: {
    emailAlerts: { type: Boolean, default: true },
    whatsappAlerts: { type: Boolean, default: false },
    pushNotifications: { type: Boolean, default: true },
  },

  lastActiveAt: { type: Date },
  currentSessionId: { type: String },
  recentActions: [{
    action: { type: String },
    targetId: { type: String },
    timestamp: { type: Date, default: Date.now },
  }],

  refreshTokens: [{ type: String }],

  profileImage: { type: String },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: true },
  loginAttempts: { type: Number, default: 0 },
  accountLockedUntil: { type: Date },
  lastLoginAt: { type: Date },
  mustChangePassword: { type: Boolean, default: false },

  createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  disabledBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  disabledAt: { type: Date },
}, { 
  timestamps: true 
});

// email and managerCode are already indexed via unique:true in the schema definition
ManagerSchema.index({ isActive: 1 });
ManagerSchema.index({ branchId: 1 });

export const Manager = mongoose.model<IManager>('Manager', ManagerSchema);
