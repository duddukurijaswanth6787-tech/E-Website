"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_model_1 = require("../users/user.model");
const order_model_1 = require("../orders/order.model");
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
// ADMIN: List all users
router.get('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_USERS), async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req);
        const filter = { deletedAt: null };
        if (req.query.isBlocked)
            filter.isBlocked = req.query.isBlocked === 'true';
        if (req.query.search)
            filter.$or = [
                { name: new RegExp(req.query.search, 'i') },
                { email: new RegExp(req.query.search, 'i') },
            ];
        const [users, total] = await Promise.all([
            user_model_1.User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            user_model_1.User.countDocuments(filter),
        ]);
        (0, responses_1.sendPaginated)(res, users, (0, pagination_1.buildPaginationMeta)(total, page, limit));
    }
    catch (err) {
        next(err);
    }
});
router.get('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_USERS), async (req, res, next) => {
    try {
        const user = await user_model_1.User.findById(req.params.id);
        if (!user)
            throw new errors_1.NotFoundError('User');
        const orders = await order_model_1.Order.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(10).lean();
        (0, responses_1.sendSuccess)(res, { user, orders });
    }
    catch (err) {
        next(err);
    }
});
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