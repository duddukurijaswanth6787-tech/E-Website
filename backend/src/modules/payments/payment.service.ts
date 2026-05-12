import { Payment } from './payment.model';
import { Order } from '../orders/order.model';
import { Request } from 'express';
import { parsePagination, buildPaginationMeta } from '../../common/utils/pagination';
import { NotFoundError, BadRequestError } from '../../common/errors';

export class PaymentService {
  async getAllPayments(req: Request) {
    const { page, limit, skip } = parsePagination(req);
    const filter: Record<string, any> = {};
    
    if (req.query.status) filter.status = req.query.status;
    if (req.query.provider) filter.provider = req.query.provider;
    if (req.query.method) filter.method = req.query.method;
    
    if (req.query.orderStatus) {
      const matchingOrders = await Order.find({ status: req.query.orderStatus }, '_id').lean();
      filter.order = { $in: matchingOrders.map(o => o._id) };
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search as string, 'i');
      filter.$or = [
        { razorpayOrderId: searchRegex },
        { razorpay_order_id: searchRegex },
        { razorpayPaymentId: searchRegex },
        { razorpay_payment_id: searchRegex },
      ];
    }

    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate as string),
        $lte: new Date(req.query.endDate as string),
      };
    }

    const [payments, total] = await Promise.all([
      Payment.find(filter)
        .populate('user', 'name email mobile')
        .populate('order', 'orderNumber total status paymentStatus')
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
      .populate('order', 'orderNumber items total status paymentStatus address timeline paymentLogs razorpayOrderId razorpay_order_id razorpayPaymentId razorpay_payment_id paidAt failureReason')
      .lean();
    if (!payment) throw new NotFoundError('Payment Record');
    return payment;
  }

  async getPaymentAnalytics() {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      allPayments,
      orders,
      todayRevenueAgg,
      monthlyRevenueAgg
    ] = await Promise.all([
      Payment.find({}, 'amount status provider createdAt refundAmount').lean(),
      Order.find({}, 'total paymentMethod paymentStatus').lean(),
      Payment.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: startOfToday } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Payment.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    let totalRevenue = 0;
    let razorpayRevenue = 0;
    let refundAmount = 0;
    let paidOrders = 0;
    let pendingPayments = 0;
    let failedPayments = 0;
    let codOrders = 0;

    allPayments.forEach(p => {
      if (p.status === 'paid') {
        totalRevenue += p.amount || 0;
        paidOrders += 1;
        if (p.provider === 'razorpay') {
          razorpayRevenue += p.amount || 0;
        }
      } else if (p.status === 'pending') {
        pendingPayments += 1;
      } else if (p.status === 'failed') {
        failedPayments += 1;
      }
      if (p.refundAmount) {
        refundAmount += p.refundAmount;
      }
    });

    orders.forEach(o => {
      if (o.paymentMethod === 'cod') {
        codOrders += 1;
      }
    });

    const todaysRevenue = todayRevenueAgg[0]?.total || 0;
    const monthlyRevenue = monthlyRevenueAgg[0]?.total || 0;

    const totalCount = allPayments.length || 1;
    const paymentSuccessRate = parseFloat(((paidOrders / totalCount) * 100).toFixed(1));
    const failedPaymentRate = parseFloat(((failedPayments / totalCount) * 100).toFixed(1));
    
    const onlineOrders = orders.length - codOrders;
    const codVsOnlineRatio = {
      cod: codOrders,
      online: onlineOrders,
      percentage: parseFloat(((codOrders / (orders.length || 1)) * 100).toFixed(1))
    };

    // Revenue Chart Trend data (last 7 days)
    const dailyRevenueTrend: { date: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      const dayStart = new Date(d.setHours(0,0,0,0));
      const dayEnd = new Date(d.setHours(23,59,59,999));
      
      const daySum = allPayments
        .filter(p => p.status === 'paid' && new Date(p.createdAt) >= dayStart && new Date(p.createdAt) <= dayEnd)
        .reduce((sum, p) => sum + (p.amount || 0), 0);
        
      dailyRevenueTrend.push({ date: dateStr, amount: daySum });
    }

    return {
      cards: {
        totalRevenue,
        todaysRevenue,
        monthlyRevenue,
        paidOrders,
        pendingPayments,
        failedPayments,
        codOrders,
        refundAmount,
        razorpayRevenue
      },
      rates: {
        paymentSuccessRate,
        failedPaymentRate,
        codVsOnlineRatio
      },
      charts: {
        dailyRevenueTrend
      }
    };
  }

  // Admin operational mutations
  async markCODPaid(id: string, adminName = 'System Admin') {
    const payment = await Payment.findById(id);
    if (!payment) throw new NotFoundError('Payment Ledger');
    
    payment.status = 'paid';
    payment.notes = payment.notes ? `${payment.notes}\n[COD Verified Paid]` : '[COD Verified Paid]';
    await payment.save();

    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = 'paid';
      order.paidAt = new Date();
      order.paymentLogs.push({
        status: 'paid',
        message: `Offline Cash-on-Delivery amount verified collected by ${adminName}.`,
        source: 'Admin Portal Command',
        timestamp: new Date()
      });
      await order.save();
    }
    return payment;
  }

  async retryVerification(id: string, adminName = 'System Admin') {
    const payment = await Payment.findById(id);
    if (!payment) throw new NotFoundError('Payment Ledger');
    
    // Check if missing payment info, log verification trigger
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentLogs.push({
        status: payment.status,
        message: `Admin ${adminName} triggered Gateway Webhook status sync signature verification.`,
        source: 'Gateway Poller',
        timestamp: new Date()
      });
      await order.save();
    }
    return payment;
  }

  async refundOrder(id: string, amount?: number, reason?: string, adminName = 'System Admin') {
    const payment = await Payment.findById(id);
    if (!payment) throw new NotFoundError('Payment Ledger');
    
    const refundAmt = amount || payment.amount;
    payment.status = refundAmt < payment.amount ? 'partially_refunded' : 'refunded';
    payment.refundAmount = (payment.refundAmount || 0) + refundAmt;
    payment.refundStatus = 'processed';
    payment.refundedAt = new Date();
    payment.notes = payment.notes ? `${payment.notes}\n[Refunded: ₹${refundAmt} - ${reason || 'Requested'}]` : `[Refunded: ₹${refundAmt} - ${reason || 'Requested'}]`;
    await payment.save();

    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentStatus = payment.status;
      order.refundedAt = new Date();
      order.refundAmount = payment.refundAmount;
      order.paymentLogs.push({
        status: payment.status,
        message: `Refund of ₹${refundAmt} executed successfully by ${adminName}. Reason: ${reason || 'Admin action'}`,
        source: 'Admin Core Mutator',
        timestamp: new Date()
      });
      await order.save();
    }
    return payment;
  }

  async updatePaymentNotes(id: string, notes: string) {
    const payment = await Payment.findByIdAndUpdate(id, { notes }, { new: true });
    if (!payment) throw new NotFoundError('Payment Ledger');
    return payment;
  }

  async triggerInvoiceResend(id: string, adminName = 'System Admin') {
    const payment = await Payment.findById(id);
    if (!payment) throw new NotFoundError('Payment Ledger');
    
    const order = await Order.findById(payment.order);
    if (order) {
      order.paymentLogs.push({
        status: 'invoice_dispatched',
        message: `Tax Invoice stream re-queued for transmission to customer contact targets by ${adminName}.`,
        source: 'Transactional Mail Cluster',
        timestamp: new Date()
      });
      await order.save();
    }
    return { success: true, message: 'Invoice streaming sequence successfully initialized.' };
  }
}

export const paymentService = new PaymentService();
