"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectRedis = exports.connectRedis = exports.getRedisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
const logger_1 = require("../common/logger");
let redisClient = null;
const getRedisClient = () => {
    if (!redisClient) {
        redisClient = new ioredis_1.default(env_1.env.redis.url, {
            retryStrategy: (times) => {
                if (times > 1) {
                    return null; // Stop retrying immediately to keep terminal clean
                }
                return 100;
            },
            maxRetriesPerRequest: 0,
            lazyConnect: true,
        });
        redisClient.on('connect', () => logger_1.logger.info('✅ Redis connected'));
        redisClient.on('error', (err) => logger_1.logger.error('❌ Redis error:', err));
        redisClient.on('close', () => logger_1.logger.warn('⚠️  Redis connection closed'));
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
const connectRedis = async () => {
    try {
        const client = (0, exports.getRedisClient)();
        await client.connect();
    }
    catch (error) {
        logger_1.logger.warn('⚠️  Redis connection failed — OTP and caching features will be limited');
    }
};
exports.connectRedis = connectRedis;
const disconnectRedis = async () => {
    if (redisClient) {
        await redisClient.quit();
        redisClient = null;
        logger_1.logger.info('Redis disconnected gracefully');
    }
};
exports.disconnectRedis = disconnectRedis;
//# sourceMappingURL=redis.js.map