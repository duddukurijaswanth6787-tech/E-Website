"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_model_1 = require("./admin.model");
const hash_1 = require("../../common/utils/hash");
const middlewares_1 = require("../../common/middlewares");
const responses_1 = require("../../common/responses");
const constants_1 = require("../../common/constants");
const pagination_1 = require("../../common/utils/pagination");
const errors_1 = require("../../common/errors");
const router = (0, express_1.Router)();
router.get('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_ADMINS), async (req, res, next) => {
    try {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req);
        const [admins, total] = await Promise.all([
            admin_model_1.Admin.find({ deletedAt: null }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            admin_model_1.Admin.countDocuments({ deletedAt: null }),
        ]);
        (0, responses_1.sendPaginated)(res, admins, (0, pagination_1.buildPaginationMeta)(total, page, limit));
    }
    catch (err) {
        next(err);
    }
});
router.post('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_ADMINS), async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;
        const permissions = constants_1.ROLE_PERMISSIONS[role] || [];
        const passwordHash = await (0, hash_1.hashPassword)(password);
        const admin = await admin_model_1.Admin.create({
            name, email: email.toLowerCase(), passwordHash, role, permissions,
            createdBy: req.admin.adminId,
        });
        (0, responses_1.sendCreated)(res, admin, 'Admin created');
    }
    catch (err) {
        next(err);
    }
});
router.put('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_ADMINS), async (req, res, next) => {
    try {
        const admin = await admin_model_1.Admin.findOne({ _id: req.params.id, deletedAt: null });
        if (!admin)
            throw new errors_1.NotFoundError('Admin');
        if (req.body.role)
            req.body.permissions = constants_1.ROLE_PERMISSIONS[req.body.role] || [];
        if (req.body.password) {
            req.body.passwordHash = await (0, hash_1.hashPassword)(req.body.password);
            delete req.body.password;
        }
        Object.assign(admin, { ...req.body, updatedBy: req.admin.adminId });
        await admin.save();
        (0, responses_1.sendSuccess)(res, admin, 'Admin updated');
    }
    catch (err) {
        next(err);
    }
});
router.patch('/:id/status', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_ADMINS), async (req, res, next) => {
    try {
        const admin = await admin_model_1.Admin.findByIdAndUpdate(req.params.id, { isActive: req.body.isActive }, { new: true });
        if (!admin)
            throw new errors_1.NotFoundError('Admin');
        (0, responses_1.sendSuccess)(res, admin, `Admin ${req.body.isActive ? 'activated' : 'deactivated'}`);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_ADMINS), async (req, res, next) => {
    try {
        if (req.params.id === req.admin.adminId)
            throw new errors_1.ForbiddenError('You cannot delete your own account');
        const a = await admin_model_1.Admin.findByIdAndUpdate(req.params.id, { deletedAt: new Date() });
        if (!a)
            throw new errors_1.NotFoundError('Admin');
        (0, responses_1.sendNoContent)(res);
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=admin.routes.js.map