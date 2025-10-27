// Add database indexes for performance
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function addIndexes() {
  try {
    console.log('🔧 Adding performance indexes...');
    
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status)',
      'CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)',
      'CREATE INDEX IF NOT EXISTS idx_pending_investments_checkout_id ON pending_investments(checkout_request_id)'
    ];
    
    for (const index of indexes) {
      await pool.query(index);
    }
    
    console.log('✅ Performance indexes added successfully!');
    
  } catch (error) {
    console.error('❌ Index creation failed:', error.message);
  } finally {
    await pool.end();
  }
}

addIndexes();