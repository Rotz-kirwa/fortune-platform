// test-stk-push.js - Test M-PESA STK Push
const axios = require('axios');
require('dotenv').config();

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY
} = process.env;

// Get access token
async function getAccessToken() {
  const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  
  const response = await axios.get(url, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.access_token;
}

// Generate password
function generatePassword() {
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const raw = `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`;
  return { 
    password: Buffer.from(raw).toString('base64'), 
    timestamp 
  };
}

// Test STK Push
async function testStkPush() {
  try {
    console.log('🚀 Testing M-PESA STK Push...');
    
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained');
    
    const { password, timestamp } = generatePassword();
    
    const stkUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    
    const requestBody = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: 1, // Test with KES 1
      PartyA: '254708374149', // Sandbox test number
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: '254708374149', // Sandbox test number
      CallBackURL: 'https://incorporable-nolan-nonviviparous.ngrok-free.app/api/pay/callback',
      AccountReference: 'TEST001',
      TransactionDesc: 'Test Payment'
    };
    
    console.log('📱 Sending STK Push...');
    console.log('Request:', JSON.stringify(requestBody, null, 2));
    
    const response = await axios.post(stkUrl, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ STK Push sent successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.ResponseCode === '0') {
      console.log('🎉 SUCCESS! Check the test phone for payment prompt');
      console.log('CheckoutRequestID:', response.data.CheckoutRequestID);
    }
    
  } catch (error) {
    console.error('❌ STK Push failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
  }
}

testStkPush();