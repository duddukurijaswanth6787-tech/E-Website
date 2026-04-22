"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const order_controller_1 = require("./order.controller");
const middlewares_1 = require("../../common/middlewares");
const constants_1 = require("../../common/constants");
const router = (0, express_1.Router)();
// ====== USER ROUTES ======
router.post('/', middlewares_1.authenticateUser, order_controller_1.orderController.createOrder.bind(order_controller_1.orderController));
router.get('/my', middlewares_1.authenticateUser, order_controller_1.orderController.getUserOrders.bind(order_controller_1.orderController));
router.get('/my/:id', middlewares_1.authenticateUser, order_controller_1.orderController.getOrderDetail.bind(order_controller_1.orderController));
router.post('/my/:id/cancel', middlewares_1.authenticateUser, order_controller_1.orderController.cancelOrder.bind(order_controller_1.orderController));
router.post('/:id/razorpay', middlewares_1.authenticateUser, order_controller_1.orderController.createRazorpayOrder.bind(order_controller_1.orderController));
router.post('/verify-payment', middlewares_1.authenticateUser, order_controller_1.orderController.verifyPayment.bind(order_controller_1.orderController));
// ====== ADMIN ROUTES ======
router.get('/admin', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_ORDERS), order_controller_1.orderController.getAllOrders.bind(order_controller_1.orderController));
router.patch('/admin/:id/status', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_ORDERS), order_controller_1.orderController.updateOrderStatus.bind(order_controller_1.orderController));
exports.default = router;
//# sourceMappingURL=order.routes.js.map