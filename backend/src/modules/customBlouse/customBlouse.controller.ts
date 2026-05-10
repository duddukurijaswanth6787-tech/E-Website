import { Request, Response, NextFunction } from 'express';
import { customBlouseService } from './customBlouse.service';
import { sendSuccess, sendError } from '../../common/responses';

export const customBlouseController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id; // auth middleware adds user
      const payload = req.body;
      const result = await customBlouseService.createRequest(payload, userId);
      sendSuccess(res, result, 'Custom blouse request created');
    } catch (err) {
      next(err);
    }
  },
  getUserRequests: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as any).id;
      const data = await customBlouseService.getUserRequests(userId);
      sendSuccess(res, data, 'User custom blouse requests');
    } catch (err) {
      next(err);
    }
  },
  getRequestById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const data = await customBlouseService.getRequestById(id);
      if (!data) return sendError(res, 'Request not found', 404);
      sendSuccess(res, data, 'Custom blouse request');
    } catch (err) {
      next(err);
    }
  },
  getAllAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const data = await customBlouseService.getAllAdmin(page, limit);
      sendSuccess(res, data, 'All custom blouse requests (admin)');
    } catch (err) {
      next(err);
    }
  },
  updateStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req.user as any).id;
      const id = req.params.id as string;
      const { status } = req.body;
      const updated = await customBlouseService.updateStatus(id, status as string, adminId);
      sendSuccess(res, updated, 'Status updated');
    } catch (err) {
      next(err);
    }
  },
  updatePrice: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { price } = req.body;
      const updated = await customBlouseService.updatePrice(id, price);
      sendSuccess(res, updated, 'Price updated');
    } catch (err) {
      next(err);
    }
  },
  updateNotes: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const { notes } = req.body;
      const updated = await customBlouseService.updateNotes(id, notes as string);
      sendSuccess(res, updated, 'Admin notes updated');
    } catch (err) {
      next(err);
    }
  },
  uploadReferenceImages: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id as string;
      const files = (req as any).files as any[];
      const urls = files.map((f) => `${req.protocol}://${req.get('host')}/uploads/custom-blouse/${f.filename}`);
      const updated = await customBlouseService.addReferenceImages(id, urls);
      sendSuccess(res, updated, 'Reference images added');
    } catch (err) {
      next(err);
    }
  },
};
