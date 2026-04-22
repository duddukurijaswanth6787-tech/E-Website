"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderService = exports.OrderService = void 0;
const order_model_1 = require("./order.model");
const cart_model_1 = require("../cart/cart.model");
const coupon_model_1 = require("../coupons/coupon.model");
const payment_model_1 = require("../payments/payment.model");
const product_model_1 = require("../products/product.model");
const email_1 = require("../../common/utils/email");
const user_model_1 = require("../users/user.model");
const errors_1 = require("../../common/errors");
const helpers_1 = require("../../common/utils/helpers");
const pagination_1 = require("../../common/utils/pagination");
const razorpay_1 = require("../../config/razorpay");
const crypto_1 = __importDefault(require("crypto"));
const env_1 = require("../../config/env");
const helpers_2 = require("../../common/utils/helpers");
class OrderService {
    async createOrder(userId, data) {
        // Get cart or use provided items
        const cart = await cart_model_1.Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0)
            throw new errors_1.BadRequestError('Cart is empty');
        // Validate and price items
        const orderItems = [];
        let subtotal = 0;
        for (const cartItem of cart.items) {
            const product = await product_model_1.Product.findById(cartItem.product);
            if (!product || product.status !== 'published')
                continue;
            let price = product.price;
            if (cartItem.variantId && product.hasVariants) {
                const variant = product.variants.find((v) => v._id?.toString() === cartItem.variantId);
                if (variant)
                    price = variant.price;
            }
            const itemTotal = price * cartItem.quantity;
            subtotal += itemTotal;
            orderItems.push({
                product: product._id,
                variantId: cartItem.variantId,
                name: product.name,
                image: product.images[0] || '',
                sku: product.sku,
                quantity: cartItem.quantity,
                price,
                total: itemTotal,
            });
        }
        if (orderItems.length === 0)
            throw new errors_1.BadRequestError('No valid items in cart');
        // Coupon
        let couponDiscount = 0;
        let couponDoc = null;
        if (data.couponCode) {
            couponDoc = await coupon_model_1.Coupon.findOne({ code: data.couponCode.toUpperCase(), isActive: true });
            if (couponDoc) {
                const now = new Date();
                if (now < couponDoc.validFrom || now > couponDoc.validTo) {
                    throw new errors_1.BadRequestError('Coupon has expired');
                }
                if (couponDoc.maxUses && couponDoc.usedCount >= couponDoc.maxUses) {
                    throw new errors_1.BadRequestError('Coupon usage limit reached');
                }
                if (subtotal < couponDoc.minOrderAmount) {
                    throw new errors_1.BadRequestError(`Minimum order amount for this coupon is ₹${couponDoc.minOrderAmount}`);
                }
                if (couponDoc.type === 'percentage') {
                    couponDiscount = (subtotal * couponDoc.value) / 100;
                    if (couponDoc.maxDiscountAmount) {
                        couponDiscount = Math.min(couponDiscount, couponDoc.maxDiscountAmount);
                    }
                }
                else {
                    couponDiscount = Math.min(couponDoc.value, subtotal);
                }
            }
        }
        const shippingCharge = subtotal > 999 ? 0 : 99;
        const total = subtotal - couponDiscount + shippingCharge;
        const orderNumber = (0, helpers_1.generateOrderNumber)();
        const order = await order_model_1.Order.create({
            orderNumber,
            user: userId,
            items: orderItems,
            address: data.address,
            coupon: couponDoc?._id,
            couponCode: data.couponCode,
            couponDiscount,
            subtotal,
            shippingCharge,
            tax: 0,
            total,
            paymentMethod: data.paymentMethod,
            paymentStatus: data.paymentMethod === 'cod' ? 'pending' : 'pending',
            status: 'pending',
            note: data.note,
            timeline: [{ status: 'pending', note: 'Order placed', updatedAt: new Date() }],
        });
        // Update coupon usage
        if (couponDoc) {
            await coupon_model_1.Coupon.findByIdAndUpdate(couponDoc._id, {
                $inc: { usedCount: 1 },
                $push: { usedBy: userId },
            });
        }
        // Clear cart
        await cart_model_1.Cart.findOneAndDelete({ user: userId });
        // Send confirmation email
        const user = await user_model_1.User.findById(userId);
        if (user) {
            (0, email_1.sendOrderConfirmationEmail)(user.email, user.name, orderNumber, total).catch(() => { });
        }
        return order;
    }
    async createRazorpayOrder(orderId, userId) {
        const order = await order_model_1.Order.findOne({ _id: orderId, user: userId });
        if (!order)
            throw new errors_1.NotFoundError('Order');
        if (order.paymentMethod !== 'razorpay')
            throw new errors_1.BadRequestError('Invalid payment method');
        const razorpay = (0, razorpay_1.getRazorpayInstance)();
        const rzpOrder = await razorpay.orders.create({
            amount: (0, helpers_2.paise)(order.total),
            currency: 'INR',
            receipt: order.orderNumber,
        });
        order.razorpayOrderId = rzpOrder.id;
        await order.save();
        return { razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount, currency: rzpOrder.currency, keyId: env_1.env.razorpay.keyId };
    }
    async verifyPayment(data) {
        const order = await order_model_1.Order.findOne({ _id: data.orderId, user: data.userId });
        if (!order)
            throw new errors_1.NotFoundError('Order');
        const expectedSignature = crypto_1.default
            .createHmac('sha256', env_1.env.razorpay.keySecret)
            .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
            .digest('hex');
        if (expectedSignature !== data.razorpaySignature) {
            throw new errors_1.BadRequestError('Payment verification failed');
        }
        const payment = await payment_model_1.Payment.create({
            order: order._id,
            user: data.userId,
            provider: 'razorpay',
            razorpayOrderId: data.razorpayOrderId,
            razorpayPaymentId: data.razorpayPaymentId,
            razorpaySignature: data.razorpaySignature,
            amount: order.total,
            currency: 'INR',
            status: 'paid',
        });
        order.paymentStatus = 'paid';
        order.paymentId = payment._id;
        order.status = 'confirmed';
        order.timeline.push({ status: 'confirmed', note: 'Payment received', updatedAt: new Date() });
        await order.save();
        return order;
    }
    async getUserOrders(userId, req) {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req);
        const [orders, total] = await Promise.all([
            order_model_1.Order.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            order_model_1.Order.countDocuments({ user: userId }),
        ]);
        return { orders, pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit) };
    }
    async getOrderDetail(orderId, userId) {
        const order = await order_model_1.Order.findOne({ _id: orderId, user: userId });
        if (!order)
            throw new errors_1.NotFoundError('Order');
        return order;
    }
    async cancelOrder(orderId, userId, reason) {
        const order = await order_model_1.Order.findOne({ _id: orderId, user: userId });
        if (!order)
            throw new errors_1.NotFoundError('Order');
        if (!['pending', 'confirmed'].includes(order.status)) {
            throw new errors_1.BadRequestError('Order cannot be cancelled at this stage');
        }
        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancellationReason = reason;
        order.timeline.push({ status: 'cancelled', note: reason, updatedAt: new Date() });
        await order.save();
        return order;
    }
    // Admin methods
    async getAllOrders(req) {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req);
        const filter = {};
        if (req.query.status)
            filter.status = req.query.status;
        if (req.query.paymentStatus)
            filter.paymentStatus = req.query.paymentStatus;
        const [orders, total] = await Promise.all([
            order_model_1.Order.find(filter)
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            order_model_1.Order.countDocuments(filter),
        ]);
        return { orders, pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit) };
    }
    async updateOrderStatus(orderId, status, note, adminId) {
        const order = await order_model_1.Order.findById(orderId);
        if (!order)
            throw new errors_1.NotFoundError('Order');
        order.status = status;
        order.timeline.push({ status, note, updatedBy: adminId, updatedAt: new Date() });
        await order.save();
        return order;
    }
}
exports.OrderService = OrderService;
exports.orderService = new OrderService();
//# sourceMappingURL=order.service.js.map