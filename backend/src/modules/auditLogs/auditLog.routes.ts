import { Router } from 'express';
import * as auditLogController from './auditLog.controller';
import { authenticateAdmin } from '../../common/middlewares/auth.middleware';

const router = Router();

// Only Super Admins can see the full audit stream.
// Admins can see operational logs.
// Managers are scoped to branch (handled in controller).
router.get('/', authenticateAdmin, auditLogController.getAuditLogs);
router.get('/stats', authenticateAdmin, auditLogController.getAuditStats);
router.get('/:id', authenticateAdmin, auditLogController.getAuditLogById);

export default router;
