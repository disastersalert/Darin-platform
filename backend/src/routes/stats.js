import { query } from '../config/database.js';

export default async function statsRoutes(fastify, options) {
  
  // Get platform statistics
  fastify.get('/', async (request, reply) => {
    try {
      // Total events
      const totalResult = await query('SELECT COUNT(*) as count FROM events');
      const total = parseInt(totalResult.rows[0].count);
      
      // Events by type
      const typeResult = await query(`
        SELECT type, COUNT(*) as count 
        FROM events 
        GROUP BY type 
        ORDER BY count DESC
      `);
      
      // Events by severity
      const severityResult = await query(`
        SELECT severity, COUNT(*) as count 
        FROM events 
        GROUP BY severity 
        ORDER BY 
          CASE severity 
            WHEN 'critical' THEN 1
            WHEN 'high' THEN 2
            WHEN 'medium' THEN 3
            WHEN 'low' THEN 4
          END
      `);
      
      // Events by country (top 10)
      const countryResult = await query(`
        SELECT country, COUNT(*) as count 
        FROM events 
        WHERE country IS NOT NULL
        GROUP BY country 
        ORDER BY count DESC 
        LIMIT 10
      `);
      
      // Recent sync logs
      const syncResult = await query(`
        SELECT * FROM sync_logs 
        ORDER BY created_at DESC 
        LIMIT 5
      `);
      
      return {
        success: true,
        data: {
          total_events: total,
          by_type: typeResult.rows,
          by_severity: severityResult.rows,
          by_country: countryResult.rows,
          recent_syncs: syncResult.rows
        }
      };
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  });
}
