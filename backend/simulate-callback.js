// Simulate M-PESA callback for local testing
require('dotenv').config();
const axios = require('axios');

async function simulateCallback() {
  try {
    console.log('🔄 Simulating M-PESA callback for pending investments...');
    
    // Get the latest pending investment
    const pool = require('./config/db');
    const pending = await pool.query(
      'SELECT * FROM pending_investments WHERE status = $1 ORDER BY created_at DESC LIMIT 1',
      ['pending']
    );
    
    if (pending.rows.length === 0) {
      console.log('❌ No pending investments found');
      return;
    }
    
    const pendingInv = pending.rows[0];
    console.log('📋 Found pending investment:', pendingInv.checkout_request_id);
    
    // Simulate successful M-PESA callback
    const callbackData = {
      Body: {
        stkCallback: {
          MerchantRequestID: "merchant-123",
          CheckoutRequestID: pendingInv.checkout_request_id,
          ResultCode: 0,
          ResultDesc: "The service request is processed successfully.",
          CallbackMetadata: {
            Item: [
              { Name: "Amount", Value: pendingInv.amount },
              { Name: "MpesaReceiptNumber", Value: "TEST123456" },
              { Name: "TransactionDate", Value: new Date().toISOString() },
              { Name: "PhoneNumber", Value: pendingInv.phone_number }
            ]
          }
        }
      }
    };
    
    // Send callback to local server
    const response = await axios.post('http://localhost:4000/api/payments/callback', callbackData, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Callback sent successfully');
    console.log('📊 Response:', response.data);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

simulateCallback();