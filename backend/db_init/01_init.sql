-- This script will be executed automatically by the PostgreSQL/TimescaleDB container on first run.

-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;

-- Table for sensor readings (time-series data)
CREATE TABLE IF NOT EXISTS readings (
  time        TIMESTAMPTZ       NOT NULL,
  sensor_id   TEXT              NOT NULL,
  value       DOUBLE PRECISION  NOT NULL,
  PRIMARY KEY (time, sensor_id)
);

-- Convert the 'readings' table to a TimescaleDB hypertable, partitioned by 'time'
-- This will only proceed if the table is empty or new.
-- For existing tables with data, use SELECT create_hypertable('readings', 'time', if_not_exists => TRUE);
-- However, create_hypertable should ideally be run on an empty table.
-- The Docker entrypoint script runs this before any app connects, so it should be fine.
SELECT create_hypertable('readings', 'time', if_not_exists => TRUE);

-- Table for sensor metadata and configuration
CREATE TABLE IF NOT EXISTS sensors (
  sensor_id TEXT PRIMARY KEY,
  name      TEXT,
  type      TEXT NOT NULL, -- e.g., 'moisture', 'temperature', 'humidity'
  location  TEXT,
  threshold DOUBLE PRECISION, -- Example: for moisture, this could be the minimum desired percentage
  -- Additional fields like 'min_threshold', 'max_threshold' could be added for ranges
  -- Or a JSONB field for more complex threshold configurations: 'threshold_config JSONB'
  unit      TEXT, -- e.g., '%', '°C', '°F'
  last_updated TIMESTAMPTZ, -- When the sensor metadata was last updated
  is_active BOOLEAN DEFAULT TRUE
);

-- Optional: Indexes for faster querying on sensor_id in readings, if not covered by hypertable optimizations
CREATE INDEX IF NOT EXISTS idx_readings_sensor_id_time ON readings (sensor_id, time DESC);

-- Optional: Indexes for sensors table
CREATE INDEX IF NOT EXISTS idx_sensors_type ON sensors (type);
CREATE INDEX IF NOT EXISTS idx_sensors_location ON sensors (location);

-- Insert some sample sensor metadata (optional, for testing)
INSERT INTO sensors (sensor_id, name, type, location, threshold, unit) VALUES
('garden-bed-1-moisture', 'Garden Bed 1 Moisture', 'moisture', 'Backyard', 25.0, '%')
ON CONFLICT (sensor_id) DO NOTHING;

INSERT INTO sensors (sensor_id, name, type, location, threshold, unit) VALUES
('garden-bed-1-temp', 'Garden Bed 1 Temperature', 'temperature', 'Backyard', 30.0, '°C')
ON CONFLICT (sensor_id) DO NOTHING;

INSERT INTO sensors (sensor_id, name, type, location, threshold, unit) VALUES
('living-room-fig-moisture', 'Living Room Fiddle Leaf Fig', 'moisture', 'Living Room', 40.0, '%')
ON CONFLICT (sensor_id) DO NOTHING;

-- Grant privileges if a different application user will be used (other than the POSTGRES_USER)
-- For example, if FastAPI connects as 'app_user':
-- CREATE USER app_user WITH PASSWORD 'app_password';
-- GRANT CONNECT ON DATABASE plantdb TO app_user;
-- GRANT USAGE ON SCHEMA public TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE readings TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE sensors TO app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user; -- If any sequences are used

\echo "Database initialization script completed."
