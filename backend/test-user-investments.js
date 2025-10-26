// Test user investments for user ID 1
require('dotenv').config();
const pool = require('./config/db');

async function testUserInvestments() {
  try {
    console.log('🔍 Getting investments for user ID 1...');
    
    const investments = await pool.query(
      'SELECT * FROM investments WHERE user_id = $1 ORDER BY created_at DESC',
      [1]
    );
    
    console.log(`📊 Found ${investments.rows.length} investments:`);
    
    investments.rows.forEach((inv, index) => {
      const daysPassed = Math.floor((new Date() - new Date(inv.created_at)) / (1000 * 60 * 60 * 24));
      const currentReturn = inv.amount * inv.daily_return_rate * Math.min(daysPassed, inv.duration_days);
      const currentValue = parseFloat(inv.amount) + currentReturn;
      
      console.log(`\n${index + 1}. ${inv.plan_name}`);
      console.log(`   Amount: KSh ${inv.amount}`);
      console.log(`   Daily Return: ${(inv.daily_return_rate * 100)}%`);
      console.log(`   Days Passed: ${daysPassed}`);
      console.log(`   Current Return: KSh ${currentReturn.toFixed(2)}`);
      console.log(`   Current Value: KSh ${currentValue.toFixed(2)}`);
      console.log(`   Status: ${inv.status}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testUserInvestments();