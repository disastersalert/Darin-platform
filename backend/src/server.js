import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from 'dotenv';
import eventsRoutes from './routes/events.js';
import statsRoutes from './routes/stats.js';
import syncRoutes from './routes/sync.js';
import { startSyncWorker } from './workers/gdacs-sync.js';
import { dbConnect } from './config/database.js';

config();

const fastify = Fastify({
  logger: true,
  trustProxy: true
});

// CORS configuration
await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
});

// Health check
fastify.get('/api/health', async (request, reply) => {
  return { 
    status: 'ok', 
    service: 'DARIN Backend',
    timestamp: new Date().toISOString() 
  };
});

// Register routes
fastify.register(eventsRoutes, { prefix: '/api/events' });
fastify.register(statsRoutes, { prefix: '/api/stats' });
fastify.register(syncRoutes, { prefix: '/api/sync' });

// Start server
const start = async () => {
  try {
    // Test database connection
    await dbConnect();
    fastify.log.info('✓ Database connected');

    // Start server
    await fastify.listen({ 
      port: process.env.PORT || 8001, 
      host: '0.0.0.0' 
    });
    
    fastify.log.info(`✓ DARIN Backend running on port ${process.env.PORT || 8001}`);
    
    // Start GDACS sync worker
    startSyncWorker();
    fastify.log.info('✓ GDACS sync worker started');
    
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
