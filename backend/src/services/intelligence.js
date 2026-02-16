import { query } from '../config/database.js';

/**
 * Source reliability scores (0-100)
 */
const SOURCE_RELIABILITY = {
  'GDACS': 95,
  'USGS': 98,
  'NASA_FIRMS': 90,
  'NOAA': 92,
};

/**
 * Calculate confidence score
 * Based on: source reliability, recency, source count
 */
export function calculateConfidenceScore(event, sourceCount = 1) {
  let score = 0;
  
  // Base reliability from source
  const sourceReliability = SOURCE_RELIABILITY[event.source] || 70;
  score += sourceReliability * 0.6; // 60% weight
  
  // Recency bonus (events within 24h get bonus)
  const eventDate = new Date(event.start_date);
  const now = new Date();
  const hoursOld = (now - eventDate) / (1000 * 60 * 60);
  
  let recencyScore = 0;
  if (hoursOld < 1) recencyScore = 30;
  else if (hoursOld < 24) recencyScore = 20;
  else if (hoursOld < 72) recencyScore = 10;
  else if (hoursOld < 168) recencyScore = 5;
  
  score += recencyScore * 0.3; // 30% weight
  
  // Multiple source bonus
  const sourceBonus = Math.min((sourceCount - 1) * 5, 20);
  score += sourceBonus * 0.1; // 10% weight
  
  return Math.min(Math.round(score), 100);
}

/**
 * Calculate priority score
 * Based on: severity, recency, confidence score
 */
export function calculatePriorityScore(event, confidenceScore) {
  let score = 0;
  
  // Severity weight (50%)
  const severityScores = {
    'critical': 100,
    'high': 75,
    'medium': 50,
    'low': 25
  };
  score += (severityScores[event.severity] || 50) * 0.5;
  
  // Recency weight (30%)
  const eventDate = new Date(event.start_date);
  const now = new Date();
  const hoursOld = (now - eventDate) / (1000 * 60 * 60);
  
  let recencyScore = 0;
  if (hoursOld < 1) recencyScore = 100;
  else if (hoursOld < 6) recencyScore = 90;
  else if (hoursOld < 24) recencyScore = 70;
  else if (hoursOld < 72) recencyScore = 50;
  else if (hoursOld < 168) recencyScore = 30;
  else recencyScore = 10;
  
  score += recencyScore * 0.3;
  
  // Confidence weight (20%)
  score += confidenceScore * 0.2;
  
  return Math.min(Math.round(score), 100);
}

/**
 * Find potential duplicate events
 * Match by: coordinates (radius), time window, event type
 */
export async function findDuplicateEvent(event) {
  try {
    // Search for events within:
    // - 100km radius
    // - 7 day time window
    // - Same event type category
    
    const sql = `
      SELECT 
        id, title, type, severity, source, latitude, longitude, start_date,
        ST_Distance(
          location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as distance_meters
      FROM events
      WHERE 
        type = $3
        AND start_date BETWEEN $4::timestamp - INTERVAL '7 days' AND $4::timestamp + INTERVAL '7 days'
        AND ST_DWithin(
          location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          100000
        )
        AND id != $5
      ORDER BY distance_meters ASC
      LIMIT 5
    `;
    
    const params = [
      event.longitude,
      event.latitude,
      event.type,
      event.start_date,
      event.id
    ];
    
    const result = await query(sql, params);
    return result.rows;
    
  } catch (error) {
    console.error('Error finding duplicates:', error.message);
    return [];
  }
}

/**
 * Enhanced upsert with intelligence logic
 */
export async function intelligentUpsert(event) {
  try {
    // 1. Check for duplicates
    const duplicates = await findDuplicateEvent(event);
    
    let sourceCount = 1;
    if (duplicates.length > 0) {
      console.log(`Found ${duplicates.length} potential duplicates for ${event.id}`);
      // If near-exact match exists, increment source count instead of creating new
      const nearMatch = duplicates.find(d => d.distance_meters < 50000); // 50km
      if (nearMatch) {
        sourceCount = (nearMatch.source_count || 1) + 1;
        console.log(`Merging with existing event ${nearMatch.id}, source_count: ${sourceCount}`);
      }
    }
    
    // 2. Calculate confidence score
    const confidenceScore = calculateConfidenceScore(event, sourceCount);
    
    // 3. Calculate priority score
    const priorityScore = calculatePriorityScore(event, confidenceScore);
    
    // 4. Add scores to event
    event.confidence_score = confidenceScore;
    event.priority_score = priorityScore;
    event.source_count = sourceCount;
    
    console.log(`Event ${event.id}: confidence=${confidenceScore}, priority=${priorityScore}, sources=${sourceCount}`);
    
    return event;
    
  } catch (error) {
    console.error('Error in intelligent upsert:', error.message);
    return event; // Return event without scores if calculation fails
  }
}

export default {
  calculateConfidenceScore,
  calculatePriorityScore,
  findDuplicateEvent,
  intelligentUpsert,
  SOURCE_RELIABILITY
};
