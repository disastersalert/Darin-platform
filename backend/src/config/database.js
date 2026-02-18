await client.query(`
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100),
    role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    body TEXT,
    user_id INTEGER REFERENCES users(id),
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS follows (
    following_user_id INTEGER REFERENCES users(id),
    followed_user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sync_logs (
    id SERIAL PRIMARY KEY,
    status VARCHAR(50),
    message TEXT,
    sync_started_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  ALTER TABLE sync_logs
  ADD COLUMN IF NOT EXISTS status VARCHAR(50);

  ALTER TABLE sync_logs
  ADD COLUMN IF NOT EXISTS sync_started_at TIMESTAMP;
`);
