import { Request, Response, NextFunction } from 'express';
import { adminAuthService } from './adminAuth.service';
import { sendSuccess } from '../../common/responses';
import { BadRequestError } from '../../common/errors';

export class AdminAuthController {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminAuthService.login(req.body.email, req.body.password, req.ip);
      sendSuccess(res, result, 'Admin login successful');
    } catch (err) { next(err); }
  }

  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) throw new BadRequestError('Refresh token required');
      const result = await adminAuthService.refreshToken(refreshToken);
      sendSuccess(res, result, 'Token refreshed');
    } catch (err) { next(err); }
  }

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminAuthService.logout(req.admin!.adminId, req.body.refreshToken || '');
      sendSuccess(res, null, 'Logged out');
    } catch (err) { next(err); }
  }

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await adminAuthService.getMe(req.admin!.adminId);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }
}

export const adminAuthController = new AdminAuthController();
