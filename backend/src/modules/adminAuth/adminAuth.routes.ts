import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { adminAuthController } from './adminAuth.controller';
import { body } from 'express-validator';
import { handleValidationErrors, authenticateAdmin } from '../../common/middlewares';
import { env } from '../../config/env';

const router = Router();

const adminRateLimiter = rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.authMax,
  message: { success: false, message: 'Too many login attempts.' },
});

router.post('/login',
  adminRateLimiter,
  [
    body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password required'),
  ],
  handleValidationErrors,
  adminAuthController.login.bind(adminAuthController),
);

router.post('/refresh',
  [body('refreshToken').notEmpty().withMessage('Refresh token required')],
  handleValidationErrors,
  adminAuthController.refreshToken.bind(adminAuthController),
);

router.post('/logout', authenticateAdmin, adminAuthController.logout.bind(adminAuthController));

router.get('/me', authenticateAdmin, adminAuthController.getMe.bind(adminAuthController));

export default router;
