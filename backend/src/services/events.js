import { query } from '../config/database.js';
import { intelligentUpsert } from './intelligence.js';

/**
 * Get all events with filters, time range, and mode
 */
export async function getEvents(filters = {}) {
  const { type, severity, country, mode = 'live', page = 1, limit = 25 } = filters;
  
  // Calculate offset for pagination
  const offset = (page - 1) * limit;
  
  let sql = `
    SELECT 
      id, title, title_ar, description, type, severity, 
      country, 
      CAST(latitude AS DOUBLE PRECISION) as latitude, 
      CAST(longitude AS DOUBLE PRECISION) as longitude, 
      affected_people, casualties,
      start_date, end_date, source, source_url, 
      confidence_score, priority_score, source_count,
      created_at, updated_at
    FROM events
    WHERE 1=1
  `;
  
  const params = [];
  let paramCount = 1;
  
  // MODE ENFORCEMENT: live = 24h only, archive = all data
  if (mode === 'live') {
    sql += ` AND start_date >= NOW() - INTERVAL '24 hours'`;
  }
  
  if (type) {
    sql += ` AND type = $${paramCount++}`;
    params.push(type);
  }
  
  if (severity) {
    sql += ` AND severity = $${paramCount++}`;
    params.push(severity);
  }
  
  if (country) {
    sql += ` AND country ILIKE $${paramCount++}`;
    params.push(`%${country}%`);
  }
  
  // Sort: Newest → Oldest (mandatory)
  sql += ` ORDER BY start_date DESC, priority_score DESC`;
  sql += ` LIMIT $${paramCount++} OFFSET $${paramCount}`;
  params.push(limit, offset);
  
  const result = await query(sql, params);
  return result.rows;
}

/**
 * Get event by ID
 */
export async function getEventById(id) {
  const sql = `
    SELECT * FROM events WHERE id = $1
  `;
  const result = await query(sql, [id]);
  return result.rows[0] || null;
}

/**
 * Create or update event with intelligence layer
 */
export async function upsertEvent(event) {
  // Apply intelligence logic (scoring + deduplication)
  const enrichedEvent = await intelligentUpsert(event);
  
  const sql = `
    INSERT INTO events (
      id, title, title_ar, description, description_ar, 
      type, severity, country, country_ar,
      latitude, longitude, location,
      affected_people, casualties,
      start_date, end_date, source, source_url, raw_data,
      confidence_score, priority_score, source_count
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::decimal, $11::decimal, 
      ST_SetSRID(ST_MakePoint($11::decimal, $10::decimal), 4326)::geography,
      $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      severity = EXCLUDED.severity,
      affected_people = EXCLUDED.affected_people,
      casualties = EXCLUDED.casualties,
      end_date = EXCLUDED.end_date,
      confidence_score = EXCLUDED.confidence_score,
      priority_score = EXCLUDED.priority_score,
      source_count = EXCLUDED.source_count,
      updated_at = NOW()
    RETURNING *
  `;
  
  const params = [
    enrichedEvent.id,
    enrichedEvent.title,
    enrichedEvent.title_ar || null,
    enrichedEvent.description || null,
    enrichedEvent.description_ar || null,
    enrichedEvent.type,
    enrichedEvent.severity,
    enrichedEvent.country || null,
    enrichedEvent.country_ar || null,
    enrichedEvent.latitude,
    enrichedEvent.longitude,
    enrichedEvent.affected_people || 0,
    enrichedEvent.casualties || 0,
    enrichedEvent.start_date,
    enrichedEvent.end_date || null,
    enrichedEvent.source,
    enrichedEvent.source_url || null,
    JSON.stringify(enrichedEvent.raw_data || {}),
    enrichedEvent.confidence_score || 70,
    enrichedEvent.priority_score || 50,
    enrichedEvent.source_count || 1
  ];
  
  try {
    const result = await query(sql, params);
    return result.rows[0];
  } catch (error) {
    console.error('Upsert error:', error.message, 'Event:', enrichedEvent.id);
    throw error;
  }
}

/**
 * Get event count with mode support
 */
export async function getEventCount(filters = {}) {
  const { type, severity, country, mode = 'live' } = filters;
  
  let sql = 'SELECT COUNT(*) as count FROM events WHERE 1=1';
  const params = [];
  let paramCount = 1;
  
  // MODE ENFORCEMENT
  if (mode === 'live') {
    sql += ` AND start_date >= NOW() - INTERVAL '24 hours'`;
  }
  
  if (type) {
    sql += ` AND type = $${paramCount++}`;
    params.push(type);
  }
  
  if (severity) {
    sql += ` AND severity = $${paramCount++}`;
    params.push(severity);
  }
  
  if (country) {
    sql += ` AND country ILIKE $${paramCount++}`;
    params.push(`%${country}%`);
  }
  
  const result = await query(sql, params);
  return parseInt(result.rows[0].count);
}

export default {
  getEvents,
  getEventById,
  upsertEvent,
  getEventCount
};
