import { Request, Response } from 'express';
import { paymentReconciliationService } from './paymentReconciliation.service';
import { PaymentReconciliationLog } from './paymentReconciliation.model';
import { Order } from '../orders/order.model';
import { logger } from '../../common/logger';

export class ReconciliationController {
  /**
   * 1. Retrieve aggregated dashboard analytics metrics
   */
  async getReconciliationAnalytics(_req: Request, res: Response): Promise<void> {
    try {
      const totalRepaired = await PaymentReconciliationLog.countDocuments({ success: true });
      const totalFailed = await PaymentReconciliationLog.countDocuments({ success: false });
      const deadLetterCount = await PaymentReconciliationLog.countDocuments({ reconciliationType: 'dead_letter_drop' });
      const activePendingOrphans = await Order.countDocuments({
        paymentStatus: { $in: ['pending', 'failed'] },
        $or: [
          { razorpay_order_id: { $exists: true, $ne: null } },
          { razorpayOrderId: { $exists: true, $ne: null } }
        ]
      });

      res.status(200).json({
        success: true,
        data: {
          totalRepaired,
          totalFailed,
          deadLetterCount,
          activePendingOrphans,
          timestamp: new Date()
        }
      });
    } catch (err: any) {
      logger.error(`Reconciliation controller metrics fault: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to aggregate reconciliation matrices.' });
    }
  }

  /**
   * 2. Fetch paginated administration audit log history
   */
  async getReconciliationLogs(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);
      const typeFilter = req.query.type as string;
      const successFilter = req.query.success as string;

      const query: any = {};
      if (typeFilter) query.reconciliationType = typeFilter;
      if (successFilter !== undefined && successFilter !== '') {
        query.success = successFilter === 'true';
      }

      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        PaymentReconciliationLog.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('orderId', 'orderNumber total paymentStatus status user createdAt')
          .lean(),
        PaymentReconciliationLog.countDocuments(query)
      ]);

      res.status(200).json({
        success: true,
        data: logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err: any) {
      logger.error(`Reconciliation history controller fetch error: ${err.message}`);
      res.status(500).json({ success: false, error: 'Failed to resolve historical audit ledger matrices.' });
    }
  }

  /**
   * 3. Trigger manual on-demand order reconciliation validation passes
   */
  async triggerManualReconciliation(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const adminUserContext = (req as any).admin?.name || (req as any).admin?.email || 'Admin_UI_Dashboard';

      if (!orderId) {
        res.status(400).json({ success: false, error: 'Missing requested Order reference ID identifier.' });
        return;
      }

      const result = await paymentReconciliationService.executeManualOrderReconciliation(orderId as string, adminUserContext as string);

      res.status(200).json({ success: true, message: result.message });
    } catch (err: any) {
      logger.error(`Manual UI retry request trigger failure: ${err.message}`);
      res.status(500).json({ success: false, error: err.message || 'Manual Gateway verification cycle blocked.' });
    }
  }
}

export const reconciliationController = new ReconciliationController();
