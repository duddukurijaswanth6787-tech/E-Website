import mongoose, { Schema, Document } from 'mongoose';

export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  color?: string;
  colorHex?: string;
  size?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku: string;
  images: string[];
  isActive: boolean;
}

export interface IProduct extends Document {
  name: string;
  slug: string;
  shortDescription?: string;
  description: string;
  category: mongoose.Types.ObjectId;
  collections: mongoose.Types.ObjectId[];
  images: string[];
  price: number;
  comparePrice?: number;
  stock: number;
  sku: string;
  hasVariants: boolean;
  variants: IProductVariant[];
  fabric?: string;
  careInstructions?: string;
  blouseDetails?: string;
  weavingTechnique?: string;
  pallu?: string;
  speciality?: string;
  handloomCraftsmanship?: string;
  designHighlight?: string;
  stylingTips?: string;
  color?: string;
  subcategory?: mongoose.Types.ObjectId;
  occasions?: string[];
  discountType?: 'percentage' | 'flat';
  discountValue?: number;
  taxPercent?: number;
  codAvailable?: boolean;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'preorder';
  attributes?: {
    sareeLength?: string;
    sareeWidth?: string;
    blouseLength?: string;
    blouseWidth?: string;
    weight?: string;
  };
  isBestSeller?: boolean;
  showOnHomepage?: boolean;
  sortOrder?: number;
  returnable?: boolean;
  returnWindowDays?: number;
  exchangeAvailable?: boolean;
  cancellationAllowed?: boolean;
  tags: string[];
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  lowStockThreshold: number;
  status: string;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogImage?: string;
  };
  ratings: {
    average: number;
    count: number;
  };
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VariantSchema = new Schema<IProductVariant>({
  color: { type: String },
  colorHex: { type: String },
  size: { type: String },
  price: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number, min: 0 },
  stock: { type: Number, required: true, default: 0, min: 0 },
  sku: { type: String, required: true },
  images: [{ type: String }],
  isActive: { type: Boolean, default: true },
});

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    shortDescription: { type: String },
    description: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    collections: [{ type: Schema.Types.ObjectId, ref: 'Collection' }],
    images: [{ type: String }],
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, required: true, unique: true },
    hasVariants: { type: Boolean, default: false },
    variants: [VariantSchema],
    fabric: { type: String },
    careInstructions: { type: String },
    blouseDetails: { type: String },
    weavingTechnique: { type: String },
    pallu: { type: String },
    speciality: { type: String },
    handloomCraftsmanship: { type: String },
    designHighlight: { type: String },
    stylingTips: { type: String },
    color: { type: String },
    subcategory: { type: Schema.Types.ObjectId, ref: 'Category' },
    occasions: [{ type: String }],
    discountType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
    discountValue: { type: Number, min: 0 },
    taxPercent: { type: Number, min: 0, max: 100 },
    codAvailable: { type: Boolean, default: true },
    stockStatus: {
      type: String,
      enum: ['in_stock', 'out_of_stock', 'preorder'],
      default: 'in_stock',
    },
    attributes: {
      sareeLength: { type: String },
      sareeWidth: { type: String },
      blouseLength: { type: String },
      blouseWidth: { type: String },
      weight: { type: String },
    },
    isBestSeller: { type: Boolean, default: false },
    showOnHomepage: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },
    returnable: { type: Boolean, default: true },
    returnWindowDays: { type: Number, default: 7, min: 0 },
    exchangeAvailable: { type: Boolean, default: true },
    cancellationAllowed: { type: Boolean, default: true },
    tags: [{ type: String }],
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    lowStockThreshold: { type: Number, default: 5 },
    status: { type: String, enum: ['draft', 'published', 'archived'], default: 'draft' },
    seo: {
      title: { type: String },
      description: { type: String },
      keywords: [{ type: String }],
      ogImage: { type: String },
    },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isTrending: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
