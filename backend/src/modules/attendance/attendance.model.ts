import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  employeeId: mongoose.Types.ObjectId;
  employeeType: 'admin' | 'manager' | 'tailor';
  date: Date;
  checkIn: Date;
  checkOut?: Date;
  status: 'present' | 'absent' | 'late' | 'half_day';
  totalHours?: number;
  breakDuration: number; // in minutes
  overtime: number; // in minutes
  branchId?: mongoose.Types.ObjectId;
  notes?: string;
  location?: {
    lat: number;
    lng: number;
    address?: string;
  };
  metadata?: Record<string, any>;
}

const AttendanceSchema = new Schema<IAttendance>({
  employeeId: { type: Schema.Types.ObjectId, required: true, refPath: 'employeeType' },
  employeeType: { type: String, required: true, enum: ['admin', 'manager', 'tailor'] },
  date: { type: Date, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date },
  status: { type: String, enum: ['present', 'absent', 'late', 'half_day'], default: 'present' },
  totalHours: { type: Number },
  breakDuration: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  notes: { type: String },
  location: {
    lat: { type: Number },
    lng: { type: Number },
    address: { type: String }
  },
  metadata: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

// Compound index to ensure one record per employee per day
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: -1, status: 1 });
AttendanceSchema.index({ branchId: 1, date: -1 });
AttendanceSchema.index({ status: 1 });

export const Attendance = mongoose.model<IAttendance>('Attendance', AttendanceSchema);
