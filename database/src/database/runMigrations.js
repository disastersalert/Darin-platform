
import fs from "fs";
import path from "path";
import pool from "../config/database.js";

export async function runMigrations() {
  const client = await pool.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE,
        run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrationsDir = path.join(process.cwd(), "src/database/migrations");
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      const { rows } = await client.query(
        "SELECT * FROM migrations WHERE name = $1",
        [file]
      );

      if (rows.length === 0) {
        console.log("Running migration:", file);

        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
        await client.query(sql);

        await client.query(
          "INSERT INTO migrations(name) VALUES($1)",
          [file]
        );
      }
    }

    console.log("Migrations completed");
  } finally {
    client.release();
  }
}
