import { Request, Response } from 'express';
import RetentionSettings from './retentionSettings.model';
import TemporaryActivity from './temporaryActivity.model';
import { CleanupService } from './cleanup.service';
import { sendSuccess } from '../../../common/responses';

export class RetentionController {
  /**
   * Get current retention settings and metrics
   */
  static async getSettings(req: Request, res: Response) {
    let settings = await RetentionSettings.findOne();
    if (!settings) {
      settings = await RetentionSettings.create({
        updatedBy: (req as any).user?.id || 'system',
        moduleSpecific: {
          wishlist: 7,
          liveVisitors: 1,
          recentOrders: 15,
          socialProof: 3,
          engagement: 7
        }
      });
    }

    const metrics = await CleanupService.getMetrics();

    return sendSuccess(res, { settings, metrics }, 'Retention settings retrieved');
  }

  /**
   * Update retention settings
   */
  static async updateSettings(req: Request, res: Response) {
    const { enableAutoDelete, globalRetentionDays, moduleSpecific } = req.body;

    let settings = await RetentionSettings.findOne();
    if (!settings) {
      settings = new RetentionSettings({ updatedBy: (req as any).user?.id });
    }

    if (enableAutoDelete !== undefined) settings.enableAutoDelete = enableAutoDelete;
    if (globalRetentionDays !== undefined) settings.globalRetentionDays = globalRetentionDays;
    if (moduleSpecific) settings.moduleSpecific = { ...settings.moduleSpecific, ...moduleSpecific };
    
    settings.updatedBy = (req as any).user?.id || 'system';
    await settings.save();

    return sendSuccess(res, settings, 'Retention settings updated');
  }

  /**
   * Trigger manual cleanup
   */
  static async triggerCleanup(req: Request, res: Response) {
    const result = await CleanupService.runAutoCleanup();
    return sendSuccess(res, result, 'Manual cleanup completed');
  }

  /**
   * Emergency purge
   */
  static async emergencyPurge(req: Request, res: Response) {
    const result = await CleanupService.emergencyPurge();
    return sendSuccess(res, result, 'Emergency purge completed');
  }

  /**
   * Fetch active activities for public display (Social Proof)
   */
  static async getActiveActivities(req: Request, res: Response) {
    const activities = await TemporaryActivity.find({
      expiresAt: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .limit(20);

    return sendSuccess(res, activities, 'Active activities retrieved');
  }
}
