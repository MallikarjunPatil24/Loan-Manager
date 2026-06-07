const fs = require('fs');
const path = require('path');
const db = require('./db');

const migrate = async () => {
  try {
    console.log('Starting database schema migration...');
    
    // Read schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');
    
    // Execute the SQL queries
    await db.query(sql);
    
    console.log('Database tables successfully created!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrate();
