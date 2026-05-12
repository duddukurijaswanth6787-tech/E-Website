import mongoose, { Schema, Document } from 'mongoose';
import { USER_ROLES } from '../../common/constants/roles';

export enum TailorSpecialization {
  BLOUSE = 'Blouse',
  BRIDAL = 'Bridal',
  SAREE_FINISHING = 'Saree Finishing',
  ALTERATION = 'Alteration',
  EMBROIDERY = 'Embroidery',
  LEHENGA = 'Lehenga',
  GENERAL = 'General'
}

export interface ITailor extends Document {
  tailorCode: string; // e.g., TLR-1001
  name: string;
  email: string;
  phone: string;
  passwordHash: string;
  
  // Profile Status
  isVerified: boolean;
  isAvailable: boolean;
  isActive: boolean;
  
  // Expertise & Workload
  specialization: string[]; 
  experienceYears: number;
  currentAssignedCount: number;
  completedOrdersCount: number;
  dailyCapacity: number;
  assignedOrders: mongoose.Types.ObjectId[];
  
  // Branch scoping (for multi-branch RBAC + realtime room isolation)
  branchId?: string | null;
  branchName?: string | null;

  profileImage?: string;
  role: string;
  
  // Security
  refreshTokens: string[];
  loginAttempts: number;
  accountLockedUntil?: Date;
  lastLoginAt?: Date;
  
  // Audit
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  disabledBy?: mongoose.Types.ObjectId;
  disabledAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const TailorSchema = new Schema<ITailor>({
  tailorCode: { type: String, required: true, unique: true, uppercase: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true, select: false },
  
  isVerified: { type: Boolean, default: false },
  isAvailable: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },

  specialization: [{ type: String }],
  experienceYears: { type: Number, default: 0 },
  currentAssignedCount: { type: Number, default: 0 },
  completedOrdersCount: { type: Number, default: 0 },
  dailyCapacity: { type: Number, default: 5 },
  assignedOrders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],

  branchId: { type: String, default: null, index: true },
  branchName: { type: String, default: null },

  profileImage: { type: String },
  role: { type: String, default: USER_ROLES.TAILOR },
  
  refreshTokens: [{ type: String, select: false }],
  loginAttempts: { type: Number, default: 0 },
  accountLockedUntil: { type: Date },
  lastLoginAt: { type: Date },
  
  createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
  updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  disabledBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  disabledAt: { type: Date },
}, { 
  timestamps: true,
  toJSON: {
    transform: (_doc, ret: any) => {
      delete ret.passwordHash;
      delete ret.refreshTokens;
      return ret;
    },
  },
});

// email and tailorCode are already indexed via unique:true in the schema definition
TailorSchema.index({ isActive: 1, isAvailable: 1 });
TailorSchema.index({ specialization: 1 });

export const Tailor = mongoose.model<ITailor>('Tailor', TailorSchema);
