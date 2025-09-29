// models/Order.js
const pool = require('../config/db');

// Create Orders table if not exists
const initOrderTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      customer_name VARCHAR(100) NOT NULL,
      product VARCHAR(100) NOT NULL,
      amount NUMERIC(10,2) NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
};

const Order = {
  async create({ customer_name, product, amount }) {
    const result = await pool.query(
      'INSERT INTO orders (customer_name, product, amount) VALUES ($1, $2, $3) RETURNING *',
      [customer_name, product, amount]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query('SELECT * FROM orders WHERE id = $1', [id]);
    return result.rows[0];
  },

  async updateStatus(id, status) {
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );
    return result.rows[0];
  }
};

initOrderTable();

module.exports = Order;
