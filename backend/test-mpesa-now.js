// Quick M-PESA test
require('dotenv').config();
const { initiateStkPush } = require('./lib/mpesa');

async function testMpesa() {
  console.log('🧪 Testing M-PESA...');
  
  try {
    const result = await initiateStkPush({
      amount: 100,
      phoneNumber: '254712345678',
      accountReference: 'TEST'
    });
    
    console.log('✅ M-PESA STK Push Success:');
    console.log('Response Code:', result.ResponseCode);
    console.log('Checkout Request ID:', result.CheckoutRequestID);
    
  } catch (error) {
    console.error('❌ M-PESA Failed:', error.message);
  }
}

testMpesa();