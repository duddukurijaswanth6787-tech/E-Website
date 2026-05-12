import { Router } from 'express';
import { paymentController } from './payment.controller';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { PERMISSIONS } from '../../common/constants';

const router = Router();

// ADMIN ROUTES
router.get('/admin/analytics',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_PAYMENTS),
  paymentController.getPaymentAnalytics.bind(paymentController),
);

router.get('/analytics',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_PAYMENTS),
  paymentController.getPaymentAnalytics.bind(paymentController),
);

router.get('/admin',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_PAYMENTS),
  paymentController.getAllPayments.bind(paymentController),
);

router.patch('/:id/cod-paid',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_PAYMENTS),
  paymentController.markCODPaid.bind(paymentController),
);

router.post('/:id/retry',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_PAYMENTS),
  paymentController.retryVerification.bind(paymentController),
);

router.post('/:id/refund',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_PAYMENTS),
  paymentController.refundOrder.bind(paymentController),
);

router.patch('/:id/notes',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_PAYMENTS),
  paymentController.updateNotes.bind(paymentController),
);

router.post('/:id/invoice',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_PAYMENTS),
  paymentController.resendInvoice.bind(paymentController),
);

router.get('/:id',
  authenticateAdmin, requirePermission(PERMISSIONS.MANAGE_PAYMENTS),
  paymentController.getPaymentDetail.bind(paymentController),
);

export default router;
