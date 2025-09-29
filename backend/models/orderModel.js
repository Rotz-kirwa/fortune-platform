// models/orderModel.js
const pool = require('../config/db');

async function createOrder({ user_id = null, amount_cents, description = null }) {
  const q = `
    INSERT INTO orders (user_id, amount_cents, description)
    VALUES ($1,$2,$3)
    RETURNING *`;
  const { rows } = await pool.query(q, [user_id, amount_cents, description]);
  return rows[0];
}

async function getAllOrders() {
  const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
  return rows;
}

async function getOrderById(id) {
  const { rows } = await pool.query('SELECT * FROM orders WHERE id=$1', [id]);
  return rows[0];
}

async function updateOrderStatus(id, status) {
  const { rows } = await pool.query(
    'UPDATE orders SET status=$1 WHERE id=$2 RETURNING *',
    [status, id]
  );
  return rows[0];
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus
};
