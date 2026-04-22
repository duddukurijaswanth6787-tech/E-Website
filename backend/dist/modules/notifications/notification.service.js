"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationService = exports.NotificationService = void 0;
const notification_model_1 = require("./notification.model");
const pagination_1 = require("../../common/utils/pagination");
const errors_1 = require("../../common/errors");
class NotificationService {
    async getAllNotifications(req) {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req);
        const filter = {};
        if (req.query.user)
            filter.user = req.query.user;
        if (req.query.type)
            filter.type = req.query.type;
        if (req.query.channel)
            filter.channel = req.query.channel;
        if (req.query.isRead)
            filter.isRead = req.query.isRead === 'true';
        const [notifications, total] = await Promise.all([
            notification_model_1.Notification.find(filter)
                .populate('user', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            notification_model_1.Notification.countDocuments(filter),
        ]);
        return {
            notifications,
            pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit)
        };
    }
    async markAsRead(id) {
        const notification = await notification_model_1.Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
        if (!notification)
            throw new errors_1.NotFoundError('Notification');
        return notification;
    }
    async createNotification(data) {
        return await notification_model_1.Notification.create(data);
    }
}
exports.NotificationService = NotificationService;
exports.notificationService = new NotificationService();
//# sourceMappingURL=notification.service.js.map