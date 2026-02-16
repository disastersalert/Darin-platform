import axios from 'axios';
import { config } from 'dotenv';

config();

const GDACS_BASE_URL = process.env.GDACS_API_BASE || 'https://www.gdacs.org/gdacsapi/api';

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

    // Parse JSON response (GeoJSON format)
    const data = response.data;
    
    if (!data.features || !Array.isArray(data.features)) {
      console.log('No features found in GDACS response');
      return [];
    }

    return data.features.map(normalizeEvent).filter(e => e !== null);
  } catch (error) {
    console.error('Error fetching GDACS events:', error.message);
    throw error;
  }
}

/**
 * Normalize GDACS event to our schema
 */
function normalizeEvent(feature) {
  try {
    const props = feature.properties;
    const coords = feature.geometry?.coordinates;
    
    if (!props || !coords) return null;
    
    const eventType = props.eventtype || 'Unknown';
    const alertLevel = props.alertlevel || 'Green';
    
    const [lon, lat] = coords;

    return {
      id: `gdacs_${props.eventid}_${props.episodeid}`,
      title: props.name || props.description || 'Unknown Event',
      description: props.htmldescription || props.description || '',
      type: DISASTER_TYPES[eventType] || eventType,
      severity: SEVERITY_MAP[alertLevel] || 'medium',
      country: props.country || 'Unknown',
      latitude: lat,
      longitude: lon,
      affected_people: 0,
      casualties: 0,
      start_date: props.fromdate || new Date().toISOString(),
      end_date: props.todate || null,
      source: 'GDACS',
      source_url: props.url?.report || '',
      raw_data: props
    };
  } catch (error) {
    console.error('Error normalizing event:', error.message);
    return null;
  }
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
