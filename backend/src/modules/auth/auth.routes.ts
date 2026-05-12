import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from './auth.controller';
import {
  registerSchema, verifyEmailSchema, loginSchema,
  forgotPasswordSchema, resetPasswordSchema,
  resendOTPSchema, refreshTokenSchema,
} from './auth.validation';
import { validateZod } from '../../common/middlewares/zodValidate.middleware';
import { authenticateUser } from '../../common/middlewares/auth.middleware';
import { env } from '../../config/env';

const router = Router();

const authRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.authMax,
  message: { success: false, message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new customer account
 * @access Public
 */
router.post('/register', authRateLimiter, validateZod(registerSchema), authController.register.bind(authController));

/**
 * @route POST /api/v1/auth/verify-email
 * @desc Verify email with OTP
 * @access Public
 */
router.post('/verify-email', authRateLimiter, validateZod(verifyEmailSchema), authController.verifyEmail.bind(authController));

/**
 * @route POST /api/v1/auth/resend-otp
 * @desc Resend email OTP
 * @access Public
 */
router.post('/resend-otp', authRateLimiter, validateZod(resendOTPSchema), authController.resendOTP.bind(authController));

/**
 * @route POST /api/v1/auth/login
 * @desc Login with email and password
 * @access Public
 */
router.post('/login', authRateLimiter, validateZod(loginSchema), authController.login.bind(authController));

/**
 * @route POST /api/v1/auth/verify-login
 * @desc Verify login with OTP
 * @access Public
 */
router.post('/verify-login', authRateLimiter, authController.verifyLogin.bind(authController));

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh access token using refresh token
 * @access Public
 */
router.post('/refresh', validateZod(refreshTokenSchema), authController.refreshToken.bind(authController));

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout and invalidate refresh token
 * @access Private
 */
router.post('/logout', authenticateUser, authController.logout.bind(authController));

/**
 * @route POST /api/v1/auth/forgot-password
 * @desc Send password reset OTP to email
 * @access Public
 */
router.post('/forgot-password', authRateLimiter, validateZod(forgotPasswordSchema), authController.forgotPassword.bind(authController));

/**
 * @route POST /api/v1/auth/reset-password
 * @desc Reset password with OTP
 * @access Public
 */
router.post('/reset-password', authRateLimiter, validateZod(resetPasswordSchema), authController.resetPassword.bind(authController));

export default router;
