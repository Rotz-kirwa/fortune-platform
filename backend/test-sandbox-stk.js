// test-sandbox-stk.js - Test with standard sandbox credentials
const axios = require('axios');
require('dotenv').config();

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET
} = process.env;

// Standard sandbox credentials
const SANDBOX_SHORTCODE = '174379';
const SANDBOX_PASSKEY = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';

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
  const raw = `${SANDBOX_SHORTCODE}${SANDBOX_PASSKEY}${timestamp}`;
  return { 
    password: Buffer.from(raw).toString('base64'), 
    timestamp 
  };
}

// Test STK Push with sandbox shortcode
async function testSandboxStkPush() {
  try {
    console.log('🚀 Testing M-PESA STK Push with Sandbox Shortcode...');
    
    const accessToken = await getAccessToken();
    console.log('✅ Access token obtained');
    
    const { password, timestamp } = generatePassword();
    
    const stkUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    
    const requestBody = {
      BusinessShortCode: SANDBOX_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: 1,
      PartyA: '254708374149', // Sandbox test number
      PartyB: SANDBOX_SHORTCODE,
      PhoneNumber: '254708374149',
      CallBackURL: 'https://incorporable-nolan-nonviviparous.ngrok-free.app/api/pay/callback',
      AccountReference: 'TEST001',
      TransactionDesc: 'Test Payment'
    };
    
    console.log('📱 Sending STK Push with sandbox shortcode...');
    console.log('Shortcode:', SANDBOX_SHORTCODE);
    console.log('Amount: KES 1');
    console.log('Phone: 254708374149 (sandbox test number)');
    
    const response = await axios.post(stkUrl, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ STK Push sent successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.ResponseCode === '0') {
      console.log('🎉 SUCCESS! M-PESA integration is working!');
      console.log('CheckoutRequestID:', response.data.CheckoutRequestID);
      console.log('');
      console.log('📋 Next Steps:');
      console.log('1. Your M-PESA integration is functional');
      console.log('2. Update your app to use sandbox shortcode 174379 for testing');
      console.log('3. For production, contact Safaricom to activate your shortcode 4185659');
    }
    
  } catch (error) {
    console.error('❌ STK Push failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.data?.errorMessage?.includes('Merchant')) {
      console.log('💡 Your credentials work, but shortcode needs activation');
    }
  }
}

testSandboxStkPush();