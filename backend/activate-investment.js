// Manually activate the 1 KSh investment
require('dotenv').config();
const pool = require('./config/db');

async function activateInvestment() {
  try {
    console.log('🔄 Activating 1 KSh Bronze investment...');
    
    // Find the pending 1 KSh investment
    const pending = await pool.query(
      'SELECT * FROM pending_investments WHERE amount = $1 AND status = $2 ORDER BY created_at DESC LIMIT 1',
      ['1.00', 'pending']
    );
    
    if (pending.rows.length === 0) {
      console.log('❌ No pending 1 KSh investment found');
      return;
    }
    
    const pendingInv = pending.rows[0];
    console.log('📋 Found pending investment:', pendingInv.checkout_request_id);
    
    // Create active investment
    const result = await pool.query(`
      INSERT INTO investments (user_id, plan_name, amount, daily_return_rate, duration_days, status, created_at, maturity_date)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days')
      RETURNING *
    `, [
      pendingInv.user_id,
      pendingInv.plan_name,
      pendingInv.amount,
      pendingInv.daily_return_rate,
      pendingInv.duration_days,
      'active'
    ]);
    
    // Update pending investment status
    await pool.query(
      'UPDATE pending_investments SET status = $1 WHERE id = $2',
      ['completed', pendingInv.id]
    );
    
    console.log('✅ Investment activated successfully!');
    console.log('📊 Investment details:', {
      amount: result.rows[0].amount,
      plan: result.rows[0].plan_name,
      daily_return: result.rows[0].daily_return_rate,
      duration: result.rows[0].duration_days
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

activateInvestment();