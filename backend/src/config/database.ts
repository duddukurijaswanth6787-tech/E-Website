import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../common/logger';

export const connectMongoDB = async (): Promise<void> => {
  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(env.mongo.uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB connected: ${mongoose.connection.host}`);

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });
  } catch (error) {
    logger.error('❌ MongoDB initial connection failed:', error);
    process.exit(1);
  }
};

export const disconnectMongoDB = async (): Promise<void> => {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected gracefully');
};
