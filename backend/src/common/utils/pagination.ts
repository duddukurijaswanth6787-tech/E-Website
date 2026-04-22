import { Request } from 'express';

export interface PaginationQuery {
  page: number;
  limit: number;
  skip: number;
}

export const parsePagination = (req: Request, defaultLimit = 20): PaginationQuery => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || defaultLimit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export interface SortQuery {
  field: string;
  order: 1 | -1;
}

export const parseSort = (req: Request, defaultField = 'createdAt'): SortQuery => {
  const sortBy = (req.query.sortBy as string) || defaultField;
  const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
  return { field: sortBy, order: sortOrder };
};

export const buildSortObject = (sort: SortQuery): Record<string, 1 | -1> => {
  return { [sort.field]: sort.order };
};

export const parseSearchRegex = (query?: string): RegExp | undefined => {
  if (!query || query.trim() === '') return undefined;
  return new RegExp(query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
};

export const buildPaginationMeta = (totalItems: number, currentPage: number, itemsPerPage: number) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  return {
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
};
