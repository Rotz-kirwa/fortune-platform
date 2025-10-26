// models/Investment.js
const pool = require('../config/db');



const Investment = {
  async create({ user_id, plan_name, amount, daily_return_rate, duration_days }) {
    const maturity_date = new Date();
    maturity_date.setDate(maturity_date.getDate() + duration_days);
    
    const result = await pool.query(
      `INSERT INTO investments (user_id, plan_name, amount, daily_return_rate, duration_days, maturity_date) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, plan_name, amount, daily_return_rate, duration_days, maturity_date]
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
        COALESCE(SUM(total_return), 0) as total_returns,
        COALESCE(SUM(amount + total_return), 0) as portfolio_value
      FROM investments 
      WHERE user_id = $1 AND status = 'active'
    `, [user_id]);
    return result.rows[0];
  }
};



module.exports = Investment;