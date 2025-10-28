const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/fortune_investment'
});

async function updateInvestmentsTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Updating investments table schema...');
    
    // Add missing columns if they don't exist
    const alterQueries = [
      `ALTER TABLE investments ADD COLUMN IF NOT EXISTS current_return DECIMAL(15,2) DEFAULT 0.00`,
      `ALTER TABLE investments ADD COLUMN IF NOT EXISTS current_value DECIMAL(15,2) DEFAULT 0.00`,
      `ALTER TABLE investments ADD COLUMN IF NOT EXISTS progress DECIMAL(5,2) DEFAULT 0.00`,
      `ALTER TABLE investments ADD COLUMN IF NOT EXISTS days_passed INTEGER DEFAULT 0`,
      `ALTER TABLE investments ADD COLUMN IF NOT EXISTS plan_id INTEGER`,
      `ALTER TABLE investments ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`,
      `ALTER TABLE investments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`
    ];
    
    for (const query of alterQueries) {
      try {
        await client.query(query);
        console.log('✅ Column added/verified');
      } catch (error) {
        if (error.code !== '42701') { // Column already exists
          console.error('Error adding column:', error.message);
        }
      }
    }
    
    // Update existing investments to have proper status
    await client.query(`
      UPDATE investments 
      SET status = 'active', 
          current_value = amount,
          updated_at = NOW()
      WHERE status IS NULL OR status = ''
    `);
    
    // Create index for better performance
    try {
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_investments_user_status 
        ON investments(user_id, status)
      `);
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_investments_status_created 
        ON investments(status, created_at)
      `);
      console.log('✅ Indexes created');
    } catch (error) {
      console.log('Index creation skipped (may already exist)');
    }
    
    console.log('🎉 Investments table updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating investments table:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateInvestmentsTable();