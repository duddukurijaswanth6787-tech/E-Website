import mongoose, { Schema, Document } from 'mongoose';

export interface IContentPage extends Document {
  slug: string;
  title: string;
  body: string;
  excerpt?: string;
  type: string;
  coverImage?: string;
  author?: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: Date;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  order: number;
  updatedBy?: mongoose.Types.ObjectId;
  createdBy?: mongoose.Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ContentSchema = new Schema<IContentPage>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    excerpt: { type: String },
    type: {
      type: String,
      enum: ['about', 'faq', 'blog', 'policy', 'homepage', 'footer', 'contact'],
      required: true,
    },
    coverImage: { type: String },
    author: { type: String },
    tags: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
      ogImage: { type: String },
    },
    order: { type: Number, default: 0 },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

ContentSchema.index({ type: 1, isPublished: 1 });
ContentSchema.index({ tags: 1 });

export const ContentPage = mongoose.model<IContentPage>('ContentPage', ContentSchema);
