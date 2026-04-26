"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("./auth.controller");
const auth_validation_1 = require("./auth.validation");
const middlewares_1 = require("../../common/middlewares");
const env_1 = require("../../config/env");
const router = (0, express_1.Router)();
const authRateLimiter = (0, express_rate_limit_1.default)({
    windowMs: env_1.env.rateLimit.windowMs,
    max: env_1.env.rateLimit.authMax,
    message: { success: false, message: 'Too many requests. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
});
/**
 * @route POST /api/v1/auth/register
 * @desc Register a new customer account
 * @access Public
 */
router.post('/register', authRateLimiter, auth_validation_1.registerValidation, middlewares_1.handleValidationErrors, auth_controller_1.authController.register.bind(auth_controller_1.authController));
/**
 * @route POST /api/v1/auth/verify-email
 * @desc Verify email with OTP
 * @access Public
 */
router.post('/verify-email', authRateLimiter, auth_validation_1.verifyEmailValidation, middlewares_1.handleValidationErrors, auth_controller_1.authController.verifyEmail.bind(auth_controller_1.authController));
/**
 * @route POST /api/v1/auth/resend-otp
 * @desc Resend email OTP
 * @access Public
 */
router.post('/resend-otp', authRateLimiter, auth_validation_1.resendOTPValidation, middlewares_1.handleValidationErrors, auth_controller_1.authController.resendOTP.bind(auth_controller_1.authController));
/**
 * @route POST /api/v1/auth/login
 * @desc Login with email and password
 * @access Public
 */
router.post('/login', authRateLimiter, auth_validation_1.loginValidation, middlewares_1.handleValidationErrors, auth_controller_1.authController.login.bind(auth_controller_1.authController));
/**
 * @route POST /api/v1/auth/verify-login
 * @desc Verify login with OTP
 * @access Public
 */
router.post('/verify-login', authRateLimiter, auth_controller_1.authController.verifyLogin.bind(auth_controller_1.authController));
/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh', auth_validation_1.refreshTokenValidation, middlewares_1.handleValidationErrors, auth_controller_1.authController.refreshToken.bind(auth_controller_1.authController));
/**
 * @route POST /api/v1/auth/logout
 * @desc Logout and invalidate refresh token
 * @access Private
 */
router.post('/logout', middlewares_1.authenticateUser, auth_controller_1.authController.logout.bind(auth_controller_1.authController));
/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Send password reset OTP to email
 * @access Public
 */
router.post('/forgot-password', authRateLimiter, auth_validation_1.forgotPasswordValidation, middlewares_1.handleValidationErrors, auth_controller_1.authController.forgotPassword.bind(auth_controller_1.authController));
/**
 * @route POST /api/v1/auth/reset-password
 * @desc Reset password with OTP
 * @access Public
 */
router.post('/reset-password', authRateLimiter, auth_validation_1.resetPasswordValidation, middlewares_1.handleValidationErrors, auth_controller_1.authController.resetPassword.bind(auth_controller_1.authController));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map