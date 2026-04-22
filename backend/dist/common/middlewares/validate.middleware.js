"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
const errors_1 = require("../errors");
const handleValidationErrors = (req, _res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        const formatted = errors.array().map((e) => ({
            field: e.path || 'unknown',
            message: e.msg,
        }));
        throw new errors_1.ValidationError(formatted);
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
//# sourceMappingURL=validate.middleware.js.map