"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = void 0;
const logger_1 = require("../logger");
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logData = {
            method: req.method,
            url: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip,
            userAgent: req.get('user-agent'),
            userId: req.user?.userId || req.admin?.adminId || 'anonymous',
        };
        if (res.statusCode >= 500) {
            logger_1.logger.error(logData);
        }
        else if (res.statusCode >= 400) {
            logger_1.logger.warn(logData);
        }
        else {
            logger_1.logger.http(logData);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
//# sourceMappingURL=logger.middleware.js.map