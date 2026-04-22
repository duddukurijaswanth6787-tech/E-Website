import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';
import { sendSuccess, sendPaginated } from '../../common/responses';

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
}

export const paymentController = new PaymentController();
