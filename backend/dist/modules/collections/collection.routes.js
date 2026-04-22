"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collection_model_1 = require("./collection.model");
const middlewares_1 = require("../../common/middlewares");
const responses_1 = require("../../common/responses");
const constants_1 = require("../../common/constants");
const helpers_1 = require("../../common/utils/helpers");
const errors_1 = require("../../common/errors");
const router = (0, express_1.Router)();
router.get('/', async (_req, res, next) => {
    try {
        const collections = await collection_model_1.Collection.find({ isActive: true, deletedAt: null })
            .sort({ order: 1 })
            .select('-products')
            .lean();
        (0, responses_1.sendSuccess)(res, collections);
    }
    catch (err) {
        next(err);
    }
});
router.get('/featured', async (_req, res, next) => {
    try {
        const collections = await collection_model_1.Collection.find({ isActive: true, isFeatured: true, deletedAt: null })
            .sort({ order: 1 }).limit(6).lean();
        (0, responses_1.sendSuccess)(res, collections);
    }
    catch (err) {
        next(err);
    }
});
router.get('/:slug', async (req, res, next) => {
    try {
        const collection = await collection_model_1.Collection.findOne({ slug: req.params.slug, isActive: true, deletedAt: null })
            .populate({ path: 'products', match: { status: 'published', deletedAt: null }, select: 'name images price slug' });
        if (!collection)
            throw new errors_1.NotFoundError('Collection');
        (0, responses_1.sendSuccess)(res, collection);
    }
    catch (err) {
        next(err);
    }
});
router.post('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_COLLECTIONS), async (req, res, next) => {
    try {
        const slug = await (0, helpers_1.generateUniqueSlug)(req.body.name, async (s) => !!(await collection_model_1.Collection.findOne({ slug: s })));
        const collection = await collection_model_1.Collection.create({ ...req.body, slug, createdBy: req.admin.adminId });
        (0, responses_1.sendCreated)(res, collection, 'Collection created');
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_COLLECTIONS), async (req, res, next) => {
    try {
        const collection = await collection_model_1.Collection.findByIdAndUpdate(req.params.id, { ...req.body, updatedBy: req.admin.adminId }, { new: true });
        if (!collection)
            throw new errors_1.NotFoundError('Collection');
        (0, responses_1.sendSuccess)(res, collection, 'Collection updated');
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_COLLECTIONS), async (req, res, next) => {
    try {
        const c = await collection_model_1.Collection.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
        if (!c)
            throw new errors_1.NotFoundError('Collection');
        (0, responses_1.sendNoContent)(res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=collection.routes.js.map