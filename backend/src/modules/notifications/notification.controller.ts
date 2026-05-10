import { Request, Response, NextFunction } from 'express';
import { NotificationService } from './notification.service';
import { logger } from '../../common/logger';

export class NotificationController {
  /**
   * GET /api/v1/notifications
   * Get paginated history for the current user.
   */
  static async getHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const recipientId = (req as any).user.id;

      const result = await NotificationService.getHistory({
        recipientId,
        page: Number(page),
        limit: Number(limit),
      });

      res.status(200).json({
        success: true,
        data: result.docs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: result.total,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/v1/notifications/unread-count
   */
  static async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const recipientId = (req as any).user.id;
      const count = await NotificationService.getUnreadCount(recipientId);

      res.status(200).json({
        success: true,
        data: { unreadCount: count },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/notifications/:id/read
   */
  static async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const recipientId = (req as any).user.id;

      const ok = await NotificationService.markAsRead(id as string, recipientId);
      if (!ok) {
        return res.status(404).json({ success: false, error: 'Notification not found' });
      }

      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  }

  /**
   * PATCH /api/v1/notifications/mark-all-read
   */
  static async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const recipientId = (req as any).user.id;
      const count = await NotificationService.markAllAsRead(recipientId);

      res.status(200).json({
        success: true,
        data: { modifiedCount: count },
      });
    } catch (err) {
      next(err);
    }
  }
}
