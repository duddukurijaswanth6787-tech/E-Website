"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_model_1 = require("../orders/order.model");
const user_model_1 = require("../users/user.model");
const product_model_1 = require("../products/product.model");
const customBlouse_model_1 = require("../customBlouse/customBlouse.model");
const middlewares_1 = require("../../common/middlewares");
const responses_1 = require("../../common/responses");
const constants_1 = require("../../common/constants");
const router = (0, express_1.Router)();
// All analytics routes require admin auth + VIEW_ANALYTICS permission
router.use(middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.VIEW_ANALYTICS));
// Dashboard summary
router.get('/dashboard', async (_req, res, next) => {
    try {
        const [totalOrders, totalRevenue, totalUsers, totalProducts, pendingBlouseRequests, lowStockProducts, recentOrders, ordersByStatus,] = await Promise.all([
            order_model_1.Order.countDocuments(),
            order_model_1.Order.aggregate([{ $match: { paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
            user_model_1.User.countDocuments({ deletedAt: null }),
            product_model_1.Product.countDocuments({ status: 'published', deletedAt: null }),
            customBlouse_model_1.CustomBlouseRequest.countDocuments({ status: { $in: ['submitted', 'under_review', 'price_assigned'] } }),
            product_model_1.Product.countDocuments({ stock: { $lte: 5 }, status: 'published', deletedAt: null }),
            order_model_1.Order.find().populate('user', 'name email').sort({ createdAt: -1 }).limit(10).lean(),
            order_model_1.Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        ]);
        (0, responses_1.sendSuccess)(res, {
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalUsers,
            totalProducts,
            pendingBlouseRequests,
            lowStockProducts,
            recentOrders,
            ordersByStatus: ordersByStatus.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {}),
        });
    }
    catch (err) {
        next(err);
    }
});
// Sales report by date range
router.get('/sales', async (req, res, next) => {
    try {
        const { from, to, groupBy = 'day' } = req.query;
        const dateFilter = {};
        if (from)
            dateFilter.$gte = new Date(from);
        if (to)
            dateFilter.$lte = new Date(to);
        const groupFormat = groupBy === 'month' ? '%Y-%m' : groupBy === 'year' ? '%Y' : '%Y-%m-%d';
        const sales = await order_model_1.Order.aggregate([
            { $match: { paymentStatus: 'paid', ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}) } },
            {
                $group: {
                    _id: { $dateToString: { format: groupFormat, date: '$createdAt' } },
                    revenue: { $sum: '$total' },
                    orders: { $sum: 1 },
                    avgOrderValue: { $avg: '$total' },
                },
            },
            { $sort: { _id: 1 } },
        ]);
        (0, responses_1.sendSuccess)(res, sales);
    }
    catch (err) {
        next(err);
    }
});
// Top products
router.get('/top-products', async (_req, res, next) => {
    try {
        const topProducts = await order_model_1.Order.aggregate([
            { $unwind: '$items' },
            { $group: { _id: '$items.product', name: { $first: '$items.name' }, totalSold: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.total' } } },
            { $sort: { totalSold: -1 } },
            { $limit: 10 },
        ]);
        (0, responses_1.sendSuccess)(res, topProducts);
    }
    catch (err) {
        next(err);
    }
});
// Customer growth
router.get('/customer-growth', async (_req, res, next) => {
    try {
        const growth = await user_model_1.User.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                    newUsers: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
            { $limit: 12 },
        ]);
        (0, responses_1.sendSuccess)(res, growth);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=analytics.routes.js.map