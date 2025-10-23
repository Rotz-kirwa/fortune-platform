// test-production-mpesa.js - Test production M-PESA integration
const axios = require('axios');

async function testProductionMpesa() {
  try {
    console.log('🧪 Testing Production M-PESA Integration...\n');

    // Test with a real phone number (replace with your number)
    const testData = {
      amount: 10, // KSh 10 for testing
      phoneNumber: '254791260817', // Replace with your actual number
      accountReference: 'TEST-PROD'
    };

    console.log('📱 Sending STK Push to:', testData.phoneNumber);
    console.log('💰 Amount: KSh', testData.amount);

    const response = await axios.post('http://localhost:4000/api/pay/stk', testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('\n✅ STK Push Response:');
    console.log('ResponseCode:', response.data.ResponseCode);
    console.log('ResponseDescription:', response.data.ResponseDescription);
    console.log('CheckoutRequestID:', response.data.CheckoutRequestID);

    if (response.data.ResponseCode === '0') {
      console.log('\n🎉 SUCCESS! STK Push sent to production M-PESA');
      console.log('📱 Check your phone for M-PESA prompt');
      console.log('💡 Enter your M-PESA PIN to complete the test');
    } else {
      console.log('\n❌ FAILED:', response.data.ResponseDescription);
    }

  } catch (error) {
    console.error('\n❌ Test Failed:');
    console.error('Error:', error.response?.data || error.message);
  }
}

// Run the test
testProductionMpesa();