"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const notification_service_1 = require("./notification.service");
const responses_1 = require("../../common/responses");
class NotificationController {
    async getAllNotifications(req, res, next) {
        try {
            const { notifications, pagination } = await notification_service_1.notificationService.getAllNotifications(req);
            (0, responses_1.sendPaginated)(res, notifications, pagination);
        }
        catch (err) {
            next(err);
        }
    }
    async markAsRead(req, res, next) {
        try {
            const notification = await notification_service_1.notificationService.markAsRead(req.params.id);
            (0, responses_1.sendSuccess)(res, notification, 'Notification marked as read');
        }
        catch (err) {
            next(err);
        }
    }
    async createNotification(req, res, next) {
        try {
            const notification = await notification_service_1.notificationService.createNotification(req.body);
            (0, responses_1.sendCreated)(res, notification, 'Notification dispatched');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.NotificationController = NotificationController;
exports.notificationController = new NotificationController();
//# sourceMappingURL=notification.controller.js.map