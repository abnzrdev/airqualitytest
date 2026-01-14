import { Pool, PoolClient, QueryResult } from 'pg';
import { migrations } from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Please add it to your environment before using the database client.');
}

const ssl = process.env.PGSSLMODE === 'require'
  ? { rejectUnauthorized: false }
  : undefined;

const pool = new Pool({
  connectionString,
  max: Number(process.env.PGPOOL_MAX || 10),
  ssl,
});

pool.on('error', (err) => {
  // Prevent pooled client errors from crashing the process.
  console.error('Unexpected PostgreSQL client error', err);
});

export const query = async <T = unknown>(text: string, params?: unknown[]): Promise<QueryResult<T>> => {
  return pool.query<T>(text, params);
};

export const withClient = async <T>(fn: (client: PoolClient) => Promise<T>): Promise<T> => {
  const client = await pool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
};

export const runMigrations = async (): Promise<void> => {
  for (const statement of migrations) {
    await pool.query(statement);
  }
};

export const getPool = (): Pool => pool;
