import { Router } from 'express';
import { orderController } from './order.controller';
import { authenticateUser, authenticateAdmin, requirePermission } from '../../common/middlewares';
import { PERMISSIONS } from '../../common/constants';

const router = Router();

// ====== USER ROUTES ======
router.post('/', authenticateUser, orderController.createOrder.bind(orderController));
router.get('/my', authenticateUser, orderController.getUserOrders.bind(orderController));
router.get('/my/:id', authenticateUser, orderController.getOrderDetail.bind(orderController));
router.post('/my/:id/cancel', authenticateUser, orderController.cancelOrder.bind(orderController));
router.post('/:id/razorpay', authenticateUser, orderController.createRazorpayOrder.bind(orderController));
router.post('/verify-payment', authenticateUser, orderController.verifyPayment.bind(orderController));

// ====== ADMIN ROUTES ======
router.get('/admin',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_ORDERS),
  orderController.getAllOrders.bind(orderController),
);

router.get('/admin/:id',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_ORDERS),
  orderController.getAdminOrderDetail.bind(orderController),
);

router.patch('/admin/:id/status',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_ORDERS),
  orderController.updateOrderStatus.bind(orderController),
);

router.patch('/admin/:id/payment-status',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_ORDERS),
  orderController.updatePaymentStatus.bind(orderController),
);

export default router;
