import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../../common/responses';
import { getFileUrl } from '../../common/middlewares/upload.middleware';

export class ProductController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = { ...req.body };
      let finalImages: string[] = [];

      // 1. Process existing/remote URLs first
      if (data.images) {
        try {
          const parsed = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
          if (Array.isArray(parsed)) finalImages = parsed.filter(i => typeof i === 'string' && i.startsWith('http'));
        } catch {
           // Fallback if not JSON
           if (typeof data.images === 'string') finalImages = [data.images];
        }
      }

      // 2. Process newly uploaded binary files
      if (req.files && Array.isArray(req.files)) {
        const uploadedUrls = req.files.map(file => getFileUrl(req, file.path));
        finalImages = [...finalImages, ...uploadedUrls];
      }

      data.images = finalImages;

      // 3. Robust parsing for other complex fields
      const parseField = (field: any) => {
        if (!field) return undefined;
        try { return typeof field === 'string' ? JSON.parse(field) : field; } catch { return field; }
      };

      data.attributes = parseField(data.attributes);
      data.occasions = parseField(data.occasions);
      data.tags = parseField(data.tags);

      const product = await productService.create(data, req.admin!.adminId);
      sendCreated(res, product, 'Product created successfully');
    } catch (err) { next(err); }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { products, pagination } = await productService.getAll(req);
      sendPaginated(res, products, pagination);
    } catch (err) { next(err); }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getBySlug(req.params.slug as string);
      sendSuccess(res, product);
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.getById(req.params.id as string);
      sendSuccess(res, product);
    } catch (err) { next(err); }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = { ...req.body };
      let finalImages: string[] = [];

      // 1. Process currently kept images (URLs)
      if (data.images) {
        try {
          const parsed = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
          if (Array.isArray(parsed)) finalImages = parsed.filter(i => typeof i === 'string' && i.startsWith('http'));
        } catch {
           if (typeof data.images === 'string') finalImages = [data.images];
        }
      }

      // 2. Append new uploads
      if (req.files && Array.isArray(req.files)) {
        const uploadedUrls = req.files.map(file => getFileUrl(req, file.path));
        finalImages = [...finalImages, ...uploadedUrls];
      }

      data.images = finalImages;

      const parseField = (field: any) => {
        if (!field) return undefined;
        try { return typeof field === 'string' ? JSON.parse(field) : field; } catch { return field; }
      };

      data.attributes = parseField(data.attributes);
      data.occasions = parseField(data.occasions);
      data.tags = parseField(data.tags);

      const product = await productService.update(req.params.id as string, data, req.admin!.adminId);
      sendSuccess(res, product, 'Product updated successfully');
    } catch (err) { next(err); }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await productService.delete(req.params.id as string);
      sendNoContent(res);
    } catch (err) { next(err); }
  }

  async getFeatured(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getFeatured();
      sendSuccess(res, products);
    } catch (err) { next(err); }
  }

  async getTrending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getTrending();
      sendSuccess(res, products);
    } catch (err) { next(err); }
  }

  async getRelated(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getRelated(req.params.id as string, req.query.category as string);
      sendSuccess(res, products);
    } catch (err) { next(err); }
  }

  async getLowStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await productService.getLowStock();
      sendSuccess(res, products);
    } catch (err) { next(err); }
  }
}

export const productController = new ProductController();
