import { Payment } from './payment.model';
import { Request } from 'express';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination';
import { NotFoundError } from '../../common/errors';

export class PaymentService {
  async getAllPayments(req: Request) {
    const { page, limit, skip } = parsePagination(req);
    const filter: Record<string, any> = {};
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.provider) filter.provider = req.query.provider;
    if (req.query.search) {
      filter.$or = [
        { razorpayOrderId: new RegExp(req.query.search as string, 'i') },
        { razorpayPaymentId: new RegExp(req.query.search as string, 'i') },
      ];
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('user', 'name email')
        .populate('order', 'orderNumber total status')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Payment.countDocuments(filter),
    ]);

    return { 
      payments, 
      pagination: buildPaginationMeta(total, page, limit) 
    };
  }

  async getPaymentById(id: string) {
    const payment = await Payment.findById(id)
      .populate('user', 'name email mobile')
      .populate('order', 'orderNumber items total status address timeline');
    if (!payment) throw new NotFoundError('Payment Record');
    return payment;
  }
}

export const paymentService = new PaymentService();
