// Clear all users from database
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function clearUsers() {
  try {
    console.log('🗑️ Clearing all users...');
    
    // Clear related tables first (foreign key constraints) - only if they exist
    const tables = ['investments', 'pending_investments', 'payments', 'orders', 'transactions'];
    
    for (const table of tables) {
      try {
        const result = await pool.query(`DELETE FROM ${table}`);
        console.log(`✅ Cleared ${result.rowCount} records from ${table}`);
      } catch (err) {
        if (err.code === '42P01') { // Table doesn't exist
          console.log(`⚠️ Table ${table} doesn't exist - skipping`);
        } else {
          throw err;
        }
      }
    }
    
    // Clear users table
    const result = await pool.query('DELETE FROM users');
    console.log(`✅ Cleared ${result.rowCount} users`);
    console.log('🎯 Database is now clean - ready for fresh registration');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error clearing users:', error.message);
    process.exit(1);
  }
}

clearUsers();