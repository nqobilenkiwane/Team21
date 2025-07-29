// backend/db.js
const { Pool } = require('pg');
require('dotenv').config(); // Make sure dotenv is loaded to access .env variables

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  // Optional: SSL configuration if connecting to a cloud database (e.g., Heroku Postgres)
  // ssl: {
  //   rejectUnauthorized: false
  // }
});

// Test the connection when the module is initialized
// This will log success or error when your backend server starts
pool.connect()
  .then(client => {
    console.log('Successfully connected to PostgreSQL database!');
    client.release(); // Release the client back to the pool
  })
  .catch(err => {
    console.error('Error connecting to PostgreSQL database:', err.stack);
    // Optionally, you might want to exit the process if DB connection is critical for startup
    // process.exit(1);
  });

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool, // Export the pool itself for more advanced usage if needed
};