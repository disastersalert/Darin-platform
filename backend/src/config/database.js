import pg from 'pg';
import { config } from 'dotenv';

config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

export const query = async (text, params) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('Query executed:', { text, duration, rows: res.rowCount });
  return res;
};

export const dbConnect = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW()');
    return result.rows[0];
  } finally {
    client.release();
  }
};

export default pool;
