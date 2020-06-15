const { createPool } = require('mysql');

const pool = createPool({
  port: process.env.PORT,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  connectionLimit: process.env.CONNECTION_LIMIT,
});

module.exports = pool;
