"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const category_model_1 = require("./category.model");
const middlewares_1 = require("../../common/middlewares");
const constants_1 = require("../../common/constants");
const responses_1 = require("../../common/responses");
const helpers_1 = require("../../common/utils/helpers");
const errors_1 = require("../../common/errors");
const router = (0, express_1.Router)();
// PUBLIC
router.get('/', async (_req, res, next) => {
    try {
        const categories = await category_model_1.Category.find({ isActive: true, deletedAt: null })
            .populate('parent', 'name slug')
            .sort({ order: 1 })
            .lean();
        (0, responses_1.sendSuccess)(res, categories);
    }
    catch (err) {
        next(err);
    }
});
// ADMIN (read full taxonomy, including inactive)
router.get('/admin/all', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_CATEGORIES), async (_req, res, next) => {
    try {
        const categories = await category_model_1.Category.find({ deletedAt: null })
            .populate('parent', 'name slug')
            .sort({ order: 1 })
            .lean();
        (0, responses_1.sendSuccess)(res, categories);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:slug', async (req, res, next) => {
    try {
        const category = await category_model_1.Category.findOne({ slug: req.params.slug, isActive: true, deletedAt: null });
        if (!category)
            throw new errors_1.NotFoundError('Category');
        (0, responses_1.sendSuccess)(res, category);
    }
    catch (err) {
        next(err);
    }
});
// ADMIN
router.post('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_CATEGORIES), async (req, res, next) => {
    try {
        const slug = await (0, helpers_1.generateUniqueSlug)(req.body.name, async (s) => !!(await category_model_1.Category.findOne({ slug: s })));
        const category = await category_model_1.Category.create({ ...req.body, slug, createdBy: req.admin.adminId });
        (0, responses_1.sendCreated)(res, category, 'Category created');
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_CATEGORIES), async (req, res, next) => {
    try {
        const category = await category_model_1.Category.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.admin.adminId }, { new: true });
        if (!category)
            throw new errors_1.NotFoundError('Category');
        (0, responses_1.sendSuccess)(res, category, 'Category updated');
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_CATEGORIES), async (req, res, next) => {
    try {
        const cat = await category_model_1.Category.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
        if (!cat)
            throw new errors_1.NotFoundError('Category');
        (0, responses_1.sendNoContent)(res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=category.routes.js.map