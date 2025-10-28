const express = require('express');
const router = express.Router();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/fortune_investment'
});

// Manual trigger for daily returns calculation
router.post('/calculate-returns', async (req, res) => {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting manual daily returns calculation...');
    
    // Create daily_returns table if it doesn't exist
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
    
    // Get all active investments
    const activeInvestments = await client.query(`
      SELECT i.*, ip.daily_return_rate, ip.duration_days, ip.name as plan_name
      FROM investments i
      JOIN investment_plans ip ON i.plan_id = ip.id
      WHERE i.status = 'active'
    `);
    
    let updatedCount = 0;
    
    for (const investment of activeInvestments.rows) {
      // Calculate days passed
      const daysPassed = await client.query(`
        SELECT EXTRACT(DAY FROM CURRENT_DATE - $1::date) as days_passed
      `, [investment.created_at]);
      
      const daysPassedCount = Math.max(0, parseInt(daysPassed.rows[0].days_passed));
      
      if (daysPassedCount >= investment.duration_days) {
        // Mark as completed
        await client.query(`
          UPDATE investments SET status = 'completed' WHERE id = $1
        `, [investment.id]);
        continue;
      }
      
      // Calculate total returns that should exist
      const principal = parseFloat(investment.amount);
      const dailyRate = parseFloat(investment.daily_return_rate);
      const totalReturnsShouldBe = principal * dailyRate * daysPassedCount;
      
      // Update investment with correct values
      const progress = Math.min((daysPassedCount / investment.duration_days) * 100, 100);
      const currentValue = principal + totalReturnsShouldBe;
      
      await client.query(`
        UPDATE investments 
        SET current_return = $1, 
            current_value = $2,
            progress = $3,
            days_passed = $4,
            updated_at = NOW()
        WHERE id = $5
      `, [totalReturnsShouldBe, currentValue, progress, daysPassedCount, investment.id]);
      
      updatedCount++;
    }
    
    res.json({
      success: true,
      message: `Updated ${updatedCount} investments`,
      updatedCount
    });
    
  } catch (error) {
    console.error('Error calculating returns:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  } finally {
    client.release();
  }
});

module.exports = router;