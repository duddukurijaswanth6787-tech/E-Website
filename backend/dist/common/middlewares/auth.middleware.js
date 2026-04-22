"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAnyPermission = exports.requirePermission = exports.optionalAuthenticateUser = exports.authenticateAdmin = exports.authenticateUser = void 0;
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../errors");
const logger_1 = require("../logger");
const authenticateUser = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new errors_1.UnauthorizedError('No token provided');
        }
        const token = authHeader.split(' ')[1];
        const payload = (0, jwt_1.verifyAccessToken)(token);
        if (payload.type !== 'access') {
            throw new errors_1.UnauthorizedError('Invalid token type');
        }
        req.user = { userId: payload.userId, role: payload.role };
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticateUser = authenticateUser;
const authenticateAdmin = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new errors_1.UnauthorizedError('No admin token provided');
        }
        const token = authHeader.split(' ')[1];
        const payload = (0, jwt_1.verifyAdminAccessToken)(token);
        if (payload.type !== 'admin_access') {
            throw new errors_1.UnauthorizedError('Invalid admin token type');
        }
        req.admin = {
            adminId: payload.adminId,
            role: payload.role,
            permissions: payload.permissions,
        };
        logger_1.logger.debug(`Admin request: ${payload.adminId} (${payload.role})`);
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.authenticateAdmin = authenticateAdmin;
const optionalAuthenticateUser = (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const payload = (0, jwt_1.verifyAccessToken)(token);
            req.user = { userId: payload.userId, role: payload.role };
        }
    }
    catch {
        // ignore — optional auth
    }
    next();
};
exports.optionalAuthenticateUser = optionalAuthenticateUser;
const requirePermission = (permission) => {
    return (req, _res, next) => {
        if (!req.admin) {
            next(new errors_1.UnauthorizedError('Admin authentication required'));
            return;
        }
        if (!req.admin.permissions.includes(permission)) {
            next(new errors_1.ForbiddenError(`Missing permission: ${permission}`));
            return;
        }
        next();
    };
};
exports.requirePermission = requirePermission;
const requireAnyPermission = (...permissions) => {
    return (req, _res, next) => {
        if (!req.admin) {
            next(new errors_1.UnauthorizedError('Admin authentication required'));
            return;
        }
        const hasPermission = permissions.some((p) => req.admin.permissions.includes(p));
        if (!hasPermission) {
            next(new errors_1.ForbiddenError('Insufficient permissions'));
            return;
        }
        next();
    };
};
exports.requireAnyPermission = requireAnyPermission;
//# sourceMappingURL=auth.middleware.js.map