// controllers/paymentsController.js
const Payment = require('../models/Payment');

const paymentsController = {
  async createPayment(req, res) {
    try {
      const { order_id, amount, method } = req.body;
      if (!order_id || !amount || !method) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const payment = await Payment.create({ order_id, amount, method });
      res.status(201).json(payment);
    } catch (err) {
      console.error('Error creating payment:', err.message);
      res.status(500).json({ error: 'Server error' });
    }
  },

  async getPayments(req, res) {
    try {
      const payments = await Payment.findAll();
      res.json(payments);
    } catch (err) {
      console.error('Error fetching payments:', err.message);
      res.status(500).json({ error: 'Server error' });
    }
  },

  async getPaymentById(req, res) {
    try {
      const { id } = req.params;
      const payment = await Payment.findById(id);
      if (!payment) return res.status(404).json({ error: 'Payment not found' });
      res.json(payment);
    } catch (err) {
      console.error('Error fetching payment:', err.message);
      res.status(500).json({ error: 'Server error' });
    }
  },

  async updatePaymentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updated = await Payment.updateStatus(id, status);
      if (!updated) return res.status(404).json({ error: 'Payment not found' });
      res.json(updated);
    } catch (err) {
      console.error('Error updating payment:', err.message);
      res.status(500).json({ error: 'Server error' });
    }
  }
};

module.exports = paymentsController;
