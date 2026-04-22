"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaginationMeta = exports.sendError = exports.sendNoContent = exports.sendPaginated = exports.sendCreated = exports.sendSuccess = void 0;
const constants_1 = require("../constants");
const sendSuccess = (res, data, message = 'Success', statusCode = constants_1.HTTP_STATUS.OK) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
    });
};
exports.sendSuccess = sendSuccess;
const sendCreated = (res, data, message = 'Created successfully') => {
    return res.status(constants_1.HTTP_STATUS.CREATED).json({
        success: true,
        message,
        data,
    });
};
exports.sendCreated = sendCreated;
const sendPaginated = (res, data, pagination, message = 'Success') => {
    return res.status(constants_1.HTTP_STATUS.OK).json({
        success: true,
        message,
        data,
        pagination,
    });
};
exports.sendPaginated = sendPaginated;
const sendNoContent = (res) => {
    return res.status(constants_1.HTTP_STATUS.NO_CONTENT).send();
};
exports.sendNoContent = sendNoContent;
const sendError = (res, message = 'An error occurred', statusCode = constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, error) => {
    return res.status(statusCode).json({
        success: false,
        message,
        error,
    });
};
exports.sendError = sendError;
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
//# sourceMappingURL=index.js.map