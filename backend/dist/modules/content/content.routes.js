"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const content_model_1 = require("./content.model");
const middlewares_1 = require("../../common/middlewares");
const responses_1 = require("../../common/responses");
const constants_1 = require("../../common/constants");
const helpers_1 = require("../../common/utils/helpers");
const pagination_1 = require("../../common/utils/pagination");
const errors_1 = require("../../common/errors");
const router = (0, express_1.Router)();
// PUBLIC
router.get('/', async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req);
        const filter = { isPublished: true, deletedAt: null };
        if (req.query.type)
            filter.type = req.query.type;
        if (req.query.tag)
            filter.tags = req.query.tag;
        const [items, total] = await Promise.all([
            content_model_1.ContentPage.find(filter).sort({ publishedAt: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
            content_model_1.ContentPage.countDocuments(filter),
        ]);
        (0, responses_1.sendPaginated)(res, items, (0, pagination_1.buildPaginationMeta)(total, page, limit));
    }
    catch (err) {
        next(err);
    }
});
router.get('/blogs', async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req, 9);
        const filter = { type: 'blog', isPublished: true, deletedAt: null };
        if (req.query.tag)
            filter.tags = req.query.tag;
        const [blogs, total] = await Promise.all([
            content_model_1.ContentPage.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit).lean(),
            content_model_1.ContentPage.countDocuments(filter),
        ]);
        (0, responses_1.sendPaginated)(res, blogs, (0, pagination_1.buildPaginationMeta)(total, page, limit));
    }
    catch (err) {
        next(err);
    }
});
router.get('/:slug', async (req, res, next) => {
    try {
        const content = await content_model_1.ContentPage.findOne({ slug: req.params.slug, isPublished: true, deletedAt: null });
        if (!content)
            throw new errors_1.NotFoundError('Content page');
        (0, responses_1.sendSuccess)(res, content);
    }
    catch (err) {
        next(err);
    }
});
// ADMIN
router.get('/admin/all', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_CONTENT), async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req);
        const filter = { deletedAt: null };
        if (req.query.type)
            filter.type = req.query.type;
        const [items, total] = await Promise.all([
            content_model_1.ContentPage.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit).lean(),
            content_model_1.ContentPage.countDocuments(filter),
        ]);
        (0, responses_1.sendPaginated)(res, items, (0, pagination_1.buildPaginationMeta)(total, page, limit));
    }
    catch (err) {
        next(err);
    }
});
router.post('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_CONTENT), async (req, res, next) => {
    try {
        const slug = req.body.slug || await (0, helpers_1.generateUniqueSlug)(req.body.title, async (s) => !!(await content_model_1.ContentPage.findOne({ slug: s })));
        const content = await content_model_1.ContentPage.create({
            ...req.body, slug,
            publishedAt: req.body.isPublished ? new Date() : undefined,
            createdBy: req.admin.adminId,
        });
        (0, responses_1.sendCreated)(res, content, 'Content page created');
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_CONTENT), async (req, res, next) => {
    try {
        const update = { ...req.body, updatedBy: req.admin.adminId };
        if (req.body.isPublished && !req.body.publishedAt)
            update.publishedAt = new Date();
        const content = await content_model_1.ContentPage.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!content)
            throw new errors_1.NotFoundError('Content page');
        (0, responses_1.sendSuccess)(res, content, 'Content page updated');
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_CONTENT), async (req, res, next) => {
    try {
        const c = await content_model_1.ContentPage.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
        if (!c)
            throw new errors_1.NotFoundError('Content page');
        (0, responses_1.sendNoContent)(res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=content.routes.js.map