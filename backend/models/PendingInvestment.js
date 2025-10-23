// models/PendingInvestment.js
const pool = require('../config/db');

// Create pending_investments table
const initPendingInvestmentTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_investments (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        plan_id INT NOT NULL,
        plan_name VARCHAR(100) NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        daily_return_rate NUMERIC(5,4) NOT NULL,
        duration_days INT NOT NULL,
        phone_number VARCHAR(15) NOT NULL,
        checkout_request_id VARCHAR(100) UNIQUE NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '10 minutes')
      )
    `);
    console.log('✅ Pending investments table ready');
  } catch (error) {
    console.error('❌ Error initializing pending_investments table:', error.message);
  }
};

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

initPendingInvestmentTable();

module.exports = PendingInvestment;