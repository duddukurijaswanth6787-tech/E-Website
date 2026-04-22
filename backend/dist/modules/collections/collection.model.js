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
exports.Collection = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CollectionSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String },
    type: {
        type: String,
        enum: ['bridal', 'silk', 'festive', 'designer_blouse', 'campaign', 'curated'],
        required: true,
    },
    banner: { type: String },
    mobileB: { type: String },
    products: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Product' }],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    seo: {
        title: { type: String },
        description: { type: String },
    },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Admin' },
    updatedBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Admin' },
    deletedAt: { type: Date },
}, { timestamps: true });
CollectionSchema.index({ type: 1 });
exports.Collection = mongoose_1.default.model('Collection', CollectionSchema);
//# sourceMappingURL=collection.model.js.map