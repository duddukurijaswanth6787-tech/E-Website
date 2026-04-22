import { Response } from 'express';
interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    pagination?: PaginationMeta;
    error?: unknown;
}
export declare const sendSuccess: <T>(res: Response, data: T, message?: string, statusCode?: 200) => Response<ApiResponse<T>>;
export declare const sendCreated: <T>(res: Response, data: T, message?: string) => Response<ApiResponse<T>>;
export declare const sendPaginated: <T>(res: Response, data: T[], pagination: PaginationMeta, message?: string) => Response<ApiResponse<T[]>>;
export declare const sendNoContent: (res: Response) => Response;
export declare const sendError: (res: Response, message?: string, statusCode?: 500, error?: unknown) => Response<ApiResponse>;
export declare const buildPaginationMeta: (totalItems: number, currentPage: number, itemsPerPage: number) => PaginationMeta;
export {};
