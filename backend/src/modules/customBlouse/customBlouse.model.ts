import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomBlouseRequest extends Document {
  user: mongoose.Types.ObjectId;
  requestNumber: string;
  blouseType: string;
  measurements: {
    bust?: number;
    waist?: number;
    hip?: number;
    shoulderWidth?: number;
    sleeveLength?: number;
    blouseLength?: number;
    neckDepthFront?: number;
    neckDepthBack?: number;
    armhole?: number;
  };
  preferredNeckStyle?: string;
  preferredSleeveStyle?: string;
  references: string[];
  notes?: string;
  preferredDeliveryDate?: Date;
  estimatedPrice?: number;
  finalPrice?: number;
  status: string;
  adminNotes?: string;
  priceNote?: string;
  timeline: Array<{
    status: string;
    note?: string;
    updatedBy?: string;
    updatedAt: Date;
  }>;
  deliveryNote?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomBlouseSchema = new Schema<ICustomBlouseRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    requestNumber: { type: String, required: true, unique: true },
    blouseType: {
      type: String,
      enum: ['ready_made', 'custom_stitched', 'designer', 'bridal'],
      required: true,
    },
    measurements: {
      bust: { type: Number },
      waist: { type: Number },
      hip: { type: Number },
      shoulderWidth: { type: Number },
      sleeveLength: { type: Number },
      blouseLength: { type: Number },
      neckDepthFront: { type: Number },
      neckDepthBack: { type: Number },
      armhole: { type: Number },
    },
    preferredNeckStyle: { type: String },
    preferredSleeveStyle: { type: String },
    references: [{ type: String }],
    notes: { type: String },
    preferredDeliveryDate: { type: Date },
    estimatedPrice: { type: Number },
    finalPrice: { type: Number },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'price_assigned', 'approved', 'rejected', 'in_progress', 'completed', 'delivered'],
      default: 'submitted',
    },
    adminNotes: { type: String },
    priceNote: { type: String },
    timeline: [{
      status: { type: String },
      note: { type: String },
      updatedBy: { type: String },
      updatedAt: { type: Date, default: Date.now },
    }],
    deliveryNote: { type: String },
    rejectionReason: { type: String },
  },
  { timestamps: true },
);

CustomBlouseSchema.index({ user: 1 });
CustomBlouseSchema.index({ status: 1 });

export const CustomBlouseRequest = mongoose.model<ICustomBlouseRequest>('CustomBlouseRequest', CustomBlouseSchema);
