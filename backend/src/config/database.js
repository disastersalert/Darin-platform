import pg from 'pg';
import { config } from 'dotenv';

config();
const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
});

export async function dbConnect() {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    console.log("✓ Database connected");
  } finally {
    client.release();
  }
}
