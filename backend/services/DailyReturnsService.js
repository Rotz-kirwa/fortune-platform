// Daily returns calculation service
const pool = require('../config/db');
const cron = require('node-cron');

class DailyReturnsService {
  
  // Calculate and update daily returns for all active investments
  static async calculateDailyReturns() {
    try {
      console.log('🔄 Starting daily returns calculation...');
      
      // Get all active investments with their plan details
      const query = `
        SELECT 
          i.id,
          i.user_id,
          i.amount,
          i.created_at,
          ip.daily_return_rate,
          ip.duration_days,
          ip.name as plan_name
        FROM investments i
        JOIN investment_plans ip ON i.plan_id = ip.id
        WHERE i.status = 'active'
        AND i.created_at < CURRENT_DATE
      `;
      
      const result = await pool.query(query);
      const investments = result.rows;
      
      console.log(`📊 Processing ${investments.length} active investments...`);
      
      for (const investment of investments) {
        await this.processInvestmentReturn(investment);
      }
      
      console.log('✅ Daily returns calculation completed!');
      
    } catch (error) {
      console.error('❌ Error calculating daily returns:', error);
    }
  }
  
  // Process individual investment return
  static async processInvestmentReturn(investment) {
    try {
      const { id, user_id, amount, created_at, daily_return_rate, duration_days, plan_name } = investment;
      
      // Calculate days passed
      const startDate = new Date(created_at);
      const today = new Date();
      const daysPassed = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
      
      // Skip if investment just started today
      if (daysPassed <= 0) return;
      
      // Check if investment has matured
      if (daysPassed >= duration_days) {
        await this.matureInvestment(investment);
        return;
      }
      
      // Calculate daily return
      const dailyReturn = parseFloat(amount) * parseFloat(daily_return_rate);
      const totalReturns = dailyReturn * daysPassed;
      const currentValue = parseFloat(amount) + totalReturns;
      const progress = (daysPassed / duration_days) * 100;
      
      // Update investment
      await pool.query(
        `UPDATE investments 
         SET current_return = $1, current_value = $2, progress = $3, days_passed = $4, updated_at = CURRENT_TIMESTAMP
         WHERE id = $5`,
        [totalReturns.toFixed(2), currentValue.toFixed(2), progress.toFixed(1), daysPassed, id]
      );
      
      // Create transaction record for today's return
      const transactionExists = await pool.query(
        `SELECT id FROM transactions 
         WHERE user_id = $1 AND type = 'return' AND DATE(created_at) = CURRENT_DATE
         AND reference LIKE $2`,
        [user_id, `daily_return_${id}_%`]
      );
      
      if (transactionExists.rows.length === 0) {
        await pool.query(
          `INSERT INTO transactions (user_id, type, amount, reference, description, status)
           VALUES ($1, 'return', $2, $3, $4, 'completed')`,
          [
            user_id,
            dailyReturn.toFixed(2),
            `daily_return_${id}_${daysPassed}`,
            `Daily return for ${plan_name} investment - Day ${daysPassed}`
          ]
        );
        
        console.log(`💰 Added daily return: User ${user_id}, Investment ${id}, Amount: ${dailyReturn.toFixed(2)}`);
      }
      
    } catch (error) {
      console.error(`❌ Error processing investment ${investment.id}:`, error);
    }
  }
  
  // Mature completed investments
  static async matureInvestment(investment) {
    try {
      const { id, user_id, amount, duration_days, daily_return_rate, plan_name } = investment;
      
      // Calculate final returns
      const dailyReturn = parseFloat(amount) * parseFloat(daily_return_rate);
      const totalReturns = dailyReturn * duration_days;
      const finalValue = parseFloat(amount) + totalReturns;
      
      // Update investment to completed
      await pool.query(
        `UPDATE investments 
         SET status = 'completed', current_return = $1, current_value = $2, 
             progress = 100, days_passed = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4`,
        [totalReturns.toFixed(2), finalValue.toFixed(2), duration_days, id]
      );
      
      // Add final transaction
      await pool.query(
        `INSERT INTO transactions (user_id, type, amount, reference, description, status)
         VALUES ($1, 'maturity', $2, $3, $4, 'completed')`,
        [
          user_id,
          finalValue.toFixed(2),
          `maturity_${id}`,
          `${plan_name} investment matured - Final payout`
        ]
      );
      
      console.log(`🎉 Investment ${id} matured: User ${user_id}, Final value: ${finalValue.toFixed(2)}`);
      
    } catch (error) {
      console.error(`❌ Error maturing investment ${investment.id}:`, error);
    }
  }
  
  // Start the cron job
  static startDailyReturnsJob() {
    // Run every day at midnight (00:00)
    cron.schedule('0 0 * * *', () => {
      console.log('🕛 Midnight: Starting daily returns calculation...');
      this.calculateDailyReturns();
    });
    
    console.log('⏰ Daily returns cron job started - runs at midnight');
  }
  
  // Manual trigger for testing
  static async triggerManualCalculation() {
    console.log('🔧 Manual trigger: Calculating daily returns...');
    await this.calculateDailyReturns();
  }
}

module.exports = DailyReturnsService;