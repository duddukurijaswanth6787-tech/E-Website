"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
const payment_model_1 = require("./payment.model");
const pagination_1 = require("../../common/utils/pagination");
const errors_1 = require("../../common/errors");
class PaymentService {
    async getAllPayments(req) {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req);
        const filter = {};
        if (req.query.status)
            filter.status = req.query.status;
        if (req.query.provider)
            filter.provider = req.query.provider;
        if (req.query.search) {
            filter.$or = [
                { razorpayOrderId: new RegExp(req.query.search, 'i') },
                { razorpayPaymentId: new RegExp(req.query.search, 'i') },
            ];
        }
        const [payments, total] = await Promise.all([
            payment_model_1.Payment.find(filter)
                .populate('user', 'name email')
                .populate('order', 'orderNumber total status')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            payment_model_1.Payment.countDocuments(filter),
        ]);
        return {
            payments,
            pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit)
        };
    }
    async getPaymentById(id) {
        const payment = await payment_model_1.Payment.findById(id)
            .populate('user', 'name email mobile')
            .populate('order', 'orderNumber items total status address timeline');
        if (!payment)
            throw new errors_1.NotFoundError('Payment Record');
        return payment;
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
//# sourceMappingURL=payment.service.js.map