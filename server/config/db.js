const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/unnati_db';

let poolConfig = {};

// Parse URL manually to handle passwords with '@' characters safely
try {
  // Matches: postgresql://<user>:<password>@<host>:<port>/<database>
  // Handles multiple '@' symbols by making the password match greedy up to the last '@'
  const regex = /postgresql:\/\/([^:]+):(.*)@([^:]+):(\d+)\/(.+)/;
  const match = connectionString.match(regex);
  
  if (match) {
    const [_, user, password, host, port, database] = match;
    poolConfig = {
      user,
      password, // extracted raw password e.g. Mallu@123
      host,
      port: parseInt(port, 10),
      database,
      ssl: connectionString.includes('render') ? { rejectUnauthorized: false } : false
    };
  } else {
    poolConfig = {
      connectionString,
      ssl: connectionString.includes('render') ? { rejectUnauthorized: false } : false
    };
  }
} catch (err) {
  console.warn('Error parsing connection string, falling back to default:', err.message);
  poolConfig = { connectionString };
}

const pool = new Pool(poolConfig);

pool.on('connect', () => {
  console.log('Database connected successfully!');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
