import crypto from 'crypto';
import { paymentReconciliationService } from '../modules/reconciliation/paymentReconciliation.service';
import { logger } from '../common/logger';

export class PaymentReconciliationWorker {
  private workerFingerprint: string;
  private isRunning: boolean = false;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    // Generate distinct pseudo-random worker signature mapping specific loop context
    this.workerFingerprint = `worker_${crypto.randomUUID().substring(0, 8)}`;
  }

  /**
   * Initialize infinite polling cycle triggered during core HTTP application boot
   */
  startWorkerLoop(): void {
    const isEnabled = (process.env.RECONCILIATION_ENABLED ?? 'true').toLowerCase() === 'true';
    const intervalMs = parseInt(process.env.RECONCILIATION_INTERVAL_MS || '300000', 10); // Default 5 minutes

    if (!isEnabled) {
      logger.info(`[Reconciliation Worker: ${this.workerFingerprint}] Initial boot bypassed: Environmental flag set to disabled.`);
      return;
    }

    logger.info(`[Reconciliation Worker: ${this.workerFingerprint}] Standalone polling schedule registered. Execution cadence: ${intervalMs}ms`);

    // Bootstrap first immediate verification check pass after safe initial startup delays
    this.timer = setTimeout(() => this.executionCycle(intervalMs), 15000);
  }

  /**
   * Internal recursive async cycle wrapped safely inside exception isolation catches
   */
  private async executionCycle(intervalMs: number): Promise<void> {
    if (this.isRunning) {
      logger.info(`[Reconciliation Worker: ${this.workerFingerprint}] Previous execution pass actively running. Re-queueing subsequent iterations.`);
      this.timer = setTimeout(() => this.executionCycle(intervalMs), intervalMs);
      return;
    }

    this.isRunning = true;

    try {
      // Delegate strict catalog verification logic straight down into primary services
      await paymentReconciliationService.scanSuspiciousOrders(this.workerFingerprint);
    } catch (workerErr: any) {
      // CRITICAL: Catch all thrown exceptions cleanly ensuring background process survives indefinitely
      logger.error(`[Reconciliation Worker Drop: ${this.workerFingerprint}] Uncaught polling failure: ${workerErr.message}`);
    } finally {
      // Release current loop execution markers
      this.isRunning = false;
      // Re-trigger subsequent iterations indefinitely
      this.timer = setTimeout(() => this.executionCycle(intervalMs), intervalMs);
    }
  }

  /**
   * Clean shutdown utility support for graceful service halts
   */
  stopWorkerLoop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
      logger.info(`[Reconciliation Worker: ${this.workerFingerprint}] Active loops cleared gracefully.`);
    }
  }
}

export const paymentReconciliationWorker = new PaymentReconciliationWorker();
