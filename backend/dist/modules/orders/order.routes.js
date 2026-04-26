"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
// ADMIN: Single order detail (with populated user, items, addresses)
router.get('/admin/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_ORDERS), async (req, res, next) => {
    try {
        const { Order } = await Promise.resolve().then(() => __importStar(require('./order.model')));
        const order = await Order.findById(req.params.id)
            .populate('user', 'name email mobile avatar createdAt')
            .lean();
        if (!order) {
            const { NotFoundError } = await Promise.resolve().then(() => __importStar(require('../../common/errors')));
            throw new NotFoundError('Order');
        }
        const { sendSuccess } = await Promise.resolve().then(() => __importStar(require('../../common/responses')));
        sendSuccess(res, order);
    }
    catch (err) {
        next(err);
    }
});
router.patch('/admin/:id/status', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_ORDERS), order_controller_1.orderController.updateOrderStatus.bind(order_controller_1.orderController));
exports.default = router;
//# sourceMappingURL=order.routes.js.map