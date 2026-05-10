import { Request, Response, NextFunction } from 'express';
import { ownerAuthService } from './ownerAuth.service';
import { sendSuccess, sendCreated } from '../../common/responses';

export const ownerAuthController = {
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await ownerAuthService.register(req.body);
      sendCreated(res, result, result.message);
    } catch (err) {
      next(err);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await ownerAuthService.login(email, password);
      sendSuccess(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  },

  refresh: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      const result = await ownerAuthService.refreshToken(refreshToken);
      sendSuccess(res, result, 'Token refreshed');
    } catch (err) {
      next(err);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;
      await ownerAuthService.logout(req.user!.userId, refreshToken);
      sendSuccess(res, null, 'Logged out successfully');
    } catch (err) {
      next(err);
    }
  },

  getMe: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const owner = await ownerAuthService.getMe(req.user!.userId);
      sendSuccess(res, owner, 'Profile fetched');
    } catch (err) {
      next(err);
    }
  },
};
