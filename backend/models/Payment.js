// models/Payment.js
const pool = require('../config/db');

// Check if payments table exists (don't create in production)
const initPaymentTable = async () => {
  try {
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'payments'
      )
    `);
    
    if (result.rows[0].exists) {
      console.log('✅ Payments table exists');
    } else {
      console.log('❌ Payments table missing - contact admin to create it');
    }
  } catch (error) {
    console.error('❌ Error checking payments table:', error.message);
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

// Only check table in production, don't create
if (process.env.NODE_ENV !== 'production') {
  initPaymentTable();
}

module.exports = Payment;
