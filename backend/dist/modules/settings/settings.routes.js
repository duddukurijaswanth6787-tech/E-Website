"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const setting_model_1 = require("./setting.model");
const middlewares_1 = require("../../common/middlewares");
const responses_1 = require("../../common/responses");
const constants_1 = require("../../common/constants");
const errors_1 = require("../../common/errors");
const router = (0, express_1.Router)();
// PUBLIC: Get public settings (brand, SEO, contact, social)
router.get('/public', async (_req, res, next) => {
    try {
        const settings = await setting_model_1.Setting.find({ isPublic: true }).lean();
        const result = settings.reduce((acc, s) => {
            acc[s.key] = s.value;
            return acc;
        }, {});
        (0, responses_1.sendSuccess)(res, result);
    }
    catch (err) {
        next(err);
    }
});
// ADMIN: Get all settings grouped
router.get('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_SETTINGS), async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.group)
            filter.group = req.query.group;
        const settings = await setting_model_1.Setting.find(filter).lean();
        (0, responses_1.sendSuccess)(res, settings);
    }
    catch (err) {
        next(err);
    }
});
// ADMIN: Bulk upsert settings
router.put('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_SETTINGS), async (req, res, next) => {
    try {
        const updates = req.body.settings;
        await Promise.all(updates.map(({ key, ...data }) => setting_model_1.Setting.findOneAndUpdate({ key }, { ...data, updatedBy: req.admin.adminId }, { upsert: true, new: true })));
        (0, responses_1.sendSuccess)(res, null, 'Settings updated');
    }
    catch (err) {
        next(err);
    }
});
router.patch('/:key', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_SETTINGS), async (req, res, next) => {
    try {
        const setting = await setting_model_1.Setting.findOneAndUpdate({ key: req.params.key }, { value: req.body.value, updatedBy: req.admin.adminId }, { new: true });
        if (!setting)
            throw new errors_1.NotFoundError('Setting');
        (0, responses_1.sendSuccess)(res, setting, 'Setting updated');
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=settings.routes.js.map