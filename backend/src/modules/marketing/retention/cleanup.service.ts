import TemporaryActivity from './temporaryActivity.model';
import RetentionSettings from './retentionSettings.model';
import { logger } from '../../../common/logger';

export class CleanupService {
  /**
   * Ensure default retention settings exist in the database.
   * Called on first boot so the scheduler is never blocked.
   */
  static async ensureDefaultSettings() {
    const existing = await RetentionSettings.findOne();
    if (!existing) {
      await RetentionSettings.create({
        enableAutoDelete: true,
        globalRetentionDays: 7,
        moduleSpecific: {
          wishlist: 7,
          liveVisitors: 1,
          recentOrders: 15,
          socialProof: 3,
          engagement: 7
        },
        updatedBy: 'system'
      });
      logger.info('[CleanupService] Default retention settings created (enableAutoDelete: true, 7 days).');
    }
    return RetentionSettings.findOne();
  }

  /**
   * Run the automatic cleanup process
   */
  static async runAutoCleanup() {
    try {
      const settings = await CleanupService.ensureDefaultSettings();
      if (!settings || !settings.enableAutoDelete) {
        logger.info('[CleanupService] Auto-delete is disabled by admin. Skipping cleanup.');
        return;
      }

      const now = new Date();
      const result = await TemporaryActivity.deleteMany({
        expiresAt: { $lt: now },
        autoDeleteEnabled: true
      });

      settings.lastCleanupAt = now;
      await settings.save();

      logger.info(`[CleanupService] Auto-cleanup completed. Deleted ${result.deletedCount} expired records.`);
      return result;
    } catch (error) {
      logger.error(`[CleanupService] Auto-cleanup failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Emergency purge all temporary activities
   */
  static async emergencyPurge() {
    try {
      const result = await TemporaryActivity.deleteMany({});
      logger.warn(`[CleanupService] EMERGENCY PURGE: Deleted ${result.deletedCount} records.`);
      return result;
    } catch (error) {
      logger.error(`[CleanupService] Emergency purge failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Get storage metrics for temporary activities
   */
  static async getMetrics() {
    const totalCount = await TemporaryActivity.countDocuments();
    const expiredCount = await TemporaryActivity.countDocuments({ expiresAt: { $lt: new Date() } });
    const moduleStats = await TemporaryActivity.aggregate([
      { $group: { _id: '$module', count: { $sum: 1 } } }
    ]);

    return {
      totalCount,
      expiredCount,
      moduleStats,
      lastCleanup: (await RetentionSettings.findOne())?.lastCleanupAt
    };
  }

  /**
   * Utility to add a new temporary activity with correct expiration
   */
  static async recordActivity(data: {
    type: 'order' | 'view' | 'wishlist' | 'engagement' | 'visitor',
    title: string,
    customerName: string,
    location?: string,
    module: keyof IRetentionSettings['moduleSpecific'] | string,
    metadata?: any
  }) {
    const settings = await RetentionSettings.findOne();
    const retentionDays = (settings?.moduleSpecific as any)?.[data.module] || settings?.globalRetentionDays || 7;
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + retentionDays);

    return await TemporaryActivity.create({
      activityType: data.type,
      title: data.title,
      customerDisplayName: data.customerName,
      location: data.location || 'Hyderabad, India',
      module: data.module,
      metadata: data.metadata,
      retentionDays,
      expiresAt,
      autoDeleteEnabled: settings?.enableAutoDelete ?? true
    });
  }
}

// Interface helper for typing
interface IRetentionSettings {
  moduleSpecific: {
    wishlist: number;
    liveVisitors: number;
    recentOrders: number;
    socialProof: number;
    engagement: number;
  };
  globalRetentionDays: number;
  enableAutoDelete: boolean;
}
