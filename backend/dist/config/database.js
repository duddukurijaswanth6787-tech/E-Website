"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectMongoDB = exports.connectMongoDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const logger_1 = require("../common/logger");
const connectMongoDB = async () => {
    try {
        mongoose_1.default.set('strictQuery', true);
        await mongoose_1.default.connect(env_1.env.mongo.uri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        logger_1.logger.info(`✅ MongoDB connected: ${mongoose_1.default.connection.host}`);
        mongoose_1.default.connection.on('disconnected', () => {
            logger_1.logger.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
        });
        mongoose_1.default.connection.on('error', (err) => {
            logger_1.logger.error('❌ MongoDB connection error:', err);
        });
    }
    catch (error) {
        logger_1.logger.error('❌ MongoDB initial connection failed:', error);
        process.exit(1);
    }
};
exports.connectMongoDB = connectMongoDB;
const disconnectMongoDB = async () => {
    await mongoose_1.default.disconnect();
    logger_1.logger.info('MongoDB disconnected gracefully');
};
exports.disconnectMongoDB = disconnectMongoDB;
//# sourceMappingURL=database.js.map