// Emergency database fix - removes problematic table initialization
const pool = require('./config/db');

async function emergencyFix() {
  try {
    console.log('🔧 Running emergency database fix...');
    
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Existing tables:', tables.rows.map(r => r.table_name));
    
    // Create missing tables if needed
    const createPaymentsTable = `
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id VARCHAR(255),
        user_id INTEGER,
        investment_id INTEGER,
        amount DECIMAL(10,2) NOT NULL,
        method VARCHAR(50) DEFAULT 'mpesa',
        phone_number VARCHAR(20),
        mpesa_transaction_id VARCHAR(255),
        mpesa_receipt_number VARCHAR(255),
        callback_data JSONB,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    
    await pool.query(createPaymentsTable);
    console.log('✅ Payments table ready');
    
    console.log('🎉 Emergency fix completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Emergency fix failed:', error.message);
    process.exit(1);
  }
}

emergencyFix();