const cron = require('node-cron');
const { Pool } = require('pg');

class AutomatedReturnsService {
  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/fortune_investment'
    });
    this.isRunning = false;
  }

  // Start the automated daily returns calculation
  startAutomatedReturns() {
    if (this.isRunning) {
      console.log('⚠️  Automated returns service already running');
      return;
    }

    console.log('🚀 Starting automated daily returns service...');
    
    // Run every day at midnight (0 0 * * *)
    // For testing, run every minute: '* * * * *'
    cron.schedule('0 0 * * *', async () => {
      await this.calculateDailyReturns();
    });

    // Also run immediately on startup
    setTimeout(() => {
      this.calculateDailyReturns();
    }, 5000);

    this.isRunning = true;
    console.log('✅ Automated returns service started - runs daily at midnight');
  }

  async calculateDailyReturns() {
    const client = await this.pool.connect();
    
    try {
      console.log('🔄 Running automated daily returns calculation...');
      
      // Get all active investments
      const result = await client.query(`
        SELECT i.*, ip.daily_return_rate, ip.duration_days, ip.name as plan_name
        FROM investments i
        JOIN investment_plans ip ON i.plan_id = ip.id
        WHERE i.status = 'active'
        ORDER BY i.created_at
      `);

      const activeInvestments = result.rows;
      console.log(`📊 Processing ${activeInvestments.length} active investments`);

      let updatedCount = 0;
      let completedCount = 0;

      for (const investment of activeInvestments) {
        const updated = await this.processInvestment(client, investment);
        if (updated === 'completed') {
          completedCount++;
        } else if (updated) {
          updatedCount++;
        }
      }

      console.log(`✅ Daily returns calculation completed:`);
      console.log(`   - Updated: ${updatedCount} investments`);
      console.log(`   - Completed: ${completedCount} investments`);
      
    } catch (error) {
      console.error('❌ Error in automated daily returns:', error);
    } finally {
      client.release();
    }
  }

  async processInvestment(client, investment) {
    try {
      // Calculate days passed since investment creation
      const createdDate = new Date(investment.created_at);
      const today = new Date();
      const daysPassed = Math.floor((today - createdDate) / (1000 * 60 * 60 * 24));

      // Skip if investment hasn't started yet
      if (daysPassed < 0) {
        return false;
      }

      // Check if investment should be completed
      if (daysPassed >= investment.duration_days) {
        await client.query(`
          UPDATE investments 
          SET status = 'completed', 
              days_passed = $1,
              progress = 100,
              updated_at = NOW()
          WHERE id = $2
        `, [investment.duration_days, investment.id]);
        
        console.log(`📋 Investment ${investment.id} (${investment.plan_name}) marked as completed`);
        return 'completed';
      }

      // Calculate current returns
      const principal = parseFloat(investment.amount);
      const dailyRate = parseFloat(investment.daily_return_rate);
      const totalReturns = principal * dailyRate * daysPassed;
      const currentValue = principal + totalReturns;
      const progress = Math.min((daysPassed / investment.duration_days) * 100, 100);

      // Update investment with current values
      await client.query(`
        UPDATE investments 
        SET current_return = $1,
            current_value = $2,
            progress = $3,
            days_passed = $4,
            updated_at = NOW()
        WHERE id = $5
      `, [totalReturns.toFixed(2), currentValue.toFixed(2), progress.toFixed(1), daysPassed, investment.id]);

      console.log(`💰 Updated investment ${investment.id}: Day ${daysPassed}/${investment.duration_days}, Returns: KSh ${totalReturns.toFixed(2)}`);
      return true;

    } catch (error) {
      console.error(`❌ Error processing investment ${investment.id}:`, error);
      return false;
    }
  }

  // Manual trigger for immediate calculation
  async triggerManualCalculation() {
    console.log('🔄 Manual daily returns calculation triggered...');
    await this.calculateDailyReturns();
  }

  // Stop the service
  stop() {
    this.isRunning = false;
    console.log('🛑 Automated returns service stopped');
  }
}

module.exports = new AutomatedReturnsService();