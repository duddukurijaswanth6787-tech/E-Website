import { Response } from 'express';
import { HTTP_STATUS } from '../constants';

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

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = HTTP_STATUS.OK,
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Created successfully',
): Response<ApiResponse<T>> => {
  return res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message,
    data,
  });
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  pagination: PaginationMeta,
  message = 'Success',
): Response<ApiResponse<T[]>> => {
  return res.status(HTTP_STATUS.OK).json({
    success: true,
    message,
    data,
    pagination,
  });
};

export const sendNoContent = (res: Response): Response => {
  return res.status(HTTP_STATUS.NO_CONTENT).send();
};

export const sendError = (
  res: Response,
  message = 'An error occurred',
  statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  error?: unknown,
): Response<ApiResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    error,
  });
};

export const buildPaginationMeta = (
  totalItems: number,
  currentPage: number,
  itemsPerPage: number,
): PaginationMeta => {
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
