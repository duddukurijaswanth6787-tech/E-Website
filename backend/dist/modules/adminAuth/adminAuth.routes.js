"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const adminAuth_controller_1 = require("./adminAuth.controller");
const express_validator_1 = require("express-validator");
const middlewares_1 = require("../../common/middlewares");
const env_1 = require("../../config/env");
const router = (0, express_1.Router)();
const adminRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.rateLimit.windowMs,
    max: env_1.env.rateLimit.authMax,
    message: { success: false, message: 'Too many login attempts.' },
});
router.post('/login', adminRateLimiter, [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password required'),
], middlewares_1.handleValidationErrors, adminAuth_controller_1.adminAuthController.login.bind(adminAuth_controller_1.adminAuthController));
router.post('/refresh', [(0, express_validator_1.body)('refreshToken').notEmpty().withMessage('Refresh token required')], middlewares_1.handleValidationErrors, adminAuth_controller_1.adminAuthController.refreshToken.bind(adminAuth_controller_1.adminAuthController));
router.post('/logout', middlewares_1.authenticateAdmin, adminAuth_controller_1.adminAuthController.logout.bind(adminAuth_controller_1.adminAuthController));
router.get('/me', middlewares_1.authenticateAdmin, adminAuth_controller_1.adminAuthController.getMe.bind(adminAuth_controller_1.adminAuthController));
exports.default = router;
//# sourceMappingURL=adminAuth.routes.js.map