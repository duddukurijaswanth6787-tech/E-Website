import { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../../common/responses';

export class ProductController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await productService.create(req.body, req.admin!.adminId);
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
      const product = await productService.update(req.params.id as string, req.body, req.admin!.adminId);
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
