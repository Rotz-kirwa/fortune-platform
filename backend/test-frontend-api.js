// Test frontend API call simulation
const axios = require('axios');

async function testFrontendAPI() {
  console.log('🧪 Testing Frontend API Call Simulation...');
  
  try {
    // Simulate the exact call the frontend makes
    const response = await axios.post('http://localhost:4000/api/pay/stk', {
      amount: 100,
      phoneNumber: '254712345678',
      accountReference: 'INV-1-' + Date.now()
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Frontend API call successful:');
    console.log('Response:', response.data);
    
    if (response.data.ResponseCode === '0') {
      console.log('✅ STK Push sent successfully');
      console.log('CheckoutRequestID:', response.data.CheckoutRequestID);
    } else {
      console.log('❌ STK Push failed:', response.data.ResponseDescription);
    }
    
  } catch (error) {
    console.log('❌ Frontend API call failed:');
    console.log('Error:', error.response?.data || error.message);
  }
}

testFrontendAPI();