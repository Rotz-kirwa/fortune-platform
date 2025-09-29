// models/Payment.js
const pool = require('../config/db');

// Create Payments table if not exists
const initPaymentTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      order_id INT REFERENCES orders(id) ON DELETE CASCADE,
      amount NUMERIC(10,2) NOT NULL,
      method VARCHAR(50) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const Payment = {
  async create({ order_id, amount, method }) {
    const result = await pool.query(
      'INSERT INTO payments (order_id, amount, method) VALUES ($1, $2, $3) RETURNING *',
      [order_id, amount, method]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query('SELECT * FROM payments ORDER BY created_at DESC');
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [id]);
    return result.rows[0];
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE payments SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
};

initPaymentTable();

module.exports = Payment;
