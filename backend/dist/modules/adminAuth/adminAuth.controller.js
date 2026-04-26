"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuthController = exports.AdminAuthController = void 0;
const adminAuth_service_1 = require("./adminAuth.service");
const responses_1 = require("../../common/responses");
const errors_1 = require("../../common/errors");
class AdminAuthController {
    async login(req, res, next) {
        try {
            const result = await adminAuth_service_1.adminAuthService.login(req.body.email, req.body.password, req.ip);
            (0, responses_1.sendSuccess)(res, result, result.requiresOtp ? 'MFA Required' : 'Admin login successful');
        }
        catch (err) {
            next(err);
        }
    }
    async verifyLogin(req, res, next) {
        try {
            const { email, otp } = req.body;
            const result = await adminAuth_service_1.adminAuthService.verifyLoginOTP(email, otp, req.ip);
            (0, responses_1.sendSuccess)(res, result, 'MFA bypass successful. Login confirmed.');
        }
        catch (err) {
            next(err);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken)
                throw new errors_1.BadRequestError('Refresh token required');
            const result = await adminAuth_service_1.adminAuthService.refreshToken(refreshToken);
            (0, responses_1.sendSuccess)(res, result, 'Token refreshed');
        }
        catch (err) {
            next(err);
        }
    }
    async logout(req, res, next) {
        try {
            await adminAuth_service_1.adminAuthService.logout(req.admin.adminId, req.body.refreshToken || '');
            (0, responses_1.sendSuccess)(res, null, 'Logged out');
        }
        catch (err) {
            next(err);
        }
    }
    async getMe(req, res, next) {
        try {
            const result = await adminAuth_service_1.adminAuthService.getMe(req.admin.adminId);
            (0, responses_1.sendSuccess)(res, result);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AdminAuthController = AdminAuthController;
exports.adminAuthController = new AdminAuthController();
//# sourceMappingURL=adminAuth.controller.js.map