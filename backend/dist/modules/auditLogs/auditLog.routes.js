"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auditLog_model_1 = require("./auditLog.model");
const middlewares_1 = require("../../common/middlewares");
const responses_1 = require("../../common/responses");
const constants_1 = require("../../common/constants");
const pagination_1 = require("../../common/utils/pagination");
const router = (0, express_1.Router)();
router.get('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.VIEW_AUDIT_LOGS), async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req, 50);
        const filter = {};
        if (req.query.module)
            filter.module = req.query.module;
        if (req.query.admin)
            filter.admin = req.query.admin;
        const [logs, total] = await Promise.all([
            auditLog_model_1.AuditLog.find(filter)
                .populate('admin', 'name email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            auditLog_model_1.AuditLog.countDocuments(filter),
        ]);
        (0, responses_1.sendPaginated)(res, logs, (0, pagination_1.buildPaginationMeta)(total, page, limit));
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=auditLog.routes.js.map