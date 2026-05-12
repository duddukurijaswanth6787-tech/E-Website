import { Router } from 'express';
import { HealthController } from './health.controller';
import { authenticateAdmin } from '../../common/middlewares';

const router = Router();

// Public Ping
router.get('/ping', HealthController.ping);

// Protected Admin Metrics
router.use(authenticateAdmin);
router.get('/metrics', HealthController.getDetailedHealth);

export default router;
