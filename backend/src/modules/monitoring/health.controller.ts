import { Request, Response } from 'express';
import { MonitoringService } from './monitoring.service';
import { sendSuccess } from '../../common/responses';

export class HealthController {
  /**
   * Get detailed system health for admin dashboard
   */
  static async getDetailedHealth(req: Request, res: Response) {
    const metrics = await MonitoringService.getHealthMetrics();
    return sendSuccess(res, metrics, 'System health metrics retrieved');
  }

  /**
   * Public health check (simplified)
   */
  static async ping(req: Request, res: Response) {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString()
    });
  }
}
