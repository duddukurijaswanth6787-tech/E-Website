"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaginationMeta = exports.parseSearchRegex = exports.buildSortObject = exports.parseSort = exports.parsePagination = void 0;
const parsePagination = (req, defaultLimit = 20) => {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || defaultLimit));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
};
exports.parsePagination = parsePagination;
const parseSort = (req, defaultField = 'createdAt') => {
    const sortBy = req.query.sortBy || defaultField;
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
    return { field: sortBy, order: sortOrder };
};
exports.parseSort = parseSort;
const buildSortObject = (sort) => {
    return { [sort.field]: sort.order };
};
exports.buildSortObject = buildSortObject;
const parseSearchRegex = (query) => {
    if (!query || query.trim() === '')
        return undefined;
    return new RegExp(query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
};
exports.parseSearchRegex = parseSearchRegex;
const buildPaginationMeta = (totalItems, currentPage, itemsPerPage) => {
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
exports.buildPaginationMeta = buildPaginationMeta;
//# sourceMappingURL=pagination.js.map