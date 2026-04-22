"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const middlewares_1 = require("../../common/middlewares");
const constants_1 = require("../../common/constants");
const router = (0, express_1.Router)();
// ADMIN ROUTES
router.get('/admin', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_NOTIFICATIONS), notification_controller_1.notificationController.getAllNotifications.bind(notification_controller_1.notificationController));
router.post('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_NOTIFICATIONS), notification_controller_1.notificationController.createNotification.bind(notification_controller_1.notificationController));
router.patch('/:id/read', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_NOTIFICATIONS), notification_controller_1.notificationController.markAsRead.bind(notification_controller_1.notificationController));
exports.default = router;
//# sourceMappingURL=notification.routes.js.map