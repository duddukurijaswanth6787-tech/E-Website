"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productController = exports.ProductController = void 0;
const product_service_1 = require("./product.service");
const responses_1 = require("../../common/responses");
class ProductController {
    async create(req, res, next) {
        try {
            const product = await product_service_1.productService.create(req.body, req.admin.adminId);
            (0, responses_1.sendCreated)(res, product, 'Product created successfully');
        }
        catch (err) {
            next(err);
        }
    }
    async getAll(req, res, next) {
        try {
            const { products, pagination } = await product_service_1.productService.getAll(req);
            (0, responses_1.sendPaginated)(res, products, pagination);
        }
        catch (err) {
            next(err);
        }
    }
    async getBySlug(req, res, next) {
        try {
            const product = await product_service_1.productService.getBySlug(req.params.slug);
            (0, responses_1.sendSuccess)(res, product);
        }
        catch (err) {
            next(err);
        }
    }
    async getById(req, res, next) {
        try {
            const product = await product_service_1.productService.getById(req.params.id);
            (0, responses_1.sendSuccess)(res, product);
        }
        catch (err) {
            next(err);
        }
    }
    async update(req, res, next) {
        try {
            const product = await product_service_1.productService.update(req.params.id, req.body, req.admin.adminId);
            (0, responses_1.sendSuccess)(res, product, 'Product updated successfully');
        }
        catch (err) {
            next(err);
        }
    }
    async delete(req, res, next) {
        try {
            await product_service_1.productService.delete(req.params.id);
            (0, responses_1.sendNoContent)(res);
        }
        catch (err) {
            next(err);
        }
    }
    async getFeatured(req, res, next) {
        try {
            const products = await product_service_1.productService.getFeatured();
            (0, responses_1.sendSuccess)(res, products);
        }
        catch (err) {
            next(err);
        }
    }
    async getTrending(req, res, next) {
        try {
            const products = await product_service_1.productService.getTrending();
            (0, responses_1.sendSuccess)(res, products);
        }
        catch (err) {
            next(err);
        }
    }
    async getRelated(req, res, next) {
        try {
            const products = await product_service_1.productService.getRelated(req.params.id, req.query.category);
            (0, responses_1.sendSuccess)(res, products);
        }
        catch (err) {
            next(err);
        }
    }
    async getLowStock(req, res, next) {
        try {
            const products = await product_service_1.productService.getLowStock();
            (0, responses_1.sendSuccess)(res, products);
        }
        catch (err) {
            next(err);
        }
    }
}
exports.ProductController = ProductController;
exports.productController = new ProductController();
//# sourceMappingURL=product.controller.js.map