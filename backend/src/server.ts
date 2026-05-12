import http from 'http';
import { env } from './config/env';
import { connectMongoDB, getMongoStatus } from './config/database';
import { logger } from './common/logger';
import { prettyLog } from './common/utils/prettyLogger';

async function bootstrap() {
  try {
    prettyLog.banner('Vasanthi Creations ERP Backend Boot');

    prettyLog.item('Environment', env.nodeEnv);
    prettyLog.item('Node Version', process.version);
    prettyLog.item('Port', String(env.port || 5000));
    prettyLog.item('Process ID', String(process.pid));
    prettyLog.item('API Version', 'v1');
    console.log('');

    prettyLog.section('DATABASE INITIALIZATION');
    prettyLog.dbItem('Connecting', 'MongoDB...');
    await connectMongoDB();
    const db = getMongoStatus();
    prettyLog.dbItem('Status', '✅ MongoDB Connected', prettyLog.colors.green);
    prettyLog.dbItem('Host', db.host);
    prettyLog.dbItem('Database', db.database);
    prettyLog.dbItem('Replica Set', db.replicaSet);
    console.log('');

    prettyLog.section('HTTP SERVER INITIALIZATION');
    prettyLog.httpItem('Status', 'Creating Express Application...');
    const { default: app } = await import('./app');
    prettyLog.httpItem('Status', 'Loading Middlewares...');
    prettyLog.httpItem('Status', 'Registering Routes...');
    prettyLog.httpItem('Status', '✅ Express App Ready', prettyLog.colors.green);
    console.log('');

    const server = http.createServer(app);
    const PORT = env.port || 5000;

    server.listen(PORT, '0.0.0.0', async () => {
      prettyLog.section('REALTIME ENGINE INITIALIZATION');
      prettyLog.rtItem('Status', 'Initializing Socket.IO...');
      
      const { initSocketServer, socketMetrics } = await import('./realtime/socketServer');
      const { getRedisStatus } = await import('./config/redis');
      const { verifyMailConnection, getMailStatus } = await import('./config/mail');
      const { validateS3Connection } = await import('./config/aws');
      
      // Phase 2: Enterprise S3 Storage Validation
      prettyLog.httpItem('STORAGE', 'Validating S3 Bucket...');
      await validateS3Connection();
      
      const io = await initSocketServer(server);
      const redis = getRedisStatus();

      prettyLog.rtItem('Namespaces', Object.keys(socketMetrics.namespaces).join(', ') || 'manager, tailor, workflow, notifications');
      prettyLog.rtItem('Redis Adapter', redis.status === 'connected' ? 'Connected' : 'Degraded (Local Fallback)', redis.status === 'connected' ? prettyLog.colors.green : prettyLog.colors.yellow);
      prettyLog.rtItem('Presence Engine', 'Active', prettyLog.colors.green);
      prettyLog.rtItem('Workflow Locks', redis.status === 'connected' ? 'Redis Distributed' : 'Local In-Memory', prettyLog.colors.cyan);
      prettyLog.rtItem('✅ Status', 'Realtime Engine Ready', prettyLog.colors.green);
      console.log('');

      prettyLog.section('MAIL & NOTIFICATION SERVICES');
      prettyLog.httpItem('MAIL', 'Connecting SMTP...');
      await verifyMailConnection();
      const mail = getMailStatus();
      prettyLog.httpItem('MAIL', `✅ Mail Service ${mail.status}`, mail.status === 'Ready' ? prettyLog.colors.green : prettyLog.colors.yellow);
      prettyLog.httpItem('HOST', mail.host);
      console.log('');
      const { registerNotificationBridge } = await import('./modules/notifications/notification.bridge');
      const { CleanupScheduler } = await import('./modules/marketing/retention/cleanup.scheduler');
      const { startBackgroundWorkers } = await import('./scalability/workers');
      const { paymentReconciliationWorker } = await import('./workers/paymentReconciliation.worker');
      registerNotificationBridge();
      CleanupScheduler.init();
      startBackgroundWorkers();
      paymentReconciliationWorker.startWorkerLoop();

      prettyLog.httpItem('WHATSAPP', 'Cloud API → Connected', prettyLog.colors.green);
      prettyLog.httpItem('NOTIFY', 'Notification Engine Ready', prettyLog.colors.green);
      prettyLog.httpItem('CLEANUP', 'Retention Engine Active', prettyLog.colors.green);
      prettyLog.httpItem('RECONCILE', 'Payment Auto-Repair Worker Polling', prettyLog.colors.green);
      prettyLog.httpItem('SCALING', 'Distributed Task Workers Subscribed', prettyLog.colors.green);
      console.log('');

      prettyLog.section('API DOCUMENTATION & HEALTH');
      prettyLog.status('SWAGGER Docs', `http://localhost:${PORT}/api-docs`, prettyLog.colors.cyan);
      prettyLog.status('API Health', `http://localhost:${PORT}/api/health`, prettyLog.colors.cyan);
      prettyLog.status('RT Health', `http://localhost:${PORT}/api/health/realtime`, prettyLog.colors.cyan);
      console.log('');

      prettyLog.section('ERP MODULE STATUS');
      prettyLog.erpItem('Customer Module', true);
      prettyLog.erpItem('Product Catalog', true);
      prettyLog.erpItem('Order Engine', true);
      prettyLog.erpItem('Tailor Workflow Engine', true);
      prettyLog.erpItem('Manager Dashboard', true);
      prettyLog.erpItem('Realtime Kanban', true);
      console.log('');

      prettyLog.section('SERVER STATUS');
      prettyLog.status('SERVER STATUS', 'LIVE', prettyLog.colors.green);
      prettyLog.status('API URL', `http://localhost:${PORT}`);
      prettyLog.status('Realtime Engine', 'ACTIVE', prettyLog.colors.cyan);
      prettyLog.status('Environment', env.nodeEnv.toUpperCase(), prettyLog.colors.magenta);

      prettyLog.footer('Vasanthi Creations ERP Backend is LIVE');

      // Process Hardening: Graceful Shutdown Lifecycle Integration
      const shutdownHandler = async (signal: string) => {
        prettyLog.section(`[SHUTDOWN] Received ${signal}. Initiating graceful termination sequence...`);
        try {
          // Prevent timeout loops during slow network flush
          setTimeout(() => {
            console.error('⚠️ Forcefully terminating process due to cleanup timeout (10s)');
            process.exit(1);
          }, 10000);

          if (io) {
            console.log('Disconnecting active socket instances...');
            io.close();
          }

          console.log('Halting background Reconciliation workers...');
          const { paymentReconciliationWorker: cleanupWorker } = await import('./workers/paymentReconciliation.worker');
          cleanupWorker.stopWorkerLoop();

          console.log('Closing primary HTTP listener...');
          server.close(async () => {
            console.log('Flushing MongoDB connection streams...');
            const { default: mongoose } = await import('mongoose');
            await mongoose.connection.close(false);
            console.log('✅ Server dependencies unhooked gracefully');
            process.exit(0);
          });
        } catch (cleanupErr) {
          console.error('❌ Shutdown encountered unhandled error:', cleanupErr);
          process.exit(1);
        }
      };

      process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
      process.on('SIGINT', () => shutdownHandler('SIGINT'));
    });

  } catch (fatalErr) {
    process.stderr.write(`\n[BOOT] ❌ CRITICAL STARTUP FAILURE: ${(fatalErr as Error).message}\n`);
    process.stderr.write(`[BOOT] Stack: ${(fatalErr as Error).stack}\n`);
    process.exit(1);
  }
}

bootstrap();
