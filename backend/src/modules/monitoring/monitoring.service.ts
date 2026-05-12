import os from 'os';
import mongoose from 'mongoose';
import { getRedisStatus } from '../../config/redis';
import { socketMetrics } from '../../realtime/socketServer';

export class MonitoringService {
  /**
   * Get comprehensive system health metrics
   */
  static async getHealthMetrics() {
    const startTime = Date.now();
    
    // Check DB Latency
    const dbStart = Date.now();
    await mongoose.connection.db.admin().ping();
    const dbLatency = Date.now() - dbStart;

    const memoryUsage = process.memoryUsage();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();

    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: process.platform,
      system: {
        totalMemory: Math.round(totalMem / 1024 / 1024),
        freeMemory: Math.round(freeMem / 1024 / 1024),
        cpuLoad: os.loadavg(),
        processMemory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024),
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024)
        }
      },
      infrastructure: {
        database: {
          status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          latency: dbLatency
        },
        redis: getRedisStatus(),
        realtime: {
          connections: socketMetrics.totalConnections,
          namespaces: Object.keys(socketMetrics.namespaces).length,
          adapterMode: socketMetrics.adapterMode
        }
      },
      performance: {
        responseTime: Date.now() - startTime
      }
    };
  }

  /**
   * Mock for performance tracing (Sentry style)
   */
  static logError(error: Error, context: any = {}) {
    console.error(`[MONITORING] Exception: ${error.message}`, {
      stack: error.stack,
      context,
      timestamp: new Date().toISOString()
    });
    // Here we would integrate Sentry: Sentry.captureException(error)
  }
}
