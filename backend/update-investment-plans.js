// Update investment plans to new Bronze to Gold system
const pool = require('./config/db');

async function updateInvestmentPlans() {
  try {
    console.log('🔄 Updating investment plans...');
    
    // Clear existing plans
    await pool.query('DELETE FROM investment_plans');
    
    // Insert new plans
    const newPlans = [
      {
        name: 'Bronze',
        description: 'Entry level - KSh 20 to KSh 50, earn 3.5% daily for 30 days',
        min_amount: 20,
        max_amount: 50,
        daily_return_rate: 0.035,
        duration_days: 30
      },
      {
        name: 'Silver',
        description: 'Growing returns - KSh 51 to KSh 500, earn 4% daily for 30 days',
        min_amount: 51,
        max_amount: 500,
        daily_return_rate: 0.04,
        duration_days: 30
      },
      {
        name: 'Premium',
        description: 'Premium tier - KSh 501 to KSh 5,000, earn 4.5% daily for 30 days',
        min_amount: 501,
        max_amount: 5000,
        daily_return_rate: 0.045,
        duration_days: 30
      },
      {
        name: 'Platinum',
        description: 'High returns - KSh 5,001 to KSh 50,000, earn 5% daily for 30 days',
        min_amount: 5001,
        max_amount: 50000,
        daily_return_rate: 0.05,
        duration_days: 30
      },
      {
        name: 'Diamond',
        description: 'Elite tier - KSh 50,001 to KSh 500,000, earn 5.5% daily for 30 days',
        min_amount: 50001,
        max_amount: 500000,
        daily_return_rate: 0.055,
        duration_days: 30
      },
      {
        name: 'Gold',
        description: 'Ultimate tier - KSh 500,001 to KSh 1,000,000, earn 6% daily for 30 days',
        min_amount: 500001,
        max_amount: 1000000,
        daily_return_rate: 0.06,
        duration_days: 30
      }
    ];
    
    for (const plan of newPlans) {
      await pool.query(
        `INSERT INTO investment_plans (name, description, min_amount, max_amount, daily_return_rate, duration_days)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [plan.name, plan.description, plan.min_amount, plan.max_amount, plan.daily_return_rate, plan.duration_days]
      );
      console.log(`✅ Created ${plan.name} plan`);
    }
    
    console.log('🎉 Investment plans updated successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Error updating plans:', error.message);
    process.exit(1);
  }
}

updateInvestmentPlans();