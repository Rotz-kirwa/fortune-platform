// Test M-PESA Production System
require('dotenv').config();
const { initiateStkPush } = require('./lib/mpesa');

async function testMpesaProduction() {
  console.log('🧪 Testing M-PESA Production System...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log('MPESA_ENV:', process.env.MPESA_ENV);
  console.log('MPESA_SHORTCODE:', process.env.MPESA_SHORTCODE);
  console.log('MPESA_CALLBACK_URL:', process.env.MPESA_CALLBACK_URL);
  console.log('Consumer Key (first 10 chars):', process.env.MPESA_CONSUMER_KEY?.substring(0, 10) + '...');
  console.log('');

  // Test STK Push
  try {
    console.log('🚀 Testing STK Push...');
    const result = await initiateStkPush({
      amount: 100,
      phoneNumber: '254712345678', // Test number
      accountReference: 'TEST-INV-001'
    });
    
    console.log('✅ STK Push Success:');
    console.log('Response Code:', result.ResponseCode);
    console.log('Response Description:', result.ResponseDescription);
    console.log('Checkout Request ID:', result.CheckoutRequestID);
    console.log('Customer Message:', result.CustomerMessage);
    
  } catch (error) {
    console.error('❌ STK Push Failed:', error.message);
  }
}

testMpesaProduction();