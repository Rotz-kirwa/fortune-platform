// Update production database with new tiered plans
require('dotenv').config();

// Use production database URL
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://fortune_db_pp47_user:2pxzt84cya6TfXle7mLTViUSDCp9Zd8c@dpg-d3tl10f5r7bs73etoil0-a.oregon-postgres.render.com/fortune_db_pp47',
  ssl: { rejectUnauthorized: false }
});

async function updateProductionPlans() {
  try {
    console.log('🔄 Updating PRODUCTION investment plans...');
    
    // Delete existing plans
    await pool.query('DELETE FROM investment_plans');
    console.log('✅ Deleted old plans');
    
    const plans = [
      {
        name: 'Bronze',
        min_amount: 1,
        max_amount: 50,
        daily_return_rate: 0.01,
        duration_days: 30,
        description: 'Entry level - KSh 1 to KSh 50, earn 1% daily for 30 days'
      },
      {
        name: 'Silver',
        min_amount: 51,
        max_amount: 500,
        daily_return_rate: 0.015,
        duration_days: 30,
        description: 'Growing returns - KSh 51 to KSh 500, earn 1.5% daily for 30 days'
      },
      {
        name: 'Premium',
        min_amount: 501,
        max_amount: 5000,
        daily_return_rate: 0.02,
        duration_days: 30,
        description: 'Premium tier - KSh 501 to KSh 5,000, earn 2% daily for 30 days'
      },
      {
        name: 'Platinum',
        min_amount: 5001,
        max_amount: 50000,
        daily_return_rate: 0.025,
        duration_days: 30,
        description: 'High returns - KSh 5,001 to KSh 50,000, earn 2.5% daily for 30 days'
      },
      {
        name: 'Diamond',
        min_amount: 50001,
        max_amount: 500000,
        daily_return_rate: 0.03,
        duration_days: 30,
        description: 'Elite tier - KSh 50,001 to KSh 500,000, earn 3% daily for 30 days'
      },
      {
        name: 'Gold',
        min_amount: 500001,
        max_amount: 1000000,
        daily_return_rate: 0.035,
        duration_days: 30,
        description: 'Ultimate tier - KSh 500,001 to KSh 1,000,000, earn 3.5% daily for 30 days'
      }
    ];
    
    console.log('📊 Creating new tiered plans:');
    for (const plan of plans) {
      const result = await pool.query(`
        INSERT INTO investment_plans (name, min_amount, max_amount, daily_return_rate, duration_days, description, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `, [
        plan.name,
        plan.min_amount,
        plan.max_amount,
        plan.daily_return_rate,
        plan.duration_days,
        plan.description,
        true
      ]);
      
      const totalReturn = (plan.daily_return_rate * plan.duration_days * 100).toFixed(1);
      console.log(`✅ ${plan.name}: KSh ${plan.min_amount}-${plan.max_amount.toLocaleString()} | ${(plan.daily_return_rate * 100)}% daily | ${totalReturn}% total`);
    }
    
    console.log('\n🎯 Production database updated successfully!');
    console.log('🔄 Frontend should now show new plans after refresh');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating production plans:', error);
    process.exit(1);
  }
}

updateProductionPlans();