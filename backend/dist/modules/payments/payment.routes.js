"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const middlewares_1 = require("../../common/middlewares");
const constants_1 = require("../../common/constants");
const router = (0, express_1.Router)();
// ADMIN ROUTES
router.get('/admin', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_PAYMENTS), payment_controller_1.paymentController.getAllPayments.bind(payment_controller_1.paymentController));
router.get('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_PAYMENTS), payment_controller_1.paymentController.getPaymentDetail.bind(payment_controller_1.paymentController));
exports.default = router;
//# sourceMappingURL=payment.routes.js.map