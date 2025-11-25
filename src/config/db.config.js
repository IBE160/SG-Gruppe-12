const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
  console.log('Connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

const testConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection test successful.');
  } catch (error) {
    console.error('Database connection test failed:', error.message);
    process.exit(-1); // Exit if cannot connect to DB
  }
};

testConnection(); // Call test connection on startup

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
  testConnection,
};