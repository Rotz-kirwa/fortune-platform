// routes/test-env.js - Test endpoint to check M-PESA environment variables
const express = require('express');
const router = express.Router();

router.get('/test-env', (req, res) => {
  const mpesaVars = {
    MPESA_CONSUMER_KEY: process.env.MPESA_CONSUMER_KEY ? 'Set' : 'Missing',
    MPESA_CONSUMER_SECRET: process.env.MPESA_CONSUMER_SECRET ? 'Set' : 'Missing',
    MPESA_SHORTCODE: process.env.MPESA_SHORTCODE ? 'Set' : 'Missing',
    MPESA_PASSKEY: process.env.MPESA_PASSKEY ? 'Set' : 'Missing',
    MPESA_CALLBACK_URL: process.env.MPESA_CALLBACK_URL ? 'Set' : 'Missing',
    MPESA_ENV: process.env.MPESA_ENV ? 'Set' : 'Missing'
  };

  res.json({
    status: 'Environment Check',
    mpesa_variables: mpesaVars,
    all_set: Object.values(mpesaVars).every(val => val === 'Set')
  });
});

module.exports = router;