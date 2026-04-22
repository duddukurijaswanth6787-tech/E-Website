"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const review_model_1 = require("./review.model");
const product_model_1 = require("../products/product.model");
const middlewares_1 = require("../../common/middlewares");
const responses_1 = require("../../common/responses");
const constants_1 = require("../../common/constants");
const pagination_1 = require("../../common/utils/pagination");
const errors_1 = require("../../common/errors");
const router = (0, express_1.Router)();
// PUBLIC: Get reviews for a product
router.get('/product/:productId', async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req, 10);
        const [reviews, total] = await Promise.all([
            review_model_1.Review.find({ product: req.params.productId, status: 'approved' })
                .populate('user', 'name avatar')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            review_model_1.Review.countDocuments({ product: req.params.productId, status: 'approved' }),
        ]);
        (0, responses_1.sendPaginated)(res, reviews, (0, pagination_1.buildPaginationMeta)(total, page, limit));
    }
    catch (err) {
        next(err);
    }
});
// USER: Submit review
router.post('/', middlewares_1.authenticateUser, async (req, res, next) => {
    try {
        const { productId, rating, title, body } = req.body;
        const existing = await review_model_1.Review.findOne({ product: productId, user: req.user.userId });
        if (existing) {
            existing.rating = rating;
            existing.title = title;
            existing.body = body;
            existing.status = 'pending';
            await existing.save();
            (0, responses_1.sendSuccess)(res, existing, 'Review updated. Pending approval.');
            return;
        }
        const review = await review_model_1.Review.create({
            product: productId, user: req.user.userId,
            rating, title, body, status: 'pending',
        });
        (0, responses_1.sendCreated)(res, review, 'Review submitted. Pending approval.');
    }
    catch (err) {
        next(err);
    }
});
// ADMIN
router.get('/admin', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_REVIEWS), async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req);
        const filter = {};
        if (req.query.status)
            filter.status = req.query.status;
        const [reviews, total] = await Promise.all([
            review_model_1.Review.find(filter).populate('user', 'name email').populate('product', 'name').skip(skip).limit(limit).lean(),
            review_model_1.Review.countDocuments(filter),
        ]);
        (0, responses_1.sendPaginated)(res, reviews, (0, pagination_1.buildPaginationMeta)(total, page, limit));
    }
    catch (err) {
        next(err);
    }
});
router.patch('/admin/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_REVIEWS), async (req, res, next) => {
    try {
        const review = await review_model_1.Review.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!review)
            throw new errors_1.NotFoundError('Review');
        // Update product rating
        if (req.body.status === 'approved') {
            const stats = await review_model_1.Review.aggregate([
                { $match: { product: review.product, status: 'approved' } },
                { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
            ]);
            if (stats.length > 0) {
                await product_model_1.Product.findByIdAndUpdate(review.product, {
                    'ratings.average': Math.round(stats[0].avg * 10) / 10,
                    'ratings.count': stats[0].count,
                });
            }
        }
        (0, responses_1.sendSuccess)(res, review, 'Review updated');
    }
    catch (err) {
        next(err);
    }
});
router.delete('/admin/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_REVIEWS), async (req, res, next) => {
    try {
        const r = await review_model_1.Review.findByIdAndDelete(req.params.id);
        if (!r)
            throw new errors_1.NotFoundError('Review');
        (0, responses_1.sendNoContent)(res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=review.routes.js.map