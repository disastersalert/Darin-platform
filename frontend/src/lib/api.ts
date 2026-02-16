import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Event {
  id: string;
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  country?: string;
  country_ar?: string;
  latitude: number;
  longitude: number;
  affected_people?: number;
  casualties?: number;
  start_date: string;
  end_date?: string;
  source: string;
  source_url?: string;
  created_at: string;
  updated_at: string;
}

export interface EventsResponse {
  success: boolean;
  data: Event[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

export interface Stats {
  total_events: number;
  by_type: { type: string; count: number }[];
  by_severity: { severity: string; count: number }[];
  by_country: { country: string; count: number }[];
  recent_syncs: any[];
}

export interface StatsResponse {
  success: boolean;
  data: Stats;
}

export const eventsApi = {
  getEvents: async (filters?: {
    type?: string;
    severity?: string;
    country?: string;
    limit?: number;
    offset?: number;
  }): Promise<EventsResponse> => {
    const response = await api.get('/api/events', { params: filters });
    return response.data;
  },

  getEventById: async (id: string): Promise<Event> => {
    const response = await api.get(`/api/events/${id}`);
    return response.data.data;
  },
};

export const statsApi = {
  getStats: async (): Promise<StatsResponse> => {
    const response = await api.get('/api/stats');
    return response.data;
  },
};

export const syncApi = {
  triggerSync: async () => {
    const response = await api.post('/api/sync');
    return response.data;
  },

  getSyncHistory: async () => {
    const response = await api.get('/api/sync/history');
    return response.data;
  },
};

export default api;
