"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../../common/middlewares");
const constants_1 = require("../../common/constants");
const responses_1 = require("../../common/responses");
const router = (0, express_1.Router)();
// ADMIN ROUTES
router.get('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_ROLES), (_req, res) => {
    // Expose the static role configuration from the backend source
    (0, responses_1.sendSuccess)(res, {
        roles: Object.values(constants_1.ADMIN_ROLES),
        rolePermissions: constants_1.ROLE_PERMISSIONS,
    });
});
router.get('/permissions', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_ROLES), (_req, res) => {
    // Expose all valid permission strings
    (0, responses_1.sendSuccess)(res, Object.values(constants_1.PERMISSIONS));
});
exports.default = router;
//# sourceMappingURL=role.routes.js.map