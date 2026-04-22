import { Notification } from './notification.model';
import { Request } from 'express';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination';
import { NotFoundError } from '../../common/errors';

export class NotificationService {
  async getAllNotifications(req: Request) {
    const { page, limit, skip } = parsePagination(req);
    const filter: Record<string, any> = {};
    
    if (req.query.user) filter.user = req.query.user;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.channel) filter.channel = req.query.channel;
    if (req.query.isRead) filter.isRead = req.query.isRead === 'true';

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate('user', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notification.countDocuments(filter),
    ]);

    return { 
      notifications, 
      pagination: buildPaginationMeta(total, page, limit) 
    };
  }

  async markAsRead(id: string) {
    const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!notification) throw new NotFoundError('Notification');
    return notification;
  }

  async createNotification(data: any) {
    return await Notification.create(data);
  }
}

export const notificationService = new NotificationService();
