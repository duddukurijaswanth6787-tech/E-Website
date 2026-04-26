"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const shipping_model_1 = require("./shipping.model");
const middlewares_1 = require("../../common/middlewares");
const constants_1 = require("../../common/constants");
const responses_1 = require("../../common/responses");
const errors_1 = require("../../common/errors");
const router = (0, express_1.Router)();
// PUBLIC: Get active shipping rules
router.get('/', async (_req, res, next) => {
    try {
        const rules = await shipping_model_1.ShippingRule.find({ isActive: true }).lean();
        (0, responses_1.sendSuccess)(res, rules);
    }
    catch (err) {
        next(err);
    }
});
// ADMIN CRUD
router.post('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_SHIPPING), async (req, res, next) => {
    try {
        const rule = await shipping_model_1.ShippingRule.create({ ...req.body, createdBy: req.admin.adminId });
        (0, responses_1.sendCreated)(res, rule, 'Shipping rule created');
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_SHIPPING), async (req, res, next) => {
    try {
        const rule = await shipping_model_1.ShippingRule.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.admin.adminId }, { new: true });
        if (!rule)
            throw new errors_1.NotFoundError('Shipping rule');
        (0, responses_1.sendSuccess)(res, rule, 'Shipping rule updated');
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_SHIPPING), async (req, res, next) => {
    try {
        const r = await shipping_model_1.ShippingRule.findByIdAndDelete(req.params.id);
        if (!r)
            throw new errors_1.NotFoundError('Shipping rule');
        (0, responses_1.sendNoContent)(res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=shipping.routes.js.map