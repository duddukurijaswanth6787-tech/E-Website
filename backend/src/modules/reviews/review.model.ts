import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  tenantId: string;
  product: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  order?: mongoose.Types.ObjectId;
  rating: number;
  title?: string;
  body: string;
  images: string[];
  status: string;
  isFeatured: boolean;
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    tenantId: { type: String, required: true, index: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true },
    body: { type: String, required: true, trim: true },
    images: [{ type: String }],
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    isFeatured: { type: Boolean, default: false },
    adminNote: { type: String },
  },
  { timestamps: true },
);

ReviewSchema.index({ tenantId: 1, product: 1 });
ReviewSchema.index({ tenantId: 1, user: 1 });
ReviewSchema.index({ tenantId: 1, status: 1 });

ReviewSchema.index({ product: 1 });
ReviewSchema.index({ user: 1 });
ReviewSchema.index({ status: 1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
