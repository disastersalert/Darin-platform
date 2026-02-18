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

    // EVENTS TABLE
    await client.query(`
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
        latitude DECIMAL(10,8),
        longitude DECIMAL(11,8),
        affected_people INTEGER,
        casualties INTEGER,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        source VARCHAR(50) DEFAULT 'GDACS',
        source_url TEXT,
        raw_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // SYNC LOGS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS sync_logs (
        id SERIAL PRIMARY KEY,
        message TEXT,
        status VARCHAR(50),
        sync_started_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // USERS
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100),
        role VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // POSTS
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        body TEXT,
        user_id INTEGER REFERENCES users(id),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // FOLLOWS
    await client.query(`
      CREATE TABLE IF NOT EXISTS follows (
        following_user_id INTEGER REFERENCES users(id),
        followed_user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✓ Tables ensured");

    const result = await client.query('SELECT NOW()');
    return result.rows[0];

  } finally {
    client.release();
  }
};

export default pool;