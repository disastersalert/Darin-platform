-- DARIN Database Schema
-- Disaster and Risk Information Network

-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Events table for disaster data
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(255) PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT,
  description TEXT,
  description_ar TEXT,
  type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) NOT NULL,
  country VARCHAR(100),
  country_ar VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location GEOGRAPHY(POINT, 4326),
  affected_people INTEGER,
  casualties INTEGER,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  source VARCHAR(50) DEFAULT 'GDACS',
  source_url TEXT,
  raw_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_events_location ON events USING GIST(location);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_severity ON events(severity);
CREATE INDEX IF NOT EXISTS idx_events_country ON events(country);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date DESC);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- Sync log table to track GDACS API syncs
CREATE TABLE IF NOT EXISTS sync_logs (
  id SERIAL PRIMARY KEY,
  sync_started_at TIMESTAMP NOT NULL,
  sync_completed_at TIMESTAMP,
  events_fetched INTEGER DEFAULT 0,
  events_created INTEGER DEFAULT 0,
  events_updated INTEGER DEFAULT 0,
  status VARCHAR(20) DEFAULT 'running',
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index for sync logs
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON sync_logs(created_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
