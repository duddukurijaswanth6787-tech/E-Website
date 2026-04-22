import mongoose, { Schema, Document } from 'mongoose';

export interface ICollection extends Document {
  name: string;
  slug: string;
  description?: string;
  type: string;
  banner?: string;
  mobileB?: string;
  products: mongoose.Types.ObjectId[];
  isActive: boolean;
  isFeatured: boolean;
  order: number;
  seo?: {
    title?: string;
    description?: string;
  };
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CollectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['bridal', 'silk', 'festive', 'designer_blouse', 'campaign', 'curated'],
      required: true,
    },
    banner: { type: String },
    mobileB: { type: String },
    products: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    seo: {
      title: { type: String },
      description: { type: String },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

CollectionSchema.index({ type: 1 });

export const Collection = mongoose.model<ICollection>('Collection', CollectionSchema);
