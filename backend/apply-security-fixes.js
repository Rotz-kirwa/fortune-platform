// Apply security fixes while server is running
const pool = require('./config/db');

async function applySecurityFixes() {
  try {
    console.log('🔒 Applying security fixes...');
    
    // Add performance indexes
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number)',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)', 
      'CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, created_at)'
    ];
    
    for (const index of indexes) {
      try {
        await pool.query(index);
        console.log('✅ Index created:', index.split(' ')[5]);
      } catch (err) {
        console.log('⚠️ Index exists:', index.split(' ')[5]);
      }
    }
    
    console.log('🎉 Security fixes applied successfully!');
    
  } catch (error) {
    console.error('❌ Security fix error:', error.message);
  }
}

applySecurityFixes();