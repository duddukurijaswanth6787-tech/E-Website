"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOTPRemainingTTL = exports.deleteOTP = exports.verifyOTP = exports.storeOTP = exports.generateOTP = void 0;
const crypto_1 = __importDefault(require("crypto"));
const redis_1 = require("../../config/redis");
const constants_1 = require("../constants");
const logger_1 = require("../logger");
const generateOTP = () => {
    return crypto_1.default.randomInt(100000, 999999).toString();
};
exports.generateOTP = generateOTP;
// In-memory fallback for development environments without Redis
const memoryStore = new Map();
const storeOTP = async (key, otp) => {
    try {
        const redis = (0, redis_1.getRedisClient)();
        if (redis.status === 'ready' || redis.status === 'connecting') {
            await redis.set(`otp:${key}`, otp, 'EX', constants_1.OTP_TTL_SECONDS);
            return;
        }
        // Fallback to memory
        memoryStore.set(`otp:${key}`, otp);
        setTimeout(() => memoryStore.delete(`otp:${key}`), constants_1.OTP_TTL_SECONDS * 1000);
        logger_1.logger.info(`[DEVSAVE] OTP stored in memory for ${key}: ${otp}`);
    }
    catch (error) {
        // Graceful fallback on Redis failure
        memoryStore.set(`otp:${key}`, otp);
        setTimeout(() => memoryStore.delete(`otp:${key}`), constants_1.OTP_TTL_SECONDS * 1000);
        logger_1.logger.info(`[DEVSAVE] Redis failed, stored in memory for ${key}: ${otp}`);
    }
};
exports.storeOTP = storeOTP;
const verifyOTP = async (key, otp) => {
    // Master OTP for development QA - REMOVED FOR PRODUCTION
    /*
    if (otp === '000000') {
      return true;
    }
    */
    // Check memory first (prefer it in dev if Redis is failing)
    const memStored = memoryStore.get(`otp:${key}`);
    if (memStored === otp) {
        memoryStore.delete(`otp:${key}`);
        return true;
    }
    try {
        const redis = (0, redis_1.getRedisClient)();
        const stored = await redis.get(`otp:${key}`);
        if (stored === otp) {
            await redis.del(`otp:${key}`);
            return true;
        }
        return false;
    }
    catch (error) {
        logger_1.logger.warn('Redis verify failed, memory also missing');
        return false;
    }
};
exports.verifyOTP = verifyOTP;
const deleteOTP = async (key) => {
    try {
        const redis = (0, redis_1.getRedisClient)();
        await redis.del(`otp:${key}`);
    }
    catch (error) {
        logger_1.logger.warn('Failed to delete OTP from Redis:', error);
    }
};
exports.deleteOTP = deleteOTP;
const getOTPRemainingTTL = async (key) => {
    try {
        const redis = (0, redis_1.getRedisClient)();
        return await redis.ttl(`otp:${key}`);
    }
    catch {
        return -1;
    }
};
exports.getOTPRemainingTTL = getOTPRemainingTTL;
//# sourceMappingURL=otp.js.map