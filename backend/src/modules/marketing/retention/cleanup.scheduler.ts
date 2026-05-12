import { CleanupService } from './cleanup.service';
import { logger } from '../../../common/logger';

export class CleanupScheduler {
  private static interval: NodeJS.Timeout | null = null;
  
  /**
   * Initialize the cleanup scheduler.
   * Runs every 24 hours by default.
   */
  static init(intervalMs: number = 24 * 60 * 60 * 1000) {
    if (this.interval) {
      logger.warn('[CleanupScheduler] Scheduler is already running.');
      return;
    }

    logger.info('[CleanupScheduler] Initializing Temporary Activity Cleanup Scheduler...');
    
    // Run once on startup after a short delay
    setTimeout(() => {
      this.run();
    }, 10000);

    this.interval = setInterval(() => {
      this.run();
    }, intervalMs);
  }

  static async run() {
    logger.info('[CleanupScheduler] Starting scheduled cleanup job...');
    try {
      const result = await CleanupService.runAutoCleanup();
      if (result) {
        logger.info(`[CleanupScheduler] Scheduled cleanup successful. Deleted ${result.deletedCount} records.`);
      }
    } catch (error) {
      logger.error(`[CleanupScheduler] Scheduled cleanup job failed: ${(error as Error).message}`);
    }
  }

  static stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      logger.info('[CleanupScheduler] Scheduler stopped.');
    }
  }
}
