import { Request } from 'express';
export interface PaginationQuery {
    page: number;
    limit: number;
    skip: number;
}
export declare const parsePagination: (req: Request, defaultLimit?: number) => PaginationQuery;
export interface SortQuery {
    field: string;
    order: 1 | -1;
}
export declare const parseSort: (req: Request, defaultField?: string) => SortQuery;
export declare const buildSortObject: (sort: SortQuery) => Record<string, 1 | -1>;
export declare const parseSearchRegex: (query?: string) => RegExp | undefined;
export declare const buildPaginationMeta: (totalItems: number, currentPage: number, itemsPerPage: number) => {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
};
