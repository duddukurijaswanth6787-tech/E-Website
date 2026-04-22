"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const product_controller_1 = require("./product.controller");
const middlewares_1 = require("../../common/middlewares");
const constants_1 = require("../../common/constants");
const router = (0, express_1.Router)();
// ========== PUBLIC ROUTES ==========
router.get('/', product_controller_1.productController.getAll.bind(product_controller_1.productController));
router.get('/featured', product_controller_1.productController.getFeatured.bind(product_controller_1.productController));
router.get('/trending', product_controller_1.productController.getTrending.bind(product_controller_1.productController));
router.get('/slug/:slug', product_controller_1.productController.getBySlug.bind(product_controller_1.productController));
router.get('/:id/related', product_controller_1.productController.getRelated.bind(product_controller_1.productController));
// ========== ADMIN ROUTES ==========
router.get('/admin/all', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_PRODUCTS), product_controller_1.productController.getAll.bind(product_controller_1.productController));
router.get('/admin/low-stock', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_PRODUCTS), product_controller_1.productController.getLowStock.bind(product_controller_1.productController));
router.get('/admin/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_PRODUCTS), product_controller_1.productController.getById.bind(product_controller_1.productController));
router.post('/', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_PRODUCTS), product_controller_1.productController.create.bind(product_controller_1.productController));
router.put('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_PRODUCTS), product_controller_1.productController.update.bind(product_controller_1.productController));
router.delete('/:id', middlewares_1.authenticateAdmin, (0, middlewares_1.requirePermission)(constants_1.PERMISSIONS.MANAGE_PRODUCTS), product_controller_1.productController.delete.bind(product_controller_1.productController));
exports.default = router;
//# sourceMappingURL=product.routes.js.map