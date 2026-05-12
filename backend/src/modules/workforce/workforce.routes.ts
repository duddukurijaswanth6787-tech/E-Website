import { Router } from 'express';
import * as workforceController from './workforce.controller';
import { getOperationsOverview } from './operations.controller';
import { authenticateUser, authenticateAdmin, authenticateAdminOrManager } from '../../common/middlewares/auth.middleware';

const router = Router();

// Live status updates (accessible by all employees)
router.patch('/status', authenticateUser, workforceController.updateStatus);

// Workforce overview (Admin only for full visibility)
router.get('/overview', authenticateAdmin, workforceController.getWorkforceOverview);

// Operations command center (Admin & Manager accessible)
router.get('/operations-intelligence', authenticateAdminOrManager, getOperationsOverview);

export default router;
