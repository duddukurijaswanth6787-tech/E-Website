import { Request, Response } from 'express';
import { idempotencyLockService } from './idempotencyLock.service';
import { getRedisStatus } from '../../config/redis';
import { logger } from '../../common/logger';

export class IdempotencyController {
  /**
   * 1. Retrieve aggregated telemetry matrices tracking distributed duplicate prevention statistics
   */
  async getIdempotencyMetrics(_req: Request, res: Response): Promise<void> {
    try {
      const metrics = idempotencyLockService.getMetrics();
      const redisHealthStatus = getRedisStatus();

      res.status(200).json({
        success: true,
        data: {
          metrics,
          redisCluster: {
            status: redisHealthStatus.status,
            reconnectCount: redisHealthStatus.reconnectCount,
            lastPing: redisHealthStatus.lastPing,
            fallbackActive: redisHealthStatus.fallbackMode,
          },
          timestamp: new Date()
        }
      });
    } catch (err: any) {
      logger.error(`Idempotency inspection controller fault: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to aggregate target distributed lock telemetry indicators.' });
    }
  }

  /**
   * 2. Forcefully release a stuck concurrency mutex via Admin Dashboard controls
   */
  async forceClearMutexLock(req: Request, res: Response): Promise<void> {
    try {
      const { key } = req.body;
      const adminContext = (req as any).user?.name || (req as any).user?.email || 'System_Admin';

      if (!key || typeof key !== 'string') {
        res.status(400).json({ success: false, error: 'Target string identifier parameter [key] is missing or malformed.' });
        return;
      }

      logger.warn(`[Admin Mutex Clear: ${adminContext}] Overriding active lock boundaries for resource identifier: ${key}`);
      const cleared = await idempotencyLockService.forceClearLock(key);

      if (cleared) {
        res.status(200).json({ success: true, message: `Concurrency mutex for key [${key}] successfully unhooked.` });
      } else {
        res.status(400).json({ success: false, error: `Target key [${key}] active state un-resolvable or already cleared.` });
      }
    } catch (err: any) {
      logger.error(`Admin override mutex release drop: ${err.message}`);
      res.status(500).json({ success: false, error: err.message || 'Manual target release cycle blocked.' });
    }
  }
}

export const idempotencyController = new IdempotencyController();
