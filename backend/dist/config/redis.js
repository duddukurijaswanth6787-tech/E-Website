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
let hasLoggedRedisError = false;
const getRedisClient = () => {
    if (!redisClient) {
        if (!env_1.env.redis.url) {
            // Lazily create a client only when Redis is configured.
            // Callers should handle connection failures via existing fallbacks.
            throw new Error('Redis is disabled (REDIS_URL is empty/unset)');
        }
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
        redisClient.on('error', (err) => {
            // ioredis can emit noisy AggregateError stacks when the host/port is unreachable.
            // Log a single friendly warning and avoid flooding the terminal.
            if (!hasLoggedRedisError) {
                hasLoggedRedisError = true;
                logger_1.logger.warn(`⚠️  Redis unavailable at ${env_1.env.redis.url} — OTP/caching will use fallback behavior`);
            }
            if (env_1.env.nodeEnv !== 'production' && env_1.env.log.level === 'debug') {
                // Avoid printing massive AggregateError stacks in dev; they add noise but no actionability.
                if (err?.name !== 'AggregateError') {
                    logger_1.logger.error('❌ Redis error (debug):', err);
                }
            }
        });
        redisClient.on('close', () => logger_1.logger.warn('⚠️  Redis connection closed'));
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
const connectRedis = async () => {
    try {
        if (!env_1.env.redis.url) {
            logger_1.logger.info('ℹ️  Redis disabled (REDIS_URL is empty/unset)');
            return;
        }
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
        try {
            if (['ready', 'connect'].includes(redisClient.status)) {
                await redisClient.quit();
            }
            else {
                redisClient.disconnect();
            }
            logger_1.logger.info('Redis disconnected gracefully');
        }
        catch (err) {
            if (err?.message !== 'Connection is closed') {
                logger_1.logger.warn(`Redis shutdown warning: ${err?.message}`);
            }
        }
        finally {
            redisClient = null;
        }
    }
};
exports.disconnectRedis = disconnectRedis;
//# sourceMappingURL=redis.js.map