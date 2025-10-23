// models/Payment.js
const pool = require('../config/db');

// Create Payments table if not exists
const initPaymentTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        user_id INT REFERENCES users(id),
        investment_id INT REFERENCES investments(id),
        amount NUMERIC(10,2) NOT NULL,
        method VARCHAR(50) NOT NULL DEFAULT 'mpesa',
        status VARCHAR(20) DEFAULT 'pending',
        mpesa_transaction_id VARCHAR(100),
        mpesa_receipt_number VARCHAR(100),
        phone_number VARCHAR(15),
        callback_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Payments table ready');
  } catch (error) {
    console.error('❌ Error initializing payments table:', error.message);
  }
};

const Payment = {
  async create({ order_id, user_id, investment_id, amount, method, phone_number, mpesa_transaction_id }) {
    const result = await pool.query(
      `INSERT INTO payments (order_id, user_id, investment_id, amount, method, phone_number, mpesa_transaction_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [order_id, user_id, investment_id, amount, method, phone_number, mpesa_transaction_id]
    );
    return result.rows[0];
  },

  async findByMpesaTransactionId(mpesa_transaction_id) {
    const result = await pool.query(
      'SELECT * FROM payments WHERE mpesa_transaction_id = $1',
      [mpesa_transaction_id]
    );
    return result.rows[0];
  },

  async updateWithCallback(id, callback_data, mpesa_receipt_number, status) {
    const result = await pool.query(
      `UPDATE payments 
       SET callback_data = $1, mpesa_receipt_number = $2, status = $3 
       WHERE id = $4 RETURNING *`,
      [JSON.stringify(callback_data), mpesa_receipt_number, status, id]
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
