// Fix database issues for M-PESA and Investment system
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function fixDatabase() {
  try {
    console.log('🔧 Fixing database issues...');
    
    // Create pending_investments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_investments (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        plan_id INT NOT NULL,
        plan_name VARCHAR(100) NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        daily_return_rate NUMERIC(5,4) NOT NULL,
        duration_days INT NOT NULL,
        phone_number VARCHAR(15) NOT NULL,
        checkout_request_id VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Created pending_investments table');

    // Add missing columns to payments table
    try {
      await pool.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id)');
      await pool.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS investment_id INT REFERENCES investments(id)');
      await pool.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS mpesa_transaction_id VARCHAR(100)');
      await pool.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS mpesa_receipt_number VARCHAR(100)');
      await pool.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15)');
      await pool.query('ALTER TABLE payments ADD COLUMN IF NOT EXISTS callback_data JSONB');
      console.log('✅ Added missing columns to payments table');
    } catch (err) {
      console.log('⚠️ Some columns may already exist');
    }

    console.log('🎉 Database fixes completed successfully!');
    
  } catch (error) {
    console.error('❌ Database fix failed:', error.message);
  } finally {
    await pool.end();
  }
}

fixDatabase();