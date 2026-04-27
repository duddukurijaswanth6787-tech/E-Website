import { env } from './config/env';
import app from './app';
import { connectMongoDB, disconnectMongoDB } from './config/database';
import { connectRedis, disconnectRedis } from './config/redis';
import { verifyMailConnection } from './config/mail';
import { logger } from './common/logger';
import http from 'http';

const server = http.createServer(app);

const start = async () => {
  try {
    // Connect to databases
    await connectMongoDB();

    try {
      await connectRedis();
    } catch {
      logger.warn('⚠️  Redis connection failed — OTP and caching features will be limited');
    }

    await verifyMailConnection();

    server.listen(env.port, () => {
      logger.info(`
╔════════════════════════════════════════════════════════════╗
║         🌸 Vasanthi Creations API Server Started 🌸        ║
╠════════════════════════════════════════════════════════════╣
║  Environment  : ${env.nodeEnv.padEnd(42)}║
║  Port         : ${String(env.port).padEnd(42)}║
║  API Base     : http://localhost:${env.port}/api/v1${''.padEnd(18)}║
║  Swagger Docs : http://localhost:${env.port}/api-docs${''.padEnd(16)}║
║  Health Check : http://localhost:${env.port}/api/health${''.padEnd(16)}║
╚════════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

let isShuttingDown = false;

// Graceful shutdown
const shutdown = async (signal: string) => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  
  logger.info(`${signal} received — shutting down gracefully...`);
  
  server.close(); // Stop securely accepting new HTTP connections
  
  try {
    await disconnectMongoDB();
    await disconnectRedis();
    logger.info('Server shutdown complete');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Execute server
start().catch(err => {
  console.error('🔥 FATAL ERROR DURING STARTUP:', err);
  process.exit(1);
});
