// routes/payments.js
const express = require('express');
const paymentsController = require('../controllers/paymentsController');
const { initiateStkPush } = require('../lib/mpesa');
const router = express.Router();

router.get('/', paymentsController.getPayments);
router.get('/:id', paymentsController.getPaymentById);
router.post('/', paymentsController.createPayment);
router.put('/:id/status', paymentsController.updatePaymentStatus);

router.post('/stk', async (req, res) => {
  try {
    const { amount, phoneNumber, accountReference } = req.body;
    if (!amount || !phoneNumber) {
      return res.status(400).json({ error: 'Amount and phone number required' });
    }
    const result = await initiateStkPush({ amount, phoneNumber, accountReference });
    res.json(result);
  } catch (err) {
    console.error('STK Push error:', err.message);
    res.status(500).json({ error: 'Payment initiation failed' });
  }
});

router.post('/callback', (req, res) => {
  console.log('M-PESA Callback received:', req.body);
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

module.exports = router;
