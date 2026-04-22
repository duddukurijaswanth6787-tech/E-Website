"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_model_1 = require("./cart.model");
const product_model_1 = require("../products/product.model");
const coupon_model_1 = require("../coupons/coupon.model");
const middlewares_1 = require("../../common/middlewares");
const responses_1 = require("../../common/responses");
const errors_1 = require("../../common/errors");
const router = (0, express_1.Router)();
const recalcCart = async (cart) => {
    let subtotal = 0;
    for (const item of cart.items) {
        subtotal += item.price * item.quantity;
    }
    cart.subtotal = subtotal;
    cart.total = subtotal - (cart.couponDiscount || 0);
};
// GET cart
router.get('/', middlewares_1.optionalAuthenticateUser, async (req, res, next) => {
    try {
        const filter = req.user ? { user: req.user.userId } : { sessionId: req.headers['x-session-id'] };
        const cart = await cart_model_1.Cart.findOne(filter).populate('items.product', 'name images price slug status');
        (0, responses_1.sendSuccess)(res, cart || { items: [], subtotal: 0, total: 0, couponDiscount: 0 });
    }
    catch (err) {
        next(err);
    }
});
// ADD item
router.post('/items', middlewares_1.optionalAuthenticateUser, async (req, res, next) => {
    try {
        const { productId, variantId, quantity = 1 } = req.body;
        if (!productId)
            throw new errors_1.BadRequestError('Product ID required');
        const product = await product_model_1.Product.findOne({ _id: productId, status: 'published', deletedAt: null });
        if (!product)
            throw new errors_1.NotFoundError('Product');
        let price = product.price;
        if (variantId && product.hasVariants) {
            const variant = product.variants.find((v) => v._id?.toString() === variantId);
            if (variant)
                price = variant.price;
        }
        const filter = req.user ? { user: req.user.userId } : { sessionId: req.headers['x-session-id'] };
        let cart = await cart_model_1.Cart.findOne(filter);
        if (!cart) {
            cart = new cart_model_1.Cart({
                ...(req.user ? { user: req.user.userId } : { sessionId: req.headers['x-session-id'], expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }),
                items: [],
            });
        }
        const existing = cart.items.find((i) => i.product.toString() === productId && i.variantId === variantId);
        if (existing) {
            existing.quantity += quantity;
        }
        else {
            cart.items.push({ product: product._id, variantId, quantity, price, name: product.name, image: product.images[0] || '' });
        }
        await recalcCart(cart);
        await cart.save();
        (0, responses_1.sendSuccess)(res, cart, 'Item added to cart');
    }
    catch (err) {
        next(err);
    }
});
// UPDATE item quantity
router.patch('/items/:itemId', middlewares_1.optionalAuthenticateUser, async (req, res, next) => {
    try {
        const filter = req.user ? { user: req.user.userId } : { sessionId: req.headers['x-session-id'] };
        const cart = await cart_model_1.Cart.findOne(filter);
        if (!cart)
            throw new errors_1.NotFoundError('Cart');
        const item = cart.items.id(req.params.itemId);
        if (!item)
            throw new errors_1.NotFoundError('Cart item');
        if (req.body.quantity <= 0) {
            cart.items.pull(req.params.itemId);
        }
        else {
            item.quantity = req.body.quantity;
        }
        await recalcCart(cart);
        await cart.save();
        (0, responses_1.sendSuccess)(res, cart, 'Cart updated');
    }
    catch (err) {
        next(err);
    }
});
// REMOVE item
router.delete('/items/:itemId', middlewares_1.optionalAuthenticateUser, async (req, res, next) => {
    try {
        const filter = req.user ? { user: req.user.userId } : { sessionId: req.headers['x-session-id'] };
        const cart = await cart_model_1.Cart.findOne(filter);
        if (!cart)
            throw new errors_1.NotFoundError('Cart');
        cart.items.pull(req.params.itemId);
        await recalcCart(cart);
        await cart.save();
        (0, responses_1.sendSuccess)(res, cart, 'Item removed');
    }
    catch (err) {
        next(err);
    }
});
// APPLY coupon
router.post('/coupon', middlewares_1.optionalAuthenticateUser, async (req, res, next) => {
    try {
        const { code } = req.body;
        const filter = req.user ? { user: req.user.userId } : { sessionId: req.headers['x-session-id'] };
        const cart = await cart_model_1.Cart.findOne(filter);
        if (!cart)
            throw new errors_1.NotFoundError('Cart');
        const coupon = await coupon_model_1.Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
        if (!coupon)
            throw new errors_1.BadRequestError('Invalid coupon code');
        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validTo)
            throw new errors_1.BadRequestError('Coupon expired');
        if (cart.subtotal < coupon.minOrderAmount)
            throw new errors_1.BadRequestError(`Minimum order ₹${coupon.minOrderAmount} required`);
        let discount = coupon.type === 'percentage'
            ? (cart.subtotal * coupon.value) / 100
            : coupon.value;
        if (coupon.maxDiscountAmount)
            discount = Math.min(discount, coupon.maxDiscountAmount);
        cart.coupon = coupon._id;
        cart.couponDiscount = discount;
        cart.total = cart.subtotal - discount;
        await cart.save();
        (0, responses_1.sendSuccess)(res, { cart, discountApplied: discount }, 'Coupon applied');
    }
    catch (err) {
        next(err);
    }
});
// REMOVE coupon
router.delete('/coupon', middlewares_1.optionalAuthenticateUser, async (req, res, next) => {
    try {
        const filter = req.user ? { user: req.user.userId } : { sessionId: req.headers['x-session-id'] };
        const cart = await cart_model_1.Cart.findOne(filter);
        if (!cart)
            throw new errors_1.NotFoundError('Cart');
        cart.coupon = undefined;
        cart.couponDiscount = 0;
        cart.total = cart.subtotal;
        await cart.save();
        (0, responses_1.sendSuccess)(res, cart, 'Coupon removed');
    }
    catch (err) {
        next(err);
    }
});
// CLEAR cart
router.delete('/', middlewares_1.authenticateUser, async (req, res, next) => {
    try {
        await cart_model_1.Cart.findOneAndDelete({ user: req.user.userId });
        (0, responses_1.sendSuccess)(res, null, 'Cart cleared');
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=cart.routes.js.map