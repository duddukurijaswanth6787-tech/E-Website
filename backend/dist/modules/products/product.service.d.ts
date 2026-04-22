import { Request } from 'express';
export declare class ProductService {
    create(data: any, adminId: string): Promise<import("mongoose").Document<unknown, {}, import("./product.model").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("./product.model").IProduct & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getAll(req: Request): Promise<{
        products: (import("./product.model").IProduct & Required<{
            _id: import("mongoose").Types.ObjectId;
        }> & {
            __v: number;
        })[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            itemsPerPage: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
        };
    }>;
    getBySlug(slug: string): Promise<import("mongoose").Document<unknown, {}, import("./product.model").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("./product.model").IProduct & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getById(id: string): Promise<import("mongoose").Document<unknown, {}, import("./product.model").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("./product.model").IProduct & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, data: any, adminId: string): Promise<import("mongoose").Document<unknown, {}, import("./product.model").IProduct, {}, import("mongoose").DefaultSchemaOptions> & import("./product.model").IProduct & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    delete(id: string): Promise<void>;
    updateStock(id: string, variantId: string | undefined, quantity: number): Promise<void>;
    getFeatured(): Promise<(import("./product.model").IProduct & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getTrending(): Promise<(import("./product.model").IProduct & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getRelated(productId: string, categoryId: string): Promise<(import("./product.model").IProduct & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getLowStock(threshold?: number): Promise<(import("./product.model").IProduct & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
export declare const productService: ProductService;
