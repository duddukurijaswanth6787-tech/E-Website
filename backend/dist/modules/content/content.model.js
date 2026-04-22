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
exports.ContentPage = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ContentSchema = new mongoose_1.Schema({
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
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Admin' },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Admin' },
    deletedAt: { type: Date },
}, { timestamps: true });
ContentSchema.index({ type: 1, isPublished: 1 });
ContentSchema.index({ tags: 1 });
exports.ContentPage = mongoose_1.default.model('ContentPage', ContentSchema);
//# sourceMappingURL=content.model.js.map