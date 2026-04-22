"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentController = exports.PaymentController = void 0;
const payment_service_1 = require("./payment.service");
const responses_1 = require("../../common/responses");
class PaymentController {
    async getAllPayments(req, res, next) {
        try {
            const { payments, pagination } = await payment_service_1.paymentService.getAllPayments(req);
            (0, responses_1.sendPaginated)(res, payments, pagination);
        }
        catch (err) {
            next(err);
        }
    }
    async getPaymentDetail(req, res, next) {
        try {
            const payment = await payment_service_1.paymentService.getPaymentById(req.params.id);
            (0, responses_1.sendSuccess)(res, payment);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.PaymentController = PaymentController;
exports.paymentController = new PaymentController();
//# sourceMappingURL=payment.controller.js.map