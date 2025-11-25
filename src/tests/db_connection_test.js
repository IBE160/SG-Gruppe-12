const { pool } = require('../config/db.config');

async function testConnection() {
  let client;
  try {
    client = await pool.connect();
    console.log('Successfully connected to the PostgreSQL database.');
    const res = await client.query('SELECT NOW()');
    console.log('Current time from database:', res.rows[0].now);
    return true;
  } catch (err) {
    console.error('Failed to connect to the PostgreSQL database:', err.stack);
    return false;
  } finally {
    if (client) {
      client.release();
    }
    pool.end();
  }
}

testConnection();
