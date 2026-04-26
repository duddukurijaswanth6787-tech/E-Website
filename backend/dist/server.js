"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./config/env");
// Must be first import
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const mail_1 = require("./config/mail");
const logger_1 = require("./common/logger");
const http_1 = __importDefault(require("http"));
const server = http_1.default.createServer(app_1.default);
const start = async () => {
    try {
        // Connect to databases
        await (0, database_1.connectMongoDB)();
        try {
            await (0, redis_1.connectRedis)();
        }
        catch {
            logger_1.logger.warn('⚠️  Redis connection failed — OTP and caching features will be limited');
        }
        await (0, mail_1.verifyMailConnection)();
        server.listen(env_1.env.port, () => {
            logger_1.logger.info(`
╔════════════════════════════════════════════════════════════╗
║         🌸 Vasanthi Creations API Server Started 🌸        ║
╠════════════════════════════════════════════════════════════╣
║  Environment  : ${env_1.env.nodeEnv.padEnd(42)}║
║  Port         : ${String(env_1.env.port).padEnd(42)}║
║  API Base     : http://localhost:${env_1.env.port}/api/v1${''.padEnd(18)}║
║  Swagger Docs : http://localhost:${env_1.env.port}/api-docs${''.padEnd(16)}║
║  Health Check : http://localhost:${env_1.env.port}/api/health${''.padEnd(16)}║
╚════════════════════════════════════════════════════════════╝
      `);
        });
    }
    catch (error) {
        logger_1.logger.error('Failed to start server:', error);
        process.exit(1);
    }
};
let isShuttingDown = false;
// Graceful shutdown
const shutdown = async (signal) => {
    if (isShuttingDown)
        return;
    isShuttingDown = true;
    logger_1.logger.info(`${signal} received — shutting down gracefully...`);
    server.close(); // Stop securely accepting new HTTP connections
    try {
        await (0, database_1.disconnectMongoDB)();
        await (0, redis_1.disconnectRedis)();
        logger_1.logger.info('Server shutdown complete');
        process.exit(0);
    }
    catch (error) {
        logger_1.logger.error('Error during shutdown:', error);
        process.exit(1);
    }
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
    logger_1.logger.error('Unhandled Rejection:', reason);
});
process.on('uncaughtException', (err) => {
    logger_1.logger.error('Uncaught Exception:', err);
    process.exit(1);
});
start();
//# sourceMappingURL=server.js.map