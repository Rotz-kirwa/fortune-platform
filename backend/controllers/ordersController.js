// controllers/ordersController.js
const Order = require('../models/Order');

const ordersController = {
  async createOrder(req, res) {
    try {
      const { customer_name, product, amount } = req.body;
      if (!customer_name || !product || !amount) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const order = await Order.create({ customer_name, product, amount });
      res.status(201).json(order);
    } catch (err) {
      console.error('Error creating order:', err.message);
      res.status(500).json({ error: 'Server error' });
    }
  },

  async getOrders(req, res) {
    try {
      const orders = await Order.findAll();
      res.json(orders);
    } catch (err) {
      console.error('Error fetching orders:', err.message);
      res.status(500).json({ error: 'Server error' });
    }
  },

  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);
      if (!order) return res.status(404).json({ error: 'Order not found' });
      res.json(order);
    } catch (err) {
      console.error('Error fetching order:', err.message);
      res.status(500).json({ error: 'Server error' });
    }
  },

  async updateOrderStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await Order.updateStatus(id, status);
      if (!updated) return res.status(404).json({ error: 'Order not found' });
      res.json(updated);
    } catch (err) {
      console.error('Error updating order:', err.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = ordersController;
