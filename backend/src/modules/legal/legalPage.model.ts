import mongoose, { Schema, Document } from 'mongoose';

export interface ILegalVersion {
  content: string;
  version: number;
  updatedBy: string;
  createdAt: Date;
}

export interface ILegalPage extends Document {
  slug: 'privacy-policy' | 'terms-and-conditions' | 'refund-policy' | 'shipping-policy' | 'cookie-policy' | string;
  title: string;
  content: string;
  version: number;
  isPublished: boolean;
  publishedAt?: Date;
  history: ILegalVersion[];
  metaTitle?: string;
  metaDescription?: string;
  updatedBy: string;
}

const LegalVersionSchema = new Schema({
  content: { type: String, required: true },
  version: { type: Number, required: true },
  updatedBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const LegalPageSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  version: { type: Number, default: 1 },
  isPublished: { type: Boolean, default: false },
  publishedAt: { type: Date },
  history: [LegalVersionSchema],
  metaTitle: { type: String },
  metaDescription: { type: String },
  updatedBy: { type: String, required: true }
}, {
  timestamps: true
});

export default mongoose.model<ILegalPage>('LegalPage', LegalPageSchema);
