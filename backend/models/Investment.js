// models/Investment.js
const pool = require('../config/db');



const Investment = {
  async create({ user_id, plan_id, plan_name, amount, daily_return_rate, duration_days }) {
    const maturity_date = new Date();
    maturity_date.setDate(maturity_date.getDate() + duration_days);
    
    const result = await pool.query(
      `INSERT INTO investments (
        user_id, plan_id, plan_name, amount, daily_return_rate, duration_days, 
        maturity_date, current_return, current_value, progress, days_passed, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, 0.00, $4, 0.00, 0, 'active') RETURNING *`,
      [user_id, plan_id, plan_name, amount, daily_return_rate, duration_days, maturity_date]
    );
    return result.rows[0];
  },

  async findByUserId(user_id) {
    const result = await pool.query(
      'SELECT * FROM investments WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    return result.rows;
  },

  async findAll() {
    const result = await pool.query('SELECT * FROM investments ORDER BY created_at DESC');
    return result.rows;
  },

  async updateReturns(id, total_return) {
    const result = await pool.query(
      'UPDATE investments SET total_return = $1 WHERE id = $2 RETURNING *',
      [total_return, id]
    );
    return result.rows[0];
  },

  async getUserStats(user_id) {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_investments,
        COALESCE(SUM(amount), 0) as total_invested,
        COALESCE(SUM(current_return), 0) as total_returns,
        COALESCE(SUM(current_value), 0) as portfolio_value
      FROM investments 
      WHERE user_id = $1
    `, [user_id]);
    return result.rows[0];
  },
  
  async updateDailyReturns(id, current_return, current_value, progress, days_passed) {
    const result = await pool.query(
      `UPDATE investments 
       SET current_return = $1, current_value = $2, progress = $3, days_passed = $4, updated_at = NOW()
       WHERE id = $5 RETURNING *`,
      [current_return, current_value, progress, days_passed, id]
    );
    return result.rows[0];
  },
  
  async markCompleted(id) {
    const result = await pool.query(
      `UPDATE investments SET status = 'completed', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  },
  
  async getActiveInvestments() {
    const result = await pool.query(
      `SELECT i.*, ip.name as plan_name, ip.daily_return_rate, ip.duration_days
       FROM investments i
       LEFT JOIN investment_plans ip ON i.plan_id = ip.id
       WHERE i.status = 'active'
       ORDER BY i.created_at`
    );
    return result.rows;
  }
};



module.exports = Investment;