"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const banner_model_1 = require("./banner.model");
const middlewares_1 = require("../../common/middlewares");
const responses_1 = require("../../common/responses");
const constants_1 = require("../../common/constants");
const errors_1 = require("../../common/errors");
const router = (0, express_1.Router)();
router.get('/', async (req, res, next) => {
    try {
        const now = new Date();
        const filter = { isActive: true };
        if (req.query.section)
            filter.section = req.query.section;
        filter.$or = [
            { startDate: { $exists: false } },
            { startDate: { $lte: now } },
        ];
        const banners = await banner_model_1.Banner.find(filter).sort({ order: 1 }).lean();
        (0, responses_1.sendSuccess)(res, banners);
    }
    catch (err) {
        next(err);
    }
});
router.get('/admin/all', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_BANNERS), async (_req, res, next) => {
    try {
        const banners = await banner_model_1.Banner.find().sort({ order: 1 }).lean();
        (0, responses_1.sendSuccess)(res, banners);
    }
    catch (err) {
        next(err);
    }
});
router.post('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_BANNERS), async (req, res, next) => {
    try {
        const banner = await banner_model_1.Banner.create({ ...req.body, createdBy: req.admin.adminId });
        (0, responses_1.sendCreated)(res, banner, 'Banner created');
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_BANNERS), async (req, res, next) => {
    try {
        const banner = await banner_model_1.Banner.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.admin.adminId }, { new: true });
        if (!banner)
            throw new errors_1.NotFoundError('Banner');
        (0, responses_1.sendSuccess)(res, banner, 'Banner updated');
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_BANNERS), async (req, res, next) => {
    try {
        const b = await banner_model_1.Banner.findByIdAndDelete(req.params.id);
        if (!b)
            throw new errors_1.NotFoundError('Banner');
        (0, responses_1.sendNoContent)(res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=banner.routes.js.map