// Security fix script - addresses critical vulnerabilities
const pool = require('./config/db');

async function securityFix() {
  try {
    console.log('🔒 Running security fixes...');
    
    // 1. Add database indexes for performance
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number)',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_investments_user ON investments(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status)',
      'CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)',
      'CREATE INDEX IF NOT EXISTS idx_payments_mpesa_id ON payments(mpesa_transaction_id)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, created_at)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_type_status ON transactions(type, status)'
    ];
    
    for (const index of indexes) {
      await pool.query(index);
    }
    console.log('✅ Database indexes created');
    
    // 2. Create audit log table for security tracking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        action VARCHAR(100) NOT NULL,
        resource VARCHAR(100),
        resource_id VARCHAR(100),
        ip_address INET,
        user_agent TEXT,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON audit_logs(user_id, action)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at)');
    console.log('✅ Audit logging table created');
    
    // 3. Add security constraints
    await pool.query(`
      ALTER TABLE users 
      ADD CONSTRAINT IF NOT EXISTS chk_phone_format 
      CHECK (phone_number ~ '^254[0-9]{9}$')
    `);
    
    await pool.query(`
      ALTER TABLE payments 
      ADD CONSTRAINT IF NOT EXISTS chk_amount_positive 
      CHECK (amount > 0)
    `);
    
    console.log('✅ Security constraints added');
    
    console.log('🎉 Security fixes completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Security fix failed:', error.message);
    process.exit(1);
  }
}

securityFix();