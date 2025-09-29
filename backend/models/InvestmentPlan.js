// models/InvestmentPlan.js
const pool = require('../config/db');

// Create Investment Plans table
const initPlanTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS investment_plans (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      min_amount NUMERIC(10,2) NOT NULL,
      max_amount NUMERIC(10,2) NOT NULL,
      daily_return_rate NUMERIC(5,4) NOT NULL,
      duration_days INT NOT NULL,
      description TEXT,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert default plans
  const existingPlans = await pool.query('SELECT COUNT(*) FROM investment_plans');
  if (parseInt(existingPlans.rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO investment_plans (name, min_amount, max_amount, daily_return_rate, duration_days, description) VALUES
      ('Starter Plan', 13000, 130000, 0.015, 30, 'Perfect for beginners - 1.5% daily returns for 30 days'),
      ('Growth Plan', 130000, 650000, 0.025, 45, 'Accelerated growth - 2.5% daily returns for 45 days'),
      ('Premium Plan', 650000, 2600000, 0.035, 60, 'Premium returns - 3.5% daily returns for 60 days'),
      ('VIP Plan', 2600000, 13000000, 0.045, 90, 'VIP exclusive - 4.5% daily returns for 90 days')
    `);
  }
};

const InvestmentPlan = {
  async findAll() {
    const result = await pool.query(
      'SELECT * FROM investment_plans WHERE is_active = true ORDER BY min_amount ASC'
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM investment_plans WHERE id = $1', [id]);
    return result.rows[0];
  }
};

initPlanTable();

module.exports = InvestmentPlan;