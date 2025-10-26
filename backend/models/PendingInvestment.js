// models/PendingInvestment.js
const pool = require('../config/db');



const PendingInvestment = {
  async create({ user_id, plan_id, plan_name, amount, daily_return_rate, duration_days, phone_number, checkout_request_id }) {
    const result = await pool.query(
      `INSERT INTO pending_investments (user_id, plan_id, plan_name, amount, daily_return_rate, duration_days, phone_number, checkout_request_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [user_id, plan_id, plan_name, amount, daily_return_rate, duration_days, phone_number, checkout_request_id]
    );
    return result.rows[0];
  },

  async findByCheckoutRequestId(checkout_request_id) {
    const result = await pool.query(
      'SELECT * FROM pending_investments WHERE checkout_request_id = $1',
      [checkout_request_id]
    );
    return result.rows[0];
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE pending_investments SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  },

  async delete(id) {
    const result = await pool.query(
      'DELETE FROM pending_investments WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  // Clean up expired pending investments
  async cleanupExpired() {
    const result = await pool.query(
      'DELETE FROM pending_investments WHERE expires_at < CURRENT_TIMESTAMP AND status = $1 RETURNING *',
      ['pending']
    );
    return result.rows;
  }
};



module.exports = PendingInvestment;