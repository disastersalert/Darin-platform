export const dbConnect = async () => {
  const client = await pool.connect();
  try {
    const result = await client.query('SELECT NOW()');
    console.log("Database connected at:", result.rows[0].now);
    return result.rows[0];
  } finally {
    client.release();
  }
};
