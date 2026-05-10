import mongoose, { Schema, Document } from 'mongoose';

export interface ICmsHero extends Document {
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  badgeText?: string;
  backgroundImage?: string;
  desktopImageAlt?: string;
  mobileBackgroundImage?: string;
  mobileImageAlt?: string;
  primaryButtonText: string;
  primaryButtonLink: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  overlayOpacity: number;
  isPublished: boolean;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CmsHeroSchema = new Schema<ICmsHero>(
  {
    titleLine1: { type: String, required: true },
    titleLine2: { type: String, required: true },
    subtitle: { type: String, required: true },
    badgeText: { type: String, default: 'Luxury Indian Ethnic Wear' },
    backgroundImage: { type: String },
    desktopImageAlt: { type: String },
    mobileBackgroundImage: { type: String },
    mobileImageAlt: { type: String },
    primaryButtonText: { type: String, required: true },
    primaryButtonLink: { type: String, required: true },
    secondaryButtonText: { type: String },
    secondaryButtonLink: { type: String },
    overlayOpacity: { type: Number, min: 0, max: 0.9, default: 0.5 },
    isPublished: { type: Boolean, default: false },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

export const CmsHero = mongoose.model<ICmsHero>('CmsHero', CmsHeroSchema);
