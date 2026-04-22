"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customBlouse_model_1 = require("./customBlouse.model");
const middlewares_1 = require("../../common/middlewares");
const upload_middleware_1 = require("../../common/middlewares/upload.middleware");
const responses_1 = require("../../common/responses");
const constants_1 = require("../../common/constants");
const pagination_1 = require("../../common/utils/pagination");
const errors_1 = require("../../common/errors");
const router = (0, express_1.Router)();
// USER: Submit custom blouse request
router.post('/', middlewares_1.authenticateUser, (0, upload_middleware_1.uploadCustomBlouseFiles)(constants_1.UPLOAD_FOLDER.CUSTOM_BLOUSE), async (req, res, next) => {
    try {
        const references = (req.files || []).map((f) => (0, upload_middleware_1.getFileUrl)(req, f.path));
        const reqNumber = `CB-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const request = await customBlouse_model_1.CustomBlouseRequest.create({
            user: req.user.userId,
            requestNumber: reqNumber,
            ...req.body,
            measurements: typeof req.body.measurements === 'string' ? JSON.parse(req.body.measurements) : req.body.measurements,
            references,
            timeline: [{ status: 'submitted', note: 'Request submitted by customer', updatedAt: new Date() }],
        });
        (0, responses_1.sendCreated)(res, request, 'Custom blouse request submitted successfully');
    }
    catch (err) {
        next(err);
    }
});
// USER: Get my requests
router.get('/my', middlewares_1.authenticateUser, async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req);
        const [requests, total] = await Promise.all([
            customBlouse_model_1.CustomBlouseRequest.find({ user: req.user.userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
            customBlouse_model_1.CustomBlouseRequest.countDocuments({ user: req.user.userId }),
        ]);
        (0, responses_1.sendPaginated)(res, requests, (0, pagination_1.buildPaginationMeta)(total, page, limit));
    }
    catch (err) {
        next(err);
    }
});
router.get('/my/:id', middlewares_1.authenticateUser, async (req, res, next) => {
    try {
        const request = await customBlouse_model_1.CustomBlouseRequest.findOne({ _id: req.params.id, user: req.user.userId });
        if (!request)
            throw new errors_1.NotFoundError('Custom blouse request');
        (0, responses_1.sendSuccess)(res, request);
    }
    catch (err) {
        next(err);
    }
});
// ADMIN routes
router.get('/admin', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_CUSTOM_BLOUSE), async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req);
        const filter = {};
        if (req.query.status)
            filter.status = req.query.status;
        const [requests, total] = await Promise.all([
            customBlouse_model_1.CustomBlouseRequest.find(filter).populate('user', 'name email mobile').sort({ createdAt: -1 }).skip(skip).limit(limit),
            customBlouse_model_1.CustomBlouseRequest.countDocuments(filter),
        ]);
        (0, responses_1.sendPaginated)(res, requests, (0, pagination_1.buildPaginationMeta)(total, page, limit));
    }
    catch (err) {
        next(err);
    }
});
router.get('/admin/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_CUSTOM_BLOUSE), async (req, res, next) => {
    try {
        const request = await customBlouse_model_1.CustomBlouseRequest.findById(req.params.id).populate('user', 'name email mobile');
        if (!request)
            throw new errors_1.NotFoundError('Custom blouse request');
        (0, responses_1.sendSuccess)(res, request);
    }
    catch (err) {
        next(err);
    }
});
router.patch('/admin/:id/status', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_CUSTOM_BLOUSE), async (req, res, next) => {
    try {
        const { status, note, estimatedPrice, finalPrice, adminNotes, priceNote } = req.body;
        const request = await customBlouse_model_1.CustomBlouseRequest.findById(req.params.id);
        if (!request)
            throw new errors_1.NotFoundError('Custom blouse request');
        const validStatuses = ['submitted', 'under_review', 'price_assigned', 'approved', 'rejected', 'in_progress', 'completed', 'delivered'];
        if (!validStatuses.includes(status))
            throw new errors_1.BadRequestError('Invalid status');
        request.status = status;
        if (adminNotes)
            request.adminNotes = adminNotes;
        if (estimatedPrice)
            request.estimatedPrice = estimatedPrice;
        if (finalPrice)
            request.finalPrice = finalPrice;
        if (priceNote)
            request.priceNote = priceNote;
        request.timeline.push({ status, note: note || `Status updated to ${status}`, updatedBy: req.admin.adminId, updatedAt: new Date() });
        await request.save();
        (0, responses_1.sendSuccess)(res, request, 'Status updated');
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=customBlouse.routes.js.map