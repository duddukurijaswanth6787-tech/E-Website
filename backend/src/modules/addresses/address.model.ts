import mongoose, { Schema, Document } from 'mongoose';

export interface IAddress extends Document {
  user: mongoose.Types.ObjectId;
  type: string;
  name: string;
  mobile: string;
  line1: string;
  line2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  altMobile?: string;
  deliveryInstructions?: string;
  isDefault: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    name: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String },
    landmark: { type: String },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, default: 'India' },
    altMobile: { type: String, trim: true },
    deliveryInstructions: { type: String },
    isDefault: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

AddressSchema.index({ user: 1 });

export const Address = mongoose.model<IAddress>('Address', AddressSchema);
