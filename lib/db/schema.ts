export type SensorRow = {
  id: number;
  device_id: string;
  site: string | null;
  lat: number;
  lng: number;
  is_active: boolean;
  created_at: string;
};

export type SensorReadingRow = {
  id: number;
  sensor_id: number;
  pm1: number | null;
  pm25: number | null;
  pm10: number | null;
  co2: number | null;
  voc: number | null;
  temp: number | null;
  hum: number | null;
  ch2o: number | null;
  co: number | null;
  o3: number | null;
  no2: number | null;
  timestamp: string;
};

export const createSensorsTable = `
CREATE TABLE IF NOT EXISTS sensors (
  id SERIAL PRIMARY KEY,
  device_id TEXT NOT NULL UNIQUE,
  site TEXT,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export const createSensorReadingsTable = `
CREATE TABLE IF NOT EXISTS sensor_readings (
  id BIGSERIAL PRIMARY KEY,
  sensor_id INTEGER NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  pm1 DOUBLE PRECISION,
  pm25 DOUBLE PRECISION,
  pm10 DOUBLE PRECISION,
  co2 DOUBLE PRECISION,
  voc DOUBLE PRECISION,
  temp DOUBLE PRECISION,
  hum DOUBLE PRECISION,
  ch2o DOUBLE PRECISION,
  co DOUBLE PRECISION,
  o3 DOUBLE PRECISION,
  no2 DOUBLE PRECISION,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

export const createIndexes = `
CREATE INDEX IF NOT EXISTS idx_sensors_device_id ON sensors(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_time ON sensor_readings(sensor_id, "timestamp" DESC);
`;

export const migrations: string[] = [
  createSensorsTable,
  createSensorReadingsTable,
  createIndexes,
];
