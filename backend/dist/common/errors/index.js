"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUnavailableError = exports.TooManyRequestsError = exports.BadRequestError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.AppError = void 0;
const constants_1 = require("../constants");
class AppError extends Error {
    constructor(message, statusCode = constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR, code) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        this.code = code;
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(errors, message = 'Validation failed') {
        super(message, constants_1.HTTP_STATUS.BAD_REQUEST, 'VALIDATION_ERROR');
        this.errors = errors;
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, constants_1.HTTP_STATUS.UNAUTHORIZED, 'UNAUTHORIZED');
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'You do not have permission to perform this action') {
        super(message, constants_1.HTTP_STATUS.FORBIDDEN, 'FORBIDDEN');
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, constants_1.HTTP_STATUS.NOT_FOUND, 'NOT_FOUND');
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, constants_1.HTTP_STATUS.CONFLICT, 'CONFLICT');
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
exports.ConflictError = ConflictError;
class BadRequestError extends AppError {
    constructor(message = 'Bad request') {
        super(message, constants_1.HTTP_STATUS.BAD_REQUEST, 'BAD_REQUEST');
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}
exports.BadRequestError = BadRequestError;
class TooManyRequestsError extends AppError {
    constructor(message = 'Too many requests. Please try again later.') {
        super(message, constants_1.HTTP_STATUS.TOO_MANY_REQUESTS, 'TOO_MANY_REQUESTS');
        Object.setPrototypeOf(this, TooManyRequestsError.prototype);
    }
}
exports.TooManyRequestsError = TooManyRequestsError;
class ServiceUnavailableError extends AppError {
    constructor(message = 'Service temporarily unavailable') {
        super(message, constants_1.HTTP_STATUS.SERVICE_UNAVAILABLE, 'SERVICE_UNAVAILABLE');
        Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
    }
}
exports.ServiceUnavailableError = ServiceUnavailableError;
//# sourceMappingURL=index.js.map