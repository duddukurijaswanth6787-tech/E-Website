import mongoose, { Schema, Document } from 'mongoose';

export interface IShippingRule extends Document {
  region: string;
  method: string;
  cost: number;
  minOrderValue?: number;
  isActive: boolean;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
}

const ShippingRuleSchema = new Schema<IShippingRule>(
  {
    region: { type: String, required: true },
    method: { type: String, required: true }, // e.g., Standard, Express
    cost: { type: Number, required: true, default: 0 },
    minOrderValue: { type: Number },
    isActive: { type: Boolean, default: true },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

export const ShippingRule = mongoose.model<IShippingRule>('ShippingRule', ShippingRuleSchema);
