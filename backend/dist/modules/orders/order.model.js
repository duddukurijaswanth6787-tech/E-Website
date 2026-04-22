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
exports.Order = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const OrderItemSchema = new mongoose_1.Schema({
    product: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: String },
    name: { type: String, required: true },
    image: { type: String },
    sku: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
});
const TimelineSchema = new mongoose_1.Schema({
    status: { type: String, required: true },
    note: { type: String },
    updatedBy: { type: String },
    updatedAt: { type: Date, default: Date.now },
});
const OrderSchema = new mongoose_1.Schema({
    orderNumber: { type: String, required: true, unique: true },
    user: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [OrderItemSchema],
    address: {
        name: { type: String, required: true },
        mobile: { type: String, required: true },
        line1: { type: String, required: true },
        line2: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: 'India' },
    },
    coupon: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Coupon' },
    couponCode: { type: String },
    couponDiscount: { type: Number, default: 0 },
    subtotal: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['razorpay', 'cod'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'], default: 'pending' },
    paymentId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Payment' },
    razorpayOrderId: { type: String },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending',
    },
    timeline: [TimelineSchema],
    trackingNumber: { type: String },
    trackingUrl: { type: String },
    note: { type: String },
    invoiceUrl: { type: String },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
    refundedAt: { type: Date },
    refundAmount: { type: Number },
    deletedAt: { type: Date },
}, { timestamps: true });
OrderSchema.index({ user: 1 });
OrderSchema.index({ status: 1 });
OrderSchema.index({ createdAt: -1 });
exports.Order = mongoose_1.default.model('Order', OrderSchema);
//# sourceMappingURL=order.model.js.map