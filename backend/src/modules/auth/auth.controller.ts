import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess, sendCreated } from '../../common/responses';
import { BadRequestError } from '../../common/errors';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendCreated(res, result, result.message);
    } catch (err) { next(err); }
  }

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.verifyEmail(req.body.email, req.body.otp);
      sendSuccess(res, result, 'Email verified successfully');
    } catch (err) { next(err); }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body.email, req.body.password);
      sendSuccess(res, result, 'Login successful');
    } catch (err) { next(err); }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new BadRequestError('Refresh token is required');
      const result = await authService.refreshToken(refreshToken);
      sendSuccess(res, result, 'Token refreshed');
    } catch (err) { next(err); }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      await authService.logout(req.user!.userId, refreshToken || '');
      sendSuccess(res, null, 'Logged out successfully');
    } catch (err) { next(err); }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.forgotPassword(req.body.email);
      sendSuccess(res, result, result.message);
    } catch (err) { next(err); }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await authService.resetPassword(email, otp, newPassword);
      sendSuccess(res, result, result.message);
    } catch (err) { next(err); }
  }

  async resendOTP(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.resendOTP(req.body.email);
      sendSuccess(res, result, result.message);
    } catch (err) { next(err); }
  }
}

export const authController = new AuthController();
