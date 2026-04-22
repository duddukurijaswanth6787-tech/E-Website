"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productService = exports.ProductService = void 0;
const product_model_1 = require("./product.model");
const category_model_1 = require("../categories/category.model");
const errors_1 = require("../../common/errors");
const helpers_1 = require("../../common/utils/helpers");
const pagination_1 = require("../../common/utils/pagination");
class ProductService {
    async create(data, adminId) {
        const category = await category_model_1.Category.findById(data.category);
        if (!category)
            throw new errors_1.BadRequestError('Invalid category');
        const slug = await (0, helpers_1.generateUniqueSlug)(data.name, async (s) => !!(await product_model_1.Product.findOne({ slug: s })));
        const sku = data.sku || (0, helpers_1.generateSKU)();
        const product = await product_model_1.Product.create({
            ...data,
            slug,
            sku,
            createdBy: adminId,
            updatedBy: adminId,
        });
        return product;
    }
    async getAll(req) {
        const { page, limit, skip } = (0, pagination_1.parsePagination)(req);
        const { field, order } = { field: req.query.sortBy || 'createdAt', order: req.query.sortOrder === 'asc' ? 1 : -1 };
        const filter = { deletedAt: null };
        if (req.query.status)
            filter.status = req.query.status;
        if (req.query.category)
            filter.category = req.query.category;
        if (req.query.collection)
            filter.collections = req.query.collection;
        if (req.query.featured === 'true')
            filter.isFeatured = true;
        if (req.query.trending === 'true')
            filter.isTrending = true;
        if (req.query.newArrival === 'true')
            filter.isNewArrival = true;
        if (req.query.tags)
            filter.tags = { $in: req.query.tags.split(',') };
        if (req.query.minPrice || req.query.maxPrice) {
            filter.price = {
                ...(req.query.minPrice ? { $gte: Number(req.query.minPrice) } : {}),
                ...(req.query.maxPrice ? { $lte: Number(req.query.maxPrice) } : {}),
            };
        }
        const search = (0, pagination_1.parseSearchRegex)(req.query.q);
        if (search)
            filter.$text = { $search: req.query.q };
        const [products, total] = await Promise.all([
            product_model_1.Product.find(filter)
                .populate('category', 'name slug')
                .populate('collections', 'name slug type')
                .sort({ [field]: order })
                .skip(skip)
                .limit(limit)
                .lean(),
            product_model_1.Product.countDocuments(filter),
        ]);
        return {
            products,
            pagination: (0, pagination_1.buildPaginationMeta)(total, page, limit),
        };
    }
    async getBySlug(slug) {
        const product = await product_model_1.Product.findOne({ slug, deletedAt: null, status: 'published' })
            .populate('category', 'name slug')
            .populate('collections', 'name slug type');
        if (!product)
            throw new errors_1.NotFoundError('Product');
        return product;
    }
    async getById(id) {
        const product = await product_model_1.Product.findOne({ _id: id, deletedAt: null })
            .populate('category', 'name slug')
            .populate('collections', 'name slug type');
        if (!product)
            throw new errors_1.NotFoundError('Product');
        return product;
    }
    async update(id, data, adminId) {
        const product = await product_model_1.Product.findOne({ _id: id, deletedAt: null });
        if (!product)
            throw new errors_1.NotFoundError('Product');
        if (data.name && data.name !== product.name) {
            data.slug = await (0, helpers_1.generateUniqueSlug)(data.name, async (s) => !!(await product_model_1.Product.findOne({ slug: s, _id: { $ne: id } })));
        }
        Object.assign(product, { ...data, updatedBy: adminId });
        await product.save();
        return product;
    }
    async delete(id) {
        const product = await product_model_1.Product.findOne({ _id: id, deletedAt: null });
        if (!product)
            throw new errors_1.NotFoundError('Product');
        product.deletedAt = new Date();
        await product.save();
    }
    async updateStock(id, variantId, quantity) {
        const product = await product_model_1.Product.findById(id);
        if (!product)
            throw new errors_1.NotFoundError('Product');
        if (variantId && product.hasVariants) {
            const variant = product.variants.find((v) => v._id?.toString() === variantId);
            if (!variant)
                throw new errors_1.NotFoundError('Product variant');
            variant.stock = Math.max(0, variant.stock - quantity);
        }
        else {
            product.stock = Math.max(0, product.stock - quantity);
        }
        await product.save();
    }
    async getFeatured() {
        return product_model_1.Product.find({ isFeatured: true, status: 'published', deletedAt: null })
            .populate('category', 'name slug')
            .limit(12)
            .lean();
    }
    async getTrending() {
        return product_model_1.Product.find({ isTrending: true, status: 'published', deletedAt: null })
            .populate('category', 'name slug')
            .limit(12)
            .lean();
    }
    async getRelated(productId, categoryId) {
        return product_model_1.Product.find({
            _id: { $ne: productId },
            category: categoryId,
            status: 'published',
            deletedAt: null,
        })
            .limit(6)
            .lean();
    }
    async getLowStock(threshold = 5) {
        return product_model_1.Product.find({
            deletedAt: null,
            status: 'published',
            stock: { $lte: threshold, $gt: 0 },
        }).lean();
    }
}
exports.ProductService = ProductService;
exports.productService = new ProductService();
//# sourceMappingURL=product.service.js.map