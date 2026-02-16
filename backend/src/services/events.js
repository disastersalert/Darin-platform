import { query } from '../config/database.js';

/**
 * Get all events with filters and time range
 */
export async function getEvents(filters = {}) {
  const { type, severity, country, timeRange = '24h', limit = 100, offset = 0 } = filters;
  
  let sql = `
    SELECT 
      id, title, title_ar, description, type, severity, 
      country, 
      CAST(latitude AS DOUBLE PRECISION) as latitude, 
      CAST(longitude AS DOUBLE PRECISION) as longitude, 
      affected_people, casualties,
      start_date, end_date, source, source_url, created_at, updated_at
    FROM events
    WHERE 1=1
  `;
  
  const params = [];
  let paramCount = 1;
  
  // Time range filter
  if (timeRange && timeRange !== 'all') {
    const timeRanges = {
      '1h': 1 / 24,
      '24h': 1,
      '48h': 2,
      '72h': 3,
      '7d': 7,
      '30d': 30,
      '1y': 365,
      'ytd': null // Year to date
    };
    
    const days = timeRanges[timeRange];
    if (days !== null && days !== undefined) {
      sql += ` AND start_date >= NOW() - INTERVAL '${days} days'`;
    } else if (timeRange === 'ytd') {
      sql += ` AND start_date >= DATE_TRUNC('year', NOW())`;
    }
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
  
  sql += ` ORDER BY start_date DESC LIMIT $${paramCount++} OFFSET $${paramCount}`;
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
 * Create or update event
 */
export async function upsertEvent(event) {
  const sql = `
    INSERT INTO events (
      id, title, title_ar, description, description_ar, 
      type, severity, country, country_ar,
      latitude, longitude, location,
      affected_people, casualties,
      start_date, end_date, source, source_url, raw_data
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10::decimal, $11::decimal, 
      ST_SetSRID(ST_MakePoint($11::decimal, $10::decimal), 4326)::geography,
      $12, $13, $14, $15, $16, $17, $18
    )
    ON CONFLICT (id) DO UPDATE SET
      title = EXCLUDED.title,
      description = EXCLUDED.description,
      severity = EXCLUDED.severity,
      affected_people = EXCLUDED.affected_people,
      casualties = EXCLUDED.casualties,
      end_date = EXCLUDED.end_date,
      updated_at = NOW()
    RETURNING *
  `;
  
  const params = [
    event.id,
    event.title,
    event.title_ar || null,
    event.description || null,
    event.description_ar || null,
    event.type,
    event.severity,
    event.country || null,
    event.country_ar || null,
    event.latitude,
    event.longitude,
    event.affected_people || 0,
    event.casualties || 0,
    event.start_date,
    event.end_date || null,
    event.source,
    event.source_url || null,
    JSON.stringify(event.raw_data || {})
  ];
  
  try {
    const result = await query(sql, params);
    return result.rows[0];
  } catch (error) {
    console.error('Upsert error:', error.message, 'Event:', event.id);
    throw error;
  }
}

/**
 * Get event count with time range support
 */
export async function getEventCount(filters = {}) {
  const { type, severity, country, timeRange = '24h' } = filters;
  
  let sql = 'SELECT COUNT(*) as count FROM events WHERE 1=1';
  const params = [];
  let paramCount = 1;
  
  // Time range filter
  if (timeRange && timeRange !== 'all') {
    const timeRanges = {
      '1h': 1 / 24,
      '24h': 1,
      '48h': 2,
      '72h': 3,
      '7d': 7,
      '30d': 30,
      '1y': 365,
      'ytd': null
    };
    
    const days = timeRanges[timeRange];
    if (days !== null && days !== undefined) {
      sql += ` AND start_date >= NOW() - INTERVAL '${days} days'`;
    } else if (timeRange === 'ytd') {
      sql += ` AND start_date >= DATE_TRUNC('year', NOW())`;
    }
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
