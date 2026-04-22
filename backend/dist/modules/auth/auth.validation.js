"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshTokenValidation = exports.resendOTPValidation = exports.resetPasswordValidation = exports.forgotPasswordValidation = exports.loginValidation = exports.verifyEmailValidation = exports.registerValidation = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidation = [
    (0, express_validator_1.body)('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
    (0, express_validator_1.body)('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and a number'),
    (0, express_validator_1.body)('mobile').optional().isMobilePhone('en-IN').withMessage('Invalid mobile number'),
];
exports.verifyEmailValidation = [
    (0, express_validator_1.body)('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    (0, express_validator_1.body)('otp').trim().notEmpty().withMessage('OTP is required').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits').isNumeric().withMessage('OTP must be numeric'),
];
exports.loginValidation = [
    (0, express_validator_1.body)('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
exports.forgotPasswordValidation = [
    (0, express_validator_1.body)('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];
exports.resetPasswordValidation = [
    (0, express_validator_1.body)('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    (0, express_validator_1.body)('otp').trim().notEmpty().withMessage('OTP is required').isLength({ min: 6, max: 6 }).isNumeric(),
    (0, express_validator_1.body)('newPassword')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and a number'),
];
exports.resendOTPValidation = [
    (0, express_validator_1.body)('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];
exports.refreshTokenValidation = [
    (0, express_validator_1.body)('refreshToken').notEmpty().withMessage('Refresh token is required'),
];
//# sourceMappingURL=auth.validation.js.map