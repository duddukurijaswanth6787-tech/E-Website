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
exports.CustomBlouseRequest = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const CustomBlouseSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    requestNumber: { type: String, required: true, unique: true },
    blouseType: {
        type: String,
        enum: ['ready_made', 'custom_stitched', 'designer', 'bridal'],
        required: true,
    },
    measurements: {
        bust: { type: Number },
        waist: { type: Number },
        hip: { type: Number },
        shoulderWidth: { type: Number },
        sleeveLength: { type: Number },
        blouseLength: { type: Number },
        neckDepthFront: { type: Number },
        neckDepthBack: { type: Number },
        armhole: { type: Number },
    },
    preferredNeckStyle: { type: String },
    preferredSleeveStyle: { type: String },
    references: [{ type: String }],
    notes: { type: String },
    preferredDeliveryDate: { type: Date },
    estimatedPrice: { type: Number },
    finalPrice: { type: Number },
    status: {
        type: String,
        enum: ['submitted', 'under_review', 'price_assigned', 'approved', 'rejected', 'in_progress', 'completed', 'delivered'],
        default: 'submitted',
    },
    adminNotes: { type: String },
    priceNote: { type: String },
    timeline: [{
            status: { type: String },
            note: { type: String },
            updatedBy: { type: String },
            updatedAt: { type: Date, default: Date.now },
        }],
    deliveryNote: { type: String },
    rejectionReason: { type: String },
}, { timestamps: true });
CustomBlouseSchema.index({ user: 1 });
CustomBlouseSchema.index({ status: 1 });
exports.CustomBlouseRequest = mongoose_1.default.model('CustomBlouseRequest', CustomBlouseSchema);
//# sourceMappingURL=customBlouse.model.js.map