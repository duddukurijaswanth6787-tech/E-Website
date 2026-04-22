import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  parent?: mongoose.Types.ObjectId;
  metadata?: {
    fabric?: string;
    origin?: string;
    weaveType?: 'handloom' | 'powerloom' | 'mixed' | 'other';
    occasions?: string[];
  };
  banner?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    parent: { type: Schema.Types.ObjectId, ref: 'Category', default: null },
    metadata: {
      fabric: { type: String },
      origin: { type: String },
      weaveType: { type: String, enum: ['handloom', 'powerloom', 'mixed', 'other'] },
      occasions: [{ type: String }],
    },
    banner: { type: String },
    icon: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

CategorySchema.index({ parent: 1 });
CategorySchema.index({ isActive: 1 });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
