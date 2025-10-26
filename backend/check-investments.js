// Check pending and active investments
require('dotenv').config();
const pool = require('./config/db');

async function checkInvestments() {
  try {
    console.log('🔍 Checking investments...');
    
    // Check pending investments
    const pending = await pool.query('SELECT * FROM pending_investments ORDER BY created_at DESC LIMIT 5');
    console.log('\n⏳ Pending Investments:', pending.rows.length);
    pending.rows.forEach(inv => {
      console.log(`- ${inv.amount} KSh (${inv.plan_name}) - ${inv.status} - ${inv.checkout_request_id}`);
    });
    
    // Check active investments
    const active = await pool.query('SELECT * FROM investments ORDER BY created_at DESC LIMIT 5');
    console.log('\n✅ Active Investments:', active.rows.length);
    active.rows.forEach(inv => {
      console.log(`- ${inv.amount} KSh (${inv.plan_name}) - ${inv.status}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkInvestments();