"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_model_1 = require("../users/user.model");
const order_model_1 = require("../orders/order.model");
const address_model_1 = require("../addresses/address.model");
const wishlist_model_1 = require("../wishlist/wishlist.model");
const middlewares_1 = require("../../common/middlewares");
const responses_1 = require("../../common/responses");
const constants_1 = require("../../common/constants");
const pagination_1 = require("../../common/utils/pagination");
const errors_1 = require("../../common/errors");
const router = (0, express_1.Router)();
// USER PROFILE
router.get('/me', middlewares_1.authenticateUser, async (req, res, next) => {
    try {
        const user = await user_model_1.User.findById(req.user.userId);
        if (!user)
            throw new errors_1.NotFoundError('User');
        (0, responses_1.sendSuccess)(res, user);
    }
    catch (err) {
        next(err);
    }
});
router.put('/profile', middlewares_1.authenticateUser, async (req, res, next) => {
    try {
        const allowed = ['name', 'mobile', 'avatar'];
        const updates = {};
        allowed.forEach((k) => { if (req.body[k] !== undefined)
            updates[k] = req.body[k]; });
        const user = await user_model_1.User.findByIdAndUpdate(req.user.userId, updates, { new: true });
        (0, responses_1.sendSuccess)(res, user, 'Profile fully synced');
    }
    catch (err) {
        next(err);
    }
});
router.patch('/me', middlewares_1.authenticateUser, async (req, res, next) => {
    try {
        const allowed = ['name', 'mobile', 'avatar'];
        const updates = {};
        allowed.forEach((k) => { if (req.body[k] !== undefined)
            updates[k] = req.body[k]; });
        const user = await user_model_1.User.findByIdAndUpdate(req.user.userId, updates, { new: true });
        (0, responses_1.sendSuccess)(res, user, 'Profile updated');
    }
    catch (err) {
        next(err);
    }
});
// ADMIN: List all users with order stats aggregation
router.get('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_USERS), async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req);
        const filter = { deletedAt: null, role: 'customer' };
        if (req.query.isBlocked !== undefined)
            filter.isBlocked = req.query.isBlocked === 'true';
        if (req.query.search) {
            filter.$or = [
                { name: new RegExp(req.query.search, 'i') },
                { email: new RegExp(req.query.search, 'i') },
                { mobile: new RegExp(req.query.search, 'i') },
            ];
        }
        const [users, total] = await Promise.all([
            user_model_1.User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            user_model_1.User.countDocuments(filter),
        ]);
        // Aggregate order stats for these users
        const userIds = users.map(u => u._id);
        const orderStats = await order_model_1.Order.aggregate([
            { $match: { user: { $in: userIds } } },
            {
                $group: {
                    _id: '$user',
                    totalOrders: { $sum: 1 },
                    totalSpent: { $sum: '$total' },
                    lastOrderDate: { $max: '$createdAt' },
                    pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                    deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
                    cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
                },
            },
        ]);
        const statsMap = new Map(orderStats.map(s => [String(s._id), s]));
        const enrichedUsers = users.map(u => ({
            ...u,
            totalOrders: statsMap.get(String(u._id))?.totalOrders || 0,
            totalSpent: statsMap.get(String(u._id))?.totalSpent || 0,
            lastOrderDate: statsMap.get(String(u._id))?.lastOrderDate || null,
            pendingOrders: statsMap.get(String(u._id))?.pendingOrders || 0,
            deliveredOrders: statsMap.get(String(u._id))?.deliveredOrders || 0,
            cancelledOrders: statsMap.get(String(u._id))?.cancelledOrders || 0,
        }));
        (0, responses_1.sendPaginated)(res, enrichedUsers, (0, pagination_1.buildPaginationMeta)(total, page, limit));
    }
    catch (err) {
        next(err);
    }
});
// ADMIN: Get single user with full profile, orders, addresses
router.get('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_USERS), async (req, res, next) => {
    try {
        const user = await user_model_1.User.findById(req.params.id);
        if (!user)
            throw new errors_1.NotFoundError('User');
        const [orders, addresses, wishlistCount, orderStats] = await Promise.all([
            order_model_1.Order.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(50).lean(),
            address_model_1.Address.find({ user: req.params.id }).lean(),
            (async () => {
                try {
                    const w = await wishlist_model_1.Wishlist.findOne({ user: req.params.id });
                    return w?.items?.length || 0;
                }
                catch {
                    return 0;
                }
            })(),
            order_model_1.Order.aggregate([
                { $match: { user: user._id } },
                {
                    $group: {
                        _id: null,
                        totalOrders: { $sum: 1 },
                        totalSpent: { $sum: '$total' },
                        pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                        deliveredOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } },
                        cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
                    },
                },
            ]),
        ]);
        const stats = orderStats[0] || { totalOrders: 0, totalSpent: 0, pendingOrders: 0, deliveredOrders: 0, cancelledOrders: 0 };
        (0, responses_1.sendSuccess)(res, { user, orders, addresses, wishlistCount, stats });
    }
    catch (err) {
        next(err);
    }
});
// ADMIN: Block / Unblock user
router.patch('/:id/block', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_USERS), async (req, res, next) => {
    try {
        const user = await user_model_1.User.findByIdAndUpdate(req.params.id, { isBlocked: req.body.block, blockedReason: req.body.reason }, { new: true });
        if (!user)
            throw new errors_1.NotFoundError('User');
        (0, responses_1.sendSuccess)(res, user, `User ${req.body.block ? 'blocked' : 'unblocked'}`);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=user.routes.js.map