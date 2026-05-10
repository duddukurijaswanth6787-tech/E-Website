import { Router } from 'express';
import { NotificationController } from './notification.controller';
import { protect } from '../../common/middlewares';

const router = Router();

// All notification routes require authentication
router.use(protect);

router.get('/', NotificationController.getHistory);
router.get('/unread-count', NotificationController.getUnreadCount);
router.patch('/mark-all-read', NotificationController.markAllRead);
router.patch('/:id/read', NotificationController.markRead);

export default router;
