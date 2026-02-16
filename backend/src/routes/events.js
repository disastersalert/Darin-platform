import { getEvents, getEventById, getEventCount } from '../services/events.js';

export default async function eventsRoutes(fastify, options) {
  
  // Get all events with filters
  fastify.get('/', async (request, reply) => {
    try {
      const { type, severity, country, limit, offset } = request.query;
      
      const events = await getEvents({
        type,
        severity,
        country,
        limit: parseInt(limit) || 100,
        offset: parseInt(offset) || 0
      });
      
      const total = await getEventCount({ type, severity, country });
      
      return {
        success: true,
        data: events,
        pagination: {
          total,
          limit: parseInt(limit) || 100,
          offset: parseInt(offset) || 0
        }
      };
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  });
  
  // Get event by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const event = await getEventById(id);
      
      if (!event) {
        return reply.code(404).send({
          success: false,
          error: 'Event not found'
        });
      }
      
      return {
        success: true,
        data: event
      };
    } catch (error) {
      reply.code(500).send({
        success: false,
        error: error.message
      });
    }
  });
}
