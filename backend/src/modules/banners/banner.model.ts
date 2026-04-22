import mongoose, { Schema, Document } from 'mongoose';

export interface IBanner extends Document {
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  ctaText?: string;
  section: string;
  order: number;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BannerSchema = new Schema<IBanner>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String },
    image: { type: String, required: true },
    mobileImage: { type: String },
    link: { type: String },
    ctaText: { type: String },
    section: {
      type: String,
      enum: ['hero', 'promotional', 'category', 'campaign', 'announcement'],
      required: true,
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true },
);

BannerSchema.index({ section: 1, isActive: 1, order: 1 });

export const Banner = mongoose.model<IBanner>('Banner', BannerSchema);
