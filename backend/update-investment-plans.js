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
        description: 'KSh 20-50, 3.5% daily',
        min_amount: 20,
        max_amount: 50,
        daily_return_rate: 0.035,
        duration_days: 90
      },
      {
        name: 'Silver',
        description: 'KSh 51-500, 4% daily',
        min_amount: 51,
        max_amount: 500,
        daily_return_rate: 0.04,
        duration_days: 90
      },
      {
        name: 'Premium',
        description: 'KSh 501-5K, 4.5% daily',
        min_amount: 501,
        max_amount: 5000,
        daily_return_rate: 0.045,
        duration_days: 90
      },
      {
        name: 'Platinum',
        description: 'KSh 5K-50K, 5% daily',
        min_amount: 5000,
        max_amount: 50000,
        daily_return_rate: 0.05,
        duration_days: 90
      },
      {
        name: 'Diamond',
        description: 'KSh 50K-500K, 5.5% daily',
        min_amount: 50000,
        max_amount: 500000,
        daily_return_rate: 0.055,
        duration_days: 90
      },
      {
        name: 'Gold',
        description: 'KSh 500K-1M, 6% daily',
        min_amount: 500000,
        max_amount: 1000000,
        daily_return_rate: 0.06,
        duration_days: 90
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