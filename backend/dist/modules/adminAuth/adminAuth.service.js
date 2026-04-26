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
const otp_1 = require("../../common/utils/otp");
const email_1 = require("../../common/utils/email");
const settings_1 = require("../../common/utils/settings");
const errors_2 = require("../../common/errors");
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
        const isOtpEnabled = await (0, settings_1.getSettingValue)('otp_admin_login_enabled', true);
        if (isOtpEnabled) {
            const otp = (0, otp_1.generateOTP)();
            await (0, otp_1.storeOTP)(`admin_login:${email}`, otp);
            await (0, email_1.sendOTPEmail)(email, admin.name, otp);
            return { message: 'MFA REQUIRED: OTP sent to your admin email.', email, requiresOtp: true };
        }
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
            requiresOtp: false
        };
    }
    async verifyLoginOTP(email, otp, ip) {
        const admin = await admin_model_1.Admin.findOne({ email: email.toLowerCase(), deletedAt: null }).select('+refreshTokens');
        if (!admin)
            throw new errors_1.NotFoundError('Admin');
        if (!admin.isActive)
            throw new errors_1.ForbiddenError('Account is inactive.');
        const isValid = await (0, otp_1.verifyOTP)(`admin_login:${email}`, otp);
        if (!isValid)
            throw new errors_2.BadRequestError('Invalid or expired OTP');
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
        logger_1.logger.info(`Admin login (MFA Verified): ${admin.email} from ${ip}`);
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
        const updatedTokens = admin.refreshTokens.filter((t) => t !== token).concat(newRefreshToken).slice(-3);
        await admin_model_1.Admin.updateOne({ _id: admin.id }, { $set: { refreshTokens: updatedTokens } });
        return { accessToken, refreshToken: newRefreshToken };
    }
    async logout(adminId, refreshToken) {
        const admin = await admin_model_1.Admin.findById(adminId).select('+refreshTokens');
        if (admin) {
            const updatedTokens = (admin.refreshTokens || []).filter((t) => t !== refreshToken);
            await admin_model_1.Admin.updateOne({ _id: admin.id }, { $set: { refreshTokens: updatedTokens } });
        }
    }
    async forceLogout(adminId) {
        const admin = await admin_model_1.Admin.findById(adminId).select('+refreshTokens');
        if (!admin)
            throw new errors_1.NotFoundError('Admin');
        await admin_model_1.Admin.updateOne({ _id: admin.id }, { $set: { refreshTokens: [] } });
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