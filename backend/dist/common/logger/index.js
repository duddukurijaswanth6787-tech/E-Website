"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const winston_daily_rotate_file_1 = __importDefault(require("winston-daily-rotate-file"));
const path_1 = __importDefault(require("path"));
const env_1 = require("../../config/env");
const fs_1 = __importDefault(require("fs"));
const logDir = path_1.default.resolve(env_1.env.log.dir);
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
const { combine, timestamp, printf, colorize, errors, json } = winston_1.default.format;
const consoleFormat = combine(colorize({ all: true }), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), errors({ stack: true }), printf(({ timestamp, level, message, stack }) => {
    return `[${timestamp}] ${level}: ${stack || message}`;
}));
const fileFormat = combine(timestamp(), errors({ stack: true }), json());
const dailyRotateTransport = (filename, level) => new winston_daily_rotate_file_1.default({
    dirname: logDir,
    filename: `${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level,
    format: fileFormat,
});
exports.logger = winston_1.default.createLogger({
    level: env_1.env.log.level,
    transports: [
        dailyRotateTransport('combined'),
        dailyRotateTransport('error', 'error'),
        ...(env_1.env.isProduction ? [] : [new winston_1.default.transports.Console({ format: consoleFormat })]),
    ],
    exceptionHandlers: [dailyRotateTransport('exceptions')],
    rejectionHandlers: [dailyRotateTransport('rejections')],
    exitOnError: false,
});
if (!env_1.env.isProduction) {
    exports.logger.add(new winston_1.default.transports.Console({ format: consoleFormat }));
}
//# sourceMappingURL=index.js.map