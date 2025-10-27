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
    
    console.log('STK Push request:', { amount, phoneNumber, accountReference });
    
    if (!amount || !phoneNumber) {
      return res.status(400).json({ error: 'Amount and phone number required' });
    }
    
    // Validate phone number format
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (!cleanPhone.startsWith('254') || cleanPhone.length !== 12) {
      return res.status(400).json({ error: 'Phone number must be in format 254XXXXXXXXX' });
    }
    
    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount < 1) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    // Initiate STK Push
    const result = await initiateStkPush({ 
      amount: Math.round(numAmount), 
      phoneNumber: cleanPhone, 
      accountReference: accountReference || 'Investment'
    });
    
    console.log('STK Push result:', result);
    res.json(result);
  } catch (err) {
    console.error('STK Push error:', err.response?.data || err.message);
    res.status(500).json({ 
      error: 'Payment initiation failed',
      details: err.response?.data?.errorMessage || err.message
    });
  }
});

// Withdrawal endpoint
router.post('/withdraw', async (req, res) => {
  try {
    const { amount } = req.body;
    
    console.log('💰 Withdrawal request received:', { amount });
    
    // Validate amount
    if (!amount || isNaN(amount) || amount < 1) {
      return res.status(400).json({ 
        error: 'Invalid amount',
        message: 'Please provide a valid withdrawal amount'
      });
    }

    // Check minimum withdrawal amount
    const MIN_WITHDRAWAL = 100;
    if (amount < MIN_WITHDRAWAL) {
      return res.status(400).json({ 
        error: 'Amount too low',
        message: `Minimum withdrawal amount is KSh ${MIN_WITHDRAWAL}`
      });
    }

    // TODO: Check user balance
    // TODO: Create withdrawal record
    // TODO: Initiate M-PESA B2C payment
    
    // For now, just log and return success message
    console.log(`✅ Withdrawal request accepted: KSh ${amount}`);
    
    res.json({ 
      success: true,
      message: `Withdrawal request for KSh ${amount} has been submitted successfully!\n\nYour request is being processed and will be sent to your M-PESA account within 24 hours.`,
      amount: amount,
      status: 'pending'
    });
    
  } catch (err) {
    console.error('❌ Withdrawal error:', err.message);
    res.status(500).json({ 
      error: 'Withdrawal failed',
      message: 'Unable to process withdrawal request. Please try again later.'
    });
  }
});

// M-PESA STK Push Callback endpoint
router.post('/callback', async (req, res) => {
  try {
    console.log('🔔 M-PESA Callback received:', JSON.stringify(req.body, null, 2));
    
    const { Body } = req.body;
    if (Body && Body.stkCallback) {
      const { ResultCode, ResultDesc, CheckoutRequestID, CallbackMetadata } = Body.stkCallback;
      
      if (ResultCode === 0) {
        console.log('✅ Payment successful:', CheckoutRequestID);
        
        // Find pending investment
        const PendingInvestment = require('../models/PendingInvestment');
        const Investment = require('../models/Investment');
        
        const pendingInvestment = await PendingInvestment.findByCheckoutRequestId(CheckoutRequestID);
        
        if (pendingInvestment) {
          // Create actual investment
          const investment = await Investment.create({
            user_id: pendingInvestment.user_id,
            plan_name: pendingInvestment.plan_name,
            amount: pendingInvestment.amount,
            daily_return_rate: pendingInvestment.daily_return_rate,
            duration_days: pendingInvestment.duration_days
          });
          
          // Update pending investment status
          await PendingInvestment.updateStatus(pendingInvestment.id, 'completed');
          
          console.log(`✅ Investment activated: User ${pendingInvestment.user_id}, Amount: KSh ${pendingInvestment.amount}`);
        } else {
          console.log('⚠️ No pending investment found for:', CheckoutRequestID);
        }
      } else {
        console.log('❌ Payment failed:', ResultDesc);
        
        // Mark pending investment as failed
        const PendingInvestment = require('../models/PendingInvestment');
        const pendingInvestment = await PendingInvestment.findByCheckoutRequestId(CheckoutRequestID);
        
        if (pendingInvestment) {
          await PendingInvestment.updateStatus(pendingInvestment.id, 'failed');
          console.log(`❌ Investment failed for user ${pendingInvestment.user_id}`);
        }
      }
    }
    
    // Always respond with success to M-PESA
    res.status(200).json({ 
      ResultCode: 0, 
      ResultDesc: 'Accepted' 
    });
  } catch (error) {
    console.error('Callback endpoint error:', error);
    res.status(200).json({ 
      ResultCode: 0, 
      ResultDesc: 'Accepted' 
    });
  }
});

// M-PESA B2C Callback endpoint (for withdrawals)
router.post('/b2c-callback', async (req, res) => {
  try {
    console.log('M-PESA B2C Callback received:', JSON.stringify(req.body, null, 2));
    
    // TODO: Process B2C callback for withdrawals
    // This will be implemented in the withdrawal service
    
    res.status(200).json({ 
      ResultCode: 0, 
      ResultDesc: 'Accepted' 
    });
  } catch (error) {
    console.error('B2C Callback error:', error);
    res.status(200).json({ 
      ResultCode: 0, 
      ResultDesc: 'Accepted' 
    });
  }
});

// M-PESA B2C Timeout endpoint
router.post('/b2c-timeout', async (req, res) => {
  try {
    console.log('M-PESA B2C Timeout received:', JSON.stringify(req.body, null, 2));
    
    // TODO: Handle B2C timeout for withdrawals
    
    res.status(200).json({ 
      ResultCode: 0, 
      ResultDesc: 'Accepted' 
    });
  } catch (error) {
    console.error('B2C Timeout error:', error);
    res.status(200).json({ 
      ResultCode: 0, 
      ResultDesc: 'Accepted' 
    });
  }
});

// M-PESA Confirmation endpoint (C2B)
router.post('/confirmation', (req, res) => {
  console.log('M-PESA Confirmation received:', JSON.stringify(req.body, null, 2));
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// M-PESA Validation endpoint (C2B)
router.post('/validation', (req, res) => {
  console.log('M-PESA Validation received:', JSON.stringify(req.body, null, 2));
  res.status(200).json({ ResultCode: 0, ResultDesc: 'Accepted' });
});

// Test M-PESA credentials endpoint
router.get('/test-credentials', async (req, res) => {
  try {
    const { getToken } = require('../lib/mpesa');
    const token = await getToken();
    res.json({ 
      success: true, 
      message: 'M-PESA credentials are valid',
      tokenLength: token.length,
      env: process.env.MPESA_ENV,
      consumerKey: process.env.MPESA_CONSUMER_KEY?.substring(0, 10) + '...',
      shortcode: process.env.MPESA_SHORTCODE
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      env: process.env.MPESA_ENV,
      consumerKey: process.env.MPESA_CONSUMER_KEY?.substring(0, 10) + '...',
      shortcode: process.env.MPESA_SHORTCODE
    });
  }
});

module.exports = router;
