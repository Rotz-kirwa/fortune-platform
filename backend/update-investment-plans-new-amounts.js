const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/fortune_investment'
});

const updatedPlans = [
  {
    name: 'Bronze',
    min_amount: 100,
    max_amount: 500,
    daily_return_rate: 0.035, // 3.5%
    duration_days: 90,
    description: 'Entry level - KSh 100 to KSh 500, earn 3.5% daily for 90 days'
  },
  {
    name: 'Silver',
    min_amount: 501,
    max_amount: 2000,
    daily_return_rate: 0.04, // 4%
    duration_days: 90,
    description: 'Growing returns - KSh 501 to KSh 2,000, earn 4% daily for 90 days'
  },
  {
    name: 'Premium',
    min_amount: 2001,
    max_amount: 10000,
    daily_return_rate: 0.045, // 4.5%
    duration_days: 90,
    description: 'Premium tier - KSh 2,001 to KSh 10,000, earn 4.5% daily for 90 days'
  },
  {
    name: 'Platinum',
    min_amount: 10001,
    max_amount: 50000,
    daily_return_rate: 0.05, // 5%
    duration_days: 90,
    description: 'High returns - KSh 10,001 to KSh 50,000, earn 5% daily for 90 days'
  },
  {
    name: 'Diamond',
    min_amount: 50001,
    max_amount: 200000,
    daily_return_rate: 0.055, // 5.5%
    duration_days: 90,
    description: 'Elite tier - KSh 50,001 to KSh 200,000, earn 5.5% daily for 90 days'
  },
  {
    name: 'Gold',
    min_amount: 200001,
    max_amount: 1000000,
    daily_return_rate: 0.06, // 6%
    duration_days: 90,
    description: 'Ultimate tier - KSh 200,001 to KSh 1,000,000, earn 6% daily for 90 days'
  }
];

async function updateInvestmentPlans() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Updating investment plans with new amounts...');
    
    // Update each plan
    for (const plan of updatedPlans) {
      const result = await client.query(
        `UPDATE investment_plans 
         SET min_amount = $2, max_amount = $3, daily_return_rate = $4, 
             duration_days = $5, description = $6, updated_at = NOW()
         WHERE name = $1`,
        [plan.name, plan.min_amount, plan.max_amount, plan.daily_return_rate, 
         plan.duration_days, plan.description]
      );
      
      if (result.rowCount > 0) {
        console.log(`✅ Updated ${plan.name} plan: KSh ${plan.min_amount.toLocaleString()}-${plan.max_amount.toLocaleString()}`);
      } else {
        // If plan doesn't exist, insert it
        await client.query(
          `INSERT INTO investment_plans (name, min_amount, max_amount, daily_return_rate, duration_days, description)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [plan.name, plan.min_amount, plan.max_amount, plan.daily_return_rate, 
           plan.duration_days, plan.description]
        );
        console.log(`✅ Created ${plan.name} plan: KSh ${plan.min_amount.toLocaleString()}-${plan.max_amount.toLocaleString()}`);
      }
    }
    
    // Verify the updates
    console.log('\n📊 Updated investment plans:');
    const result = await client.query('SELECT * FROM investment_plans ORDER BY min_amount');
    result.rows.forEach(plan => {
      console.log(`${plan.name}: KSh ${parseInt(plan.min_amount).toLocaleString()}-${parseInt(plan.max_amount).toLocaleString()}, ${(plan.daily_return_rate * 100).toFixed(1)}% daily, ${plan.duration_days} days`);
    });
    
    console.log('\n🎉 Investment plans updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating investment plans:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateInvestmentPlans();