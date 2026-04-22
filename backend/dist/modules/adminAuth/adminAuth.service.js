"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthService = exports.AdminAuthService = void 0;
const admin_model_1 = require("../admins/admin.model");
const hash_1 = require("../../common/utils/hash");
const jwt_1 = require("../../common/utils/jwt");
const helpers_1 = require("../../common/utils/helpers");
const errors_1 = require("../../common/errors");
const roles_1 = require("../../common/constants/roles");
const logger_1 = require("../../common/logger");
class AdminAuthService {
    async login(email, password, ip) {
        const admin = await admin_model_1.Admin.findOne({ email: email.toLowerCase(), deletedAt: null }).select('+passwordHash +refreshTokens');
        if (!admin)
            throw new errors_1.UnauthorizedError('Invalid credentials');
        if (!admin.isActive)
            throw new errors_1.ForbiddenError('Your admin account is inactive. Contact super admin.');
        const isValid = await (0, hash_1.comparePassword)(password, admin.passwordHash);
        if (!isValid)
            throw new errors_1.UnauthorizedError('Invalid credentials');
        const permissions = roles_1.ROLE_PERMISSIONS[admin.role] || admin.permissions || [];
        const tokenId = (0, helpers_1.generateTokenId)();
        const accessToken = (0, jwt_1.generateAdminAccessToken)({
            adminId: admin.id,
            role: admin.role,
            permissions,
        });
        const refreshToken = (0, jwt_1.generateRefreshToken)({ userId: admin.id, tokenId });
        admin.refreshTokens = [...(admin.refreshTokens || []), refreshToken].slice(-3);
        admin.lastLoginAt = new Date();
        admin.lastLoginIp = ip;
        await admin.save();
        logger_1.logger.info(`Admin login: ${admin.email} (${admin.role}) from ${ip}`);
        return {
            admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role, permissions },
            accessToken,
            refreshToken,
        };
    }
    async refreshToken(token) {
        const payload = (0, jwt_1.verifyRefreshToken)(token);
        const admin = await admin_model_1.Admin.findById(payload.userId).select('+refreshTokens');
        if (!admin)
            throw new errors_1.UnauthorizedError('Admin not found');
        if (!admin.refreshTokens?.includes(token))
            throw new errors_1.UnauthorizedError('Token revoked');
        const permissions = roles_1.ROLE_PERMISSIONS[admin.role] || admin.permissions || [];
        const tokenId = (0, helpers_1.generateTokenId)();
        const accessToken = (0, jwt_1.generateAdminAccessToken)({ adminId: admin.id, role: admin.role, permissions });
        const newRefreshToken = (0, jwt_1.generateRefreshToken)({ userId: admin.id, tokenId });
        admin.refreshTokens = admin.refreshTokens.filter((t) => t !== token).concat(newRefreshToken).slice(-3);
        await admin.save();
        return { accessToken, refreshToken: newRefreshToken };
    }
    async logout(adminId, refreshToken) {
        const admin = await admin_model_1.Admin.findById(adminId).select('+refreshTokens');
        if (admin) {
            admin.refreshTokens = (admin.refreshTokens || []).filter((t) => t !== refreshToken);
            await admin.save();
        }
    }
    async forceLogout(adminId) {
        const admin = await admin_model_1.Admin.findById(adminId).select('+refreshTokens');
        if (!admin)
            throw new errors_1.NotFoundError('Admin');
        admin.refreshTokens = [];
        await admin.save();
        logger_1.logger.warn(`Force logout executed for admin: ${admin.email}`);
    }
    async getMe(adminId) {
        const admin = await admin_model_1.Admin.findById(adminId);
        if (!admin)
            throw new errors_1.NotFoundError('Admin');
        const permissions = roles_1.ROLE_PERMISSIONS[admin.role] || admin.permissions || [];
        return { ...admin.toJSON(), permissions };
    }
}
exports.AdminAuthService = AdminAuthService;
exports.adminAuthService = new AdminAuthService();
//# sourceMappingURL=adminAuth.service.js.map