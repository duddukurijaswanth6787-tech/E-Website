"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderController = exports.OrderController = void 0;
const order_service_1 = require("./order.service");
const responses_1 = require("../../common/responses");
class OrderController {
    async createOrder(req, res, next) {
        try {
            const order = await order_service_1.orderService.createOrder(req.user.userId, req.body);
            (0, responses_1.sendCreated)(res, order, 'Order placed successfully');
        }
        catch (err) {
            next(err);
        }
    }
    async createRazorpayOrder(req, res, next) {
        try {
            const result = await order_service_1.orderService.createRazorpayOrder(req.params.id, req.user.userId);
            (0, responses_1.sendSuccess)(res, result, 'Razorpay order created');
        }
        catch (err) {
            next(err);
        }
    }
    async verifyPayment(req, res, next) {
        try {
            const order = await order_service_1.orderService.verifyPayment({ ...req.body, userId: req.user.userId });
            (0, responses_1.sendSuccess)(res, order, 'Payment verified');
        }
        catch (err) {
            next(err);
        }
    }
    async getUserOrders(req, res, next) {
        try {
            const { orders, pagination } = await order_service_1.orderService.getUserOrders(req.user.userId, req);
            (0, responses_1.sendPaginated)(res, orders, pagination);
        }
        catch (err) {
            next(err);
        }
    }
    async getOrderDetail(req, res, next) {
        try {
            const order = await order_service_1.orderService.getOrderDetail(req.params.id, req.user.userId);
            (0, responses_1.sendSuccess)(res, order);
        }
        catch (err) {
            next(err);
        }
    }
    async cancelOrder(req, res, next) {
        try {
            const order = await order_service_1.orderService.cancelOrder(req.params.id, req.user.userId, req.body.reason || 'Cancelled by user');
            (0, responses_1.sendSuccess)(res, order, 'Order cancelled');
        }
        catch (err) {
            next(err);
        }
    }
    // Admin
    async getAllOrders(req, res, next) {
        try {
            const { orders, pagination } = await order_service_1.orderService.getAllOrders(req);
            (0, responses_1.sendPaginated)(res, orders, pagination);
        }
        catch (err) {
            next(err);
        }
    }
    async updateOrderStatus(req, res, next) {
        try {
            const order = await order_service_1.orderService.updateOrderStatus(req.params.id, req.body.status, req.body.note || '', req.admin.adminId);
            (0, responses_1.sendSuccess)(res, order, 'Order status updated');
        }
        catch (err) {
            next(err);
        }
    }
}
exports.OrderController = OrderController;
exports.orderController = new OrderController();
//# sourceMappingURL=order.controller.js.map