import { Request, Response, NextFunction } from 'express';
import { notificationService } from './notification.service';
import { sendSuccess, sendPaginated, sendCreated } from '../../common/responses';

export class NotificationController {
  async getAllNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { notifications, pagination } = await notificationService.getAllNotifications(req);
      sendPaginated(res, notifications, pagination);
    } catch (err) { next(err); }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(req.params.id as string);
      sendSuccess(res, notification, 'Notification marked as read');
    } catch (err) { next(err); }
  }

  async createNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.createNotification(req.body);
      sendCreated(res, notification, 'Notification dispatched');
    } catch (err) { next(err); }
  }
}

export const notificationController = new NotificationController();
