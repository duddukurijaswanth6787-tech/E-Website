import { Router } from 'express';
import { reconciliationController } from './reconciliation.controller';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { PERMISSIONS } from '../../common/constants';

const router = Router();

// Secure Administration Endpoints mapping reconciliation inspection parameters
router.get(
  '/analytics',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_PAYMENTS),
  reconciliationController.getReconciliationAnalytics.bind(reconciliationController)
);

router.get(
  '/logs',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_PAYMENTS),
  reconciliationController.getReconciliationLogs.bind(reconciliationController)
);

router.post(
  '/:orderId/retry',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_PAYMENTS),
  reconciliationController.triggerManualReconciliation.bind(reconciliationController)
);

export default router;
