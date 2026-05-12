import mongoose, { Schema, Document } from 'mongoose';

export interface ILandingPage extends Document {
  slug: string;
  title: string;
  h1: string;
  description: string;
  content: {
    sectionType: 'hero' | 'features' | 'gallery' | 'faqs' | 'cta' | 'testimonials' | 'text_image';
    title?: string;
    subtitle?: string;
    body?: string;
    images?: string[];
    items?: Array<{
      title: string;
      description: string;
      icon?: string;
      image?: string;
    }>;
    ctaLabel?: string;
    ctaLink?: string;
  }[];
  seo: {
    title: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
    schemaType?: 'Service' | 'LocalBusiness' | 'Article';
  };
  isActive: boolean;
  targetCity?: string;
  targetCategory?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LandingPageSchema = new Schema<ILandingPage>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true },
    title: { type: String, required: true },
    h1: { type: String, required: true },
    description: { type: String },
    content: [{
      sectionType: { 
        type: String, 
        enum: ['hero', 'features', 'gallery', 'faqs', 'cta', 'testimonials', 'text_image'],
        required: true 
      },
      title: String,
      subtitle: String,
      body: String,
      images: [String],
      items: [{
        title: String,
        description: String,
        icon: String,
        image: String
      }],
      ctaLabel: String,
      ctaLink: String
    }],
    seo: {
      title: { type: String, required: true },
      metaDescription: { type: String, required: true },
      keywords: [{ type: String }],
      ogImage: String,
      schemaType: { type: String, default: 'Service' }
    },
    isActive: { type: Boolean, default: true },
    targetCity: String,
    targetCategory: String
  },
  { timestamps: true }
);

LandingPageSchema.index({ slug: 1 });
LandingPageSchema.index({ isActive: 1, targetCity: 1 });

export const LandingPage = mongoose.model<ILandingPage>('LandingPage', LandingPageSchema);
