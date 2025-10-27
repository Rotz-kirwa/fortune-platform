// Create referrals table
const pool = require('./config/db');

async function createReferralsTable() {
  try {
    console.log('🔄 Creating referrals table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS referrals (
        id SERIAL PRIMARY KEY,
        referrer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        referred_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        commission_amount DECIMAL(10,2) DEFAULT 0.00,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('✅ Referrals table created successfully!');
    
    // Create indexes for better performance
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
      CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
    `);
    
    console.log('✅ Referrals table indexes created!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error creating referrals table:', error.message);
    process.exit(1);
  }
}

createReferralsTable();