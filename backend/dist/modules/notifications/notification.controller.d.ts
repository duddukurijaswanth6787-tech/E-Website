import { Request, Response, NextFunction } from 'express';
export declare class NotificationController {
    getAllNotifications(req: Request, res: Response, next: NextFunction): Promise<void>;
    markAsRead(req: Request, res: Response, next: NextFunction): Promise<void>;
    createNotification(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const notificationController: NotificationController;
