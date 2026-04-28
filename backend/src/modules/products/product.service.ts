import { Product } from './product.model';
import { Category } from '../categories/category.model';
import { NotFoundError, ConflictError, BadRequestError } from '../../common/errors';
import { generateUniqueSlug, buildSemanticSkuPrefix } from '../../common/utils/helpers';
import { parsePagination, buildPaginationMeta, parseSearchRegex } from '../../common/utils/pagination';
import { Request } from 'express';
import { cacheService } from '../../common/utils/cache';

const CACHE_KEYS = {
  TRENDING: 'products:trending',
  FEATURED: 'products:featured',
};


async function generateUniqueSemanticSku(prefixBase: string): Promise<string> {
  const escaped = prefixBase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^${escaped}-\\d{3}$`);
  const existing = await Product.find({ sku: { $regex: re } }).select('sku').lean();
  let max = 0;
  for (const p of existing) {
    const m = String((p as { sku?: string }).sku).match(/-(\d{3})$/);
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  const next = String(max + 1).padStart(3, '0');
  return `${prefixBase}-${next}`;
}

export class ProductService {
  async create(data: any, adminId: string) {
    const category = await Category.findById(data.category);
    if (!category) throw new BadRequestError('Invalid category');

    const slug = await generateUniqueSlug(data.name as string, async (s) => !!(await Product.findOne({ slug: s })));

    let sku = data.sku as string | undefined;
    if (!sku) {
      const parent = category.parent ? await Category.findById(category.parent) : null;
      const mainName = parent?.name ?? category.name;
      const color = (data.color as string)?.trim() || 'na';
      const prefix = buildSemanticSkuPrefix(mainName, color);
      sku = await generateUniqueSemanticSku(prefix);
    }

    const product = await Product.create({
      ...data,
      slug,
      sku,
      createdBy: adminId,
      updatedBy: adminId,
    });

    await this.clearFeaturedTrendingCache();
    return product;
  }

  async getAll(req: Request) {
    const { page, limit, skip } = parsePagination(req);

    const sortParam = (req.query.sort as string)?.trim() || '';
    let field = ((req.query.sortBy as string) || 'createdAt').trim();
    let order: 1 | -1 = req.query.sortOrder === 'asc' ? 1 : -1;
    if (sortParam) {
      if (sortParam.startsWith('-')) {
        field = sortParam.slice(1);
        order = -1;
      } else {
        field = sortParam;
        order = 1;
      }
    }

    const filter: Record<string, any> = { deletedAt: null };

    // Mounted at /api/v1/products — use originalUrl so we never treat /admin/* as the public shop.
    const isAdminProductList = /\/products\/admin\//.test(req.originalUrl || '');
    if (!isAdminProductList) {
      filter.status = 'published';
    } else if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.category) {
      const ids = (req.query.category as string)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      if (ids.length === 1) filter.category = ids[0];
      else if (ids.length > 1) filter.category = { $in: ids };
    }
    if (req.query.collection) filter.collections = req.query.collection;
    if (req.query.featured === 'true') filter.isFeatured = true;
    if (req.query.trending === 'true') filter.isTrending = true;
    if (req.query.newArrival === 'true') filter.isNewArrival = true;
    if (req.query.tags) filter.tags = { $in: (req.query.tags as string).split(',') };

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {
        ...(req.query.minPrice ? { $gte: Number(req.query.minPrice) } : {}),
        ...(req.query.maxPrice ? { $lte: Number(req.query.maxPrice) } : {}),
      };
    }

    const search = parseSearchRegex(req.query.q as string);
    if (search) filter.$text = { $search: req.query.q as string };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .populate('collections', 'name slug type')
        .sort({ [field]: order })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      pagination: buildPaginationMeta(total, page, limit),
    };
  }

  async getBySlug(slug: string) {
    const product = await Product.findOne({ slug, deletedAt: null, status: 'published' })
      .populate('category', 'name slug')
      .populate('collections', 'name slug type');
    if (!product) throw new NotFoundError('Product');
    return product;
  }

  async getById(id: string) {
    const product = await Product.findOne({ _id: id, deletedAt: null })
      .populate('category', 'name slug')
      .populate('collections', 'name slug type');
    if (!product) throw new NotFoundError('Product');
    return product;
  }

  async update(id: string, data: any, adminId: string) {
    const product = await Product.findOne({ _id: id, deletedAt: null });
    if (!product) throw new NotFoundError('Product');

    if (data.name && data.name !== product.name) {
      data.slug = await generateUniqueSlug(data.name as string, async (s) => !!(await Product.findOne({ slug: s, _id: { $ne: id } })));
    }

    Object.assign(product, { ...data, updatedBy: adminId });
    await product.save();
    await this.clearFeaturedTrendingCache();
    return product;
  }

  async delete(id: string) {
    const product = await Product.findOne({ _id: id, deletedAt: null });
    if (!product) throw new NotFoundError('Product');
    product.deletedAt = new Date();
    await product.save();
    await this.clearFeaturedTrendingCache();
  }

  async updateStock(id: string, variantId: string | undefined, quantity: number) {
    const product = await Product.findById(id);
    if (!product) throw new NotFoundError('Product');

    if (variantId && product.hasVariants) {
      const variant = product.variants.find((v) => v._id?.toString() === variantId);
      if (!variant) throw new NotFoundError('Product variant');
      variant.stock = Math.max(0, variant.stock - quantity);
    } else {
      product.stock = Math.max(0, product.stock - quantity);
    }
    await product.save();
  }

  async getFeatured() {
    const cached = await cacheService.get<any[]>(CACHE_KEYS.FEATURED);
    if (cached) return cached;

    const products = await Product.find({ isFeatured: true, status: 'published', deletedAt: null })
      .populate('category', 'name slug')
      .limit(12)
      .lean();

    await cacheService.set(CACHE_KEYS.FEATURED, products, 600); // 10 mins
    return products;
  }

  async getTrending() {
    const cached = await cacheService.get<any[]>(CACHE_KEYS.TRENDING);
    if (cached) return cached;

    const products = await Product.find({ isTrending: true, status: 'published', deletedAt: null })
      .populate('category', 'name slug')
      .limit(12)
      .lean();

    await cacheService.set(CACHE_KEYS.TRENDING, products, 600); // 10 mins
    return products;
  }

  async clearFeaturedTrendingCache() {
    await Promise.all([
      cacheService.del(CACHE_KEYS.FEATURED),
      cacheService.del(CACHE_KEYS.TRENDING),
    ]);
  }

  async getRelated(productId: string, categoryId: string) {
    return Product.find({
      _id: { $ne: productId },
      category: categoryId,
      status: 'published',
      deletedAt: null,
    })
      .limit(6)
      .lean();
  }

  async getLowStock(threshold = 5) {
    return Product.find({
      deletedAt: null,
      status: 'published',
      stock: { $lte: threshold, $gt: 0 },
    }).lean();
  }
}

export const productService = new ProductService();
