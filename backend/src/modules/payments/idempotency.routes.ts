import { Router } from 'express';
import { idempotencyController } from './idempotency.controller';
import { authenticateAdmin, requirePermission } from '../../common/middlewares';
import { PERMISSIONS } from '../../common/constants';

const router = Router();

// Secure Administration Endpoints mapped under base: /api/v1/admin/idempotency
router.get(
  '/metrics',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_PAYMENTS),
  idempotencyController.getIdempotencyMetrics.bind(idempotencyController)
);

router.post(
  '/clear-lock',
  authenticateAdmin,
  requirePermission(PERMISSIONS.MANAGE_PAYMENTS),
  idempotencyController.forceClearMutexLock.bind(idempotencyController)
);

export default router;
