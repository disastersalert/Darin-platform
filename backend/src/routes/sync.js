import { syncGDACSData } from '../workers/gdacs-sync.js';
import { query } from '../config/database.js';

export default async function syncRoutes(fastify, options) {
  
  // Trigger manual sync
  fastify.post('/', async (request, reply) => {
    try {
      const result = await syncGDACSData();
      return {
        success: true,
        data: result
      };
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  });
  
  // Get sync history
  fastify.get('/history', async (request, reply) => {
    try {
      const result = await query(`
        SELECT * FROM sync_logs 
        ORDER BY created_at DESC 
        LIMIT 20
      `);
      
      return {
        success: true,
        data: result.rows
      };
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  });
}
