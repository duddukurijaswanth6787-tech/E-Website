"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wishlist_model_1 = require("./wishlist.model");
const product_model_1 = require("../products/product.model");
const middlewares_1 = require("../../common/middlewares");
const responses_1 = require("../../common/responses");
const constants_1 = require("../../common/constants");
const errors_1 = require("../../common/errors");
const router = (0, express_1.Router)();
router.get('/', middlewares_1.authenticateUser, async (req, res, next) => {
    try {
        const wishlist = await wishlist_model_1.Wishlist.findOne({ user: req.user.userId })
            .populate('items.product', 'name images price slug status');
        (0, responses_1.sendSuccess)(res, wishlist || { items: [] });
    }
    catch (err) {
        next(err);
    }
});
router.post('/toggle', middlewares_1.authenticateUser, async (req, res, next) => {
    try {
        const { productId } = req.body;
        const product = await product_model_1.Product.findById(productId);
        if (!product)
            throw new errors_1.NotFoundError('Product');
        let wishlist = await wishlist_model_1.Wishlist.findOne({ user: req.user.userId });
        if (!wishlist) {
            wishlist = new wishlist_model_1.Wishlist({ user: req.user.userId, items: [] });
        }
        const existingIndex = wishlist.items.findIndex((i) => i.product.toString() === productId);
        let action;
        if (existingIndex > -1) {
            wishlist.items.splice(existingIndex, 1);
            action = 'removed';
        }
        else {
            wishlist.items.push({ product: product._id, addedAt: new Date() });
            action = 'added';
        }
        await wishlist.save();
        (0, responses_1.sendSuccess)(res, { wishlist, action }, `Product ${action} ${action === 'added' ? 'to' : 'from'} wishlist`);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:productId', middlewares_1.authenticateUser, async (req, res, next) => {
    try {
        const wishlist = await wishlist_model_1.Wishlist.findOne({ user: req.user.userId });
        if (!wishlist)
            throw new errors_1.NotFoundError('Wishlist');
        wishlist.items = wishlist.items.filter((i) => i.product.toString() !== req.params.productId);
        await wishlist.save();
        (0, responses_1.sendSuccess)(res, wishlist, 'Removed from wishlist');
    }
    catch (err) {
        next(err);
    }
});
// Admin: most wished products
router.get('/insights', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_PRODUCTS), async (_req, res, next) => {
    try {
        const results = await wishlist_model_1.Wishlist.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.product', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 20 },
            { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
            { $unwind: '$product' },
            { $project: { 'product.name': 1, 'product.images': 1, 'product.slug': 1, count: 1 } },
        ]);
        (0, responses_1.sendSuccess)(res, results);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=wishlist.routes.js.map