"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const coupon_model_1 = require("./coupon.model");
const middlewares_1 = require("../../common/middlewares");
const responses_1 = require("../../common/responses");
const constants_1 = require("../../common/constants");
const pagination_1 = require("../../common/utils/pagination");
const errors_1 = require("../../common/errors");
const router = (0, express_1.Router)();
// PUBLIC: Validate coupon (no details exposed)
router.post('/validate', async (req, res, next) => {
    try {
        const { code } = req.body;
        const coupon = await coupon_model_1.Coupon.findOne({ code: code?.toUpperCase(), isActive: true });
        if (!coupon) {
            res.status(200).json({ success: false, message: 'Invalid coupon code' });
            return;
        }
        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validTo) {
            res.status(200).json({ success: false, message: 'Coupon has expired' });
            return;
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            res.status(200).json({ success: false, message: 'Coupon usage limit reached' });
            return;
        }
        (0, responses_1.sendSuccess)(res, {
            code: coupon.code, type: coupon.type, value: coupon.value,
            minOrderAmount: coupon.minOrderAmount, maxDiscountAmount: coupon.maxDiscountAmount,
            description: coupon.description,
        }, 'Coupon is valid');
    }
    catch (err) {
        next(err);
    }
});
// ADMIN CRUD
router.get('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_COUPONS), async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req);
        const filter = {};
        if (req.query.isActive)
            filter.isActive = req.query.isActive === 'true';
        const [coupons, total] = await Promise.all([
            coupon_model_1.Coupon.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            coupon_model_1.Coupon.countDocuments(filter),
        ]);
        (0, responses_1.sendPaginated)(res, coupons, (0, pagination_1.buildPaginationMeta)(total, page, limit));
    }
    catch (err) {
        next(err);
    }
});
router.post('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_COUPONS), async (req, res, next) => {
    try {
        const coupon = await coupon_model_1.Coupon.create({ ...req.body, code: req.body.code?.toUpperCase(), createdBy: req.admin.adminId });
        (0, responses_1.sendCreated)(res, coupon, 'Coupon created');
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_COUPONS), async (req, res, next) => {
    try {
        const coupon = await coupon_model_1.Coupon.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.admin.adminId }, { new: true });
        if (!coupon)
            throw new errors_1.NotFoundError('Coupon');
        (0, responses_1.sendSuccess)(res, coupon, 'Coupon updated');
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_COUPONS), async (req, res, next) => {
    try {
        const c = await coupon_model_1.Coupon.findByIdAndDelete(req.params.id);
        if (!c)
            throw new errors_1.NotFoundError('Coupon');
        (0, responses_1.sendNoContent)(res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=coupon.routes.js.map