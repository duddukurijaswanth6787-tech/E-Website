"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const VariantSchema = new mongoose_1.Schema({
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
const ProductSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    shortDescription: { type: String },
    description: { type: String, required: true },
    category: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Category', required: true },
    collections: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Collection' }],
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
    stylingTips: { type: String },
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
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Admin' },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Admin' },
    deletedAt: { type: Date },
}, { timestamps: true });
ProductSchema.index({ category: 1 });
ProductSchema.index({ status: 1 });
ProductSchema.index({ isFeatured: 1 });
ProductSchema.index({ isTrending: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
exports.Product = mongoose_1.default.model('Product', ProductSchema);
//# sourceMappingURL=product.model.js.map