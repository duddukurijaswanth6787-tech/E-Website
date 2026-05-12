import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';
import { sendSuccess, sendPaginated } from '../../common/responses';
import { idempotencyLockService } from './idempotencyLock.service';

export class PaymentController {
  async getAllPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const { payments, pagination } = await paymentService.getAllPayments(req);
      sendPaginated(res, payments, pagination);
    } catch (err) { next(err); }
  }

  async getPaymentDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.getPaymentById(req.params.id as string);
      sendSuccess(res, payment);
    } catch (err) { next(err); }
  }

  async getPaymentAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await paymentService.getPaymentAnalytics();
      sendSuccess(res, analytics);
    } catch (err) { next(err); }
  }

  async markCODPaid(req: Request, res: Response, next: NextFunction) {
    try {
      const adminName = (req as any).user?.name || 'System Admin';
      const payment = await paymentService.markCODPaid(req.params.id as string, adminName);
      sendSuccess(res, payment);
    } catch (err) { next(err); }
  }

  async retryVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const adminName = (req as any).user?.name || 'System Admin';
      const payment = await paymentService.retryVerification(req.params.id as string, adminName);
      sendSuccess(res, payment);
    } catch (err) { next(err); }
  }

  async refundOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const paymentId = req.params.id as string;
      const adminName = (req as any).user?.name || 'System Admin';
      const { amount, reason } = req.body;

      const result = await idempotencyLockService.withLock(
        'refund',
        paymentId,
        async () => {
          return await paymentService.refundOrder(
            paymentId, 
            amount ? parseFloat(amount) : undefined, 
            reason, 
            adminName
          );
        },
        30000
      );

      if (!result.executed) {
        res.status(409).json({ success: false, error: result.error });
        return;
      }

      sendSuccess(res, result.result);
    } catch (err) { next(err); }
  }

  async updateNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const { notes } = req.body;
      const payment = await paymentService.updatePaymentNotes(req.params.id as string, notes);
      sendSuccess(res, payment);
    } catch (err) { next(err); }
  }

  async resendInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const adminName = (req as any).user?.name || 'System Admin';
      const result = await paymentService.triggerInvoiceResend(req.params.id as string, adminName);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }
}

export const paymentController = new PaymentController();
