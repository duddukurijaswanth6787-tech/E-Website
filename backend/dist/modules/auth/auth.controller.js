"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const responses_1 = require("../../common/responses");
const errors_1 = require("../../common/errors");
class AuthController {
    async register(req, res, next) {
        try {
            const result = await auth_service_1.authService.register(req.body);
            (0, responses_1.sendCreated)(res, result, result.message);
        }
        catch (err) {
            next(err);
        }
    }
    async verifyEmail(req, res, next) {
        try {
            const result = await auth_service_1.authService.verifyEmail(req.body.email, req.body.otp);
            (0, responses_1.sendSuccess)(res, result, 'Email verified successfully');
        }
        catch (err) {
            next(err);
        }
    }
    async login(req, res, next) {
        try {
            const result = await auth_service_1.authService.login(req.body.email, req.body.password);
            (0, responses_1.sendSuccess)(res, result, 'Login successful');
        }
        catch (err) {
            next(err);
        }
    }
    async refreshToken(req, res, next) {
        try {
            const { refreshToken } = req.body;
            if (!refreshToken)
                throw new errors_1.BadRequestError('Refresh token is required');
            const result = await auth_service_1.authService.refreshToken(refreshToken);
            (0, responses_1.sendSuccess)(res, result, 'Token refreshed');
        }
        catch (err) {
            next(err);
        }
    }
    async logout(req, res, next) {
        try {
            const { refreshToken } = req.body;
            await auth_service_1.authService.logout(req.user.userId, refreshToken || '');
            (0, responses_1.sendSuccess)(res, null, 'Logged out successfully');
        }
        catch (err) {
            next(err);
        }
    }
    async forgotPassword(req, res, next) {
        try {
            const result = await auth_service_1.authService.forgotPassword(req.body.email);
            (0, responses_1.sendSuccess)(res, result, result.message);
        }
        catch (err) {
            next(err);
        }
    }
    async resetPassword(req, res, next) {
        try {
            const { email, otp, newPassword } = req.body;
            const result = await auth_service_1.authService.resetPassword(email, otp, newPassword);
            (0, responses_1.sendSuccess)(res, result, result.message);
        }
        catch (err) {
            next(err);
        }
    }
    async resendOTP(req, res, next) {
        try {
            const result = await auth_service_1.authService.resendOTP(req.body.email);
            (0, responses_1.sendSuccess)(res, result, result.message);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map