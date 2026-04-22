import { Request, Response, NextFunction } from 'express';
export declare class ProductController {
    create(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
    getBySlug(req: Request, res: Response, next: NextFunction): Promise<void>;
    getById(req: Request, res: Response, next: NextFunction): Promise<void>;
    update(req: Request, res: Response, next: NextFunction): Promise<void>;
    delete(req: Request, res: Response, next: NextFunction): Promise<void>;
    getFeatured(req: Request, res: Response, next: NextFunction): Promise<void>;
    getTrending(req: Request, res: Response, next: NextFunction): Promise<void>;
    getRelated(req: Request, res: Response, next: NextFunction): Promise<void>;
    getLowStock(req: Request, res: Response, next: NextFunction): Promise<void>;
}
export declare const productController: ProductController;
