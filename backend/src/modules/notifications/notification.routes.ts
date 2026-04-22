import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { PERMISSIONS } from '../../common/constants';

const router = Router();

// ADMIN ROUTES
router.get('/admin',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_NOTIFICATIONS),
  notificationController.getAllNotifications.bind(notificationController),
);

router.post('/',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_NOTIFICATIONS),
  notificationController.createNotification.bind(notificationController),
);

router.patch('/:id/read',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_NOTIFICATIONS),
  notificationController.markAsRead.bind(notificationController),
);

export default router;
