import axios from 'axios';
import xml2js from 'xml2js';
import { config } from 'dotenv';

config();

const GDACS_BASE_URL = process.env.GDACS_API_BASE || 'https://www.gdacs.org/gdacsapi/api';

const parser = new xml2js.Parser({ explicitArray: false });

// Disaster type mapping
const DISASTER_TYPES = {
  'EQ': 'Earthquake',
  'TC': 'Tropical Cyclone',
  'FL': 'Flood',
  'VO': 'Volcano',
  'DR': 'Drought',
  'WF': 'Wildfire',
  'TS': 'Tsunami'
};

// Severity mapping from GDACS alert levels
const SEVERITY_MAP = {
  'Red': 'critical',
  'Orange': 'high',
  'Green': 'medium',
  'White': 'low'
};

/**
 * Fetch events from GDACS API
 */
export async function fetchGDACSEvents() {
  try {
    const response = await axios.get(`${GDACS_BASE_URL}/events/geteventlist/SEARCH`, {
      params: {
        fromDate: getDateDaysAgo(30), // Last 30 days
        toDate: new Date().toISOString().split('T')[0]
      },
      timeout: 15000
    });

    if (!response.data) {
      throw new Error('No data received from GDACS');
    }

    // Parse XML response
    const parsed = await parser.parseStringPromise(response.data);
    
    if (!parsed.rss || !parsed.rss.channel || !parsed.rss.channel.item) {
      return [];
    }

    const items = Array.isArray(parsed.rss.channel.item) 
      ? parsed.rss.channel.item 
      : [parsed.rss.channel.item];

    return items.map(normalizeEvent);
  } catch (error) {
    console.error('Error fetching GDACS events:', error.message);
    throw error;
  }
}

/**
 * Normalize GDACS event to our schema
 */
function normalizeEvent(item) {
  const gdacs = item['gdacs:'] || item.gdacs || {};
  const geo = item['geo:Point'] || item.geo || {};
  
  const eventType = gdacs.eventtype || item.category || 'Unknown';
  const alertLevel = gdacs.alertlevel || 'Green';
  
  const lat = parseFloat(geo.lat || gdacs.lat || 0);
  const lon = parseFloat(geo.long || gdacs.lon || 0);

  return {
    id: gdacs.eventid || item.guid || generateId(),
    title: item.title || 'Unknown Event',
    description: item.description || '',
    type: DISASTER_TYPES[eventType] || eventType,
    severity: SEVERITY_MAP[alertLevel] || 'medium',
    country: gdacs.country || 'Unknown',
    latitude: lat,
    longitude: lon,
    affected_people: parseInt(gdacs.population || 0),
    casualties: parseInt(gdacs.severity?.value || 0),
    start_date: item.pubDate || new Date().toISOString(),
    source: 'GDACS',
    source_url: item.link || '',
    raw_data: item
  };
}

/**
 * Get date N days ago in YYYY-MM-DD format
 */
function getDateDaysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().split('T')[0];
}

/**
 * Generate unique ID
 */
function generateId() {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export default {
  fetchGDACSEvents
};
