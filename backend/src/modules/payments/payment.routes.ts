import { Router } from 'express';
import { paymentController } from './payment.controller';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { PERMISSIONS } from '../../common/constants';

const router = Router();

// ADMIN ROUTES
router.get('/admin',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_PAYMENTS),
  paymentController.getAllPayments.bind(paymentController),
);

router.get('/:id',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_PAYMENTS),
  paymentController.getPaymentDetail.bind(paymentController),
);

export default router;
