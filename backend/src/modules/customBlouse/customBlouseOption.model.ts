import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomBlouseOption extends Document {
  category: string; // e.g., 'fabricType', 'frontNeckType', 'backNeckType', etc.
  value: string;    // e.g., 'Cotton', 'Silk', 'Round', 'V-Neck'
  image?: string;   // Reference image for this specific option
  isActive: boolean;
  order: number;    // Display order
}

const CustomBlouseOptionSchema = new Schema<ICustomBlouseOption>(
  {
    category: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
    image: { type: String },
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Index for performance
CustomBlouseOptionSchema.index({ category: 1, isActive: 1, order: 1 });

export const CustomBlouseOption = mongoose.model<ICustomBlouseOption>(
  'CustomBlouseOption',
  CustomBlouseOptionSchema
);
