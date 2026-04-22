"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const support_model_1 = require("./support.model");
const middlewares_1 = require("../../common/middlewares");
const responses_1 = require("../../common/responses");
const constants_1 = require("../../common/constants");
const pagination_1 = require("../../common/utils/pagination");
const errors_1 = require("../../common/errors");
const router = (0, express_1.Router)();
// PUBLIC: Submit contact form
router.post('/', async (req, res, next) => {
    try {
        const { name, email, mobile, subject, message } = req.body;
        const ticket = await support_model_1.SupportTicket.create({ name, email, mobile, subject, message });
        (0, responses_1.sendCreated)(res, { id: ticket._id }, 'Message received. We will get back to you soon!');
    }
    catch (err) {
        next(err);
    }
});
// ADMIN routes
router.get('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_SUPPORT), async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req);
        const filter = {};
        if (req.query.status)
            filter.status = req.query.status;
        const [tickets, total] = await Promise.all([
            support_model_1.SupportTicket.find(filter).populate('assignedTo', 'name').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            support_model_1.SupportTicket.countDocuments(filter),
        ]);
        (0, responses_1.sendPaginated)(res, tickets, (0, pagination_1.buildPaginationMeta)(total, page, limit));
    }
    catch (err) {
        next(err);
    }
});
router.patch('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_SUPPORT), async (req, res, next) => {
    try {
        const ticket = await support_model_1.SupportTicket.findByIdAndUpdate(req.params.id, {
            ...req.body,
            ...(req.body.status === 'resolved' ? { resolvedAt: new Date() } : {}),
        }, { new: true });
        if (!ticket)
            throw new errors_1.NotFoundError('Ticket');
        (0, responses_1.sendSuccess)(res, ticket, 'Ticket updated');
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=support.routes.js.map