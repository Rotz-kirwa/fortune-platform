const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'fortune_investment',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

class DailyReturnsService {
  
  async calculateDailyReturns() {
    const client = await pool.connect();
    
    try {
      console.log('🔄 Starting daily returns calculation...');
      
      // Get all active investments
      const activeInvestments = await client.query(`
        SELECT i.*, ip.daily_return_rate, ip.duration_days, ip.name as plan_name
        FROM investments i
        JOIN investment_plans ip ON i.plan_id = ip.id
        WHERE i.status = 'active'
        AND i.created_at::date <= CURRENT_DATE
      `);
      
      console.log(`📊 Found ${activeInvestments.rows.length} active investments`);
      
      for (const investment of activeInvestments.rows) {
        await this.processInvestment(client, investment);
      }
      
      console.log('✅ Daily returns calculation completed');
      
    } catch (error) {
      console.error('❌ Error calculating daily returns:', error);
      throw error;
    } finally {
      client.release();
    }
  }
  
  async processInvestment(client, investment) {
    try {
      // Calculate days passed since investment creation
      const daysPassed = await client.query(`
        SELECT EXTRACT(DAY FROM CURRENT_DATE - $1::date) as days_passed
      `, [investment.created_at]);
      
      const daysPassedCount = parseInt(daysPassed.rows[0].days_passed);
      
      // Skip if investment hasn't started yet or is completed
      if (daysPassedCount < 0 || daysPassedCount >= investment.duration_days) {
        if (daysPassedCount >= investment.duration_days) {
          // Mark investment as completed
          await client.query(`
            UPDATE investments 
            SET status = 'completed', updated_at = NOW()
            WHERE id = $1
          `, [investment.id]);
          console.log(`📋 Investment ${investment.id} marked as completed`);
        }
        return;
      }
      
      // Calculate daily return
      const principal = parseFloat(investment.amount);
      const dailyRate = parseFloat(investment.daily_return_rate);
      const dailyReturn = principal * dailyRate;
      
      // Check if return for today already exists
      const existingReturn = await client.query(`
        SELECT id FROM daily_returns 
        WHERE investment_id = $1 AND return_date = CURRENT_DATE
      `, [investment.id]);
      
      if (existingReturn.rows.length > 0) {
        console.log(`⏭️  Return already calculated for investment ${investment.id} today`);
        return;
      }
      
      // Add daily return record
      await client.query(`
        INSERT INTO daily_returns (investment_id, amount, return_date, created_at)
        VALUES ($1, $2, CURRENT_DATE, NOW())
      `, [investment.id, dailyReturn]);
      
      // Update investment current return and progress
      const totalReturns = await client.query(`
        SELECT COALESCE(SUM(amount), 0) as total_returns
        FROM daily_returns
        WHERE investment_id = $1
      `, [investment.id]);
      
      const currentReturn = parseFloat(totalReturns.rows[0].total_returns);
      const progress = Math.min((daysPassedCount / investment.duration_days) * 100, 100);
      const currentValue = principal + currentReturn;
      
      await client.query(`
        UPDATE investments 
        SET current_return = $1, 
            current_value = $2,
            progress = $3,
            days_passed = $4,
            updated_at = NOW()
        WHERE id = $5
      `, [currentReturn, currentValue, progress, daysPassedCount, investment.id]);
      
      console.log(`💰 Added KSh ${dailyReturn} return to investment ${investment.id} (${investment.plan_name})`);
      
    } catch (error) {
      console.error(`❌ Error processing investment ${investment.id}:`, error);
    }
  }
  
  async createDailyReturnsTable() {
    const client = await pool.connect();
    
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS daily_returns (
          id SERIAL PRIMARY KEY,
          investment_id INTEGER REFERENCES investments(id) ON DELETE CASCADE,
          amount DECIMAL(15,2) NOT NULL,
          return_date DATE NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(investment_id, return_date)
        )
      `);
      
      console.log('✅ Daily returns table created/verified');
      
    } catch (error) {
      console.error('❌ Error creating daily returns table:', error);
    } finally {
      client.release();
    }
  }
}

module.exports = new DailyReturnsService();