// test-production-stk.js - Test with your activated shortcode
const axios = require('axios');
require('dotenv').config();

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY
} = process.env;

// Get access token (production)
async function getAccessToken() {
  const url = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
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

// Test STK Push with your activated shortcode
async function testProductionStkPush() {
  try {
    console.log('🚀 Testing M-PESA STK Push with YOUR activated shortcode...');
    console.log('Shortcode:', MPESA_SHORTCODE);
    
    const accessToken = await getAccessToken();
    console.log('✅ Production access token obtained');
    
    const { password, timestamp } = generatePassword();
    
    const stkUrl = 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    
    // Use a real Kenyan phone number for testing (replace with your number)254791260817    const testPhone = '254791260817'; // Your actual phone number
    
    const requestBody = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: 1, // Test with KES 1
      PartyA: testPhone,
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: testPhone,
      CallBackURL: 'https://incorporable-nolan-nonviviparous.ngrok-free.app/api/pay/callback',
      AccountReference: 'FORTUNE001',
      TransactionDesc: 'Fortune Investment Test'
    };
    
    console.log('📱 Sending STK Push to production...');
    console.log('Phone:', testPhone);
    console.log('Amount: KES 1');
    console.log('Paybill:', MPESA_SHORTCODE);
    
    const response = await axios.post(stkUrl, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ STK Push sent successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.ResponseCode === '0') {
      console.log('🎉 SUCCESS! Check your phone for M-PESA payment prompt!');
      console.log('CheckoutRequestID:', response.data.CheckoutRequestID);
      console.log('');
      console.log('📋 Your M-PESA integration is LIVE and working!');
      console.log('✅ Shortcode 4185659 is activated');
      console.log('✅ Production credentials working');
      console.log('✅ STK Push functional');
    }
    
  } catch (error) {
    console.error('❌ STK Push failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 400) {
      console.log('💡 Check if phone number is in correct format (254XXXXXXXXX)');
    } else if (error.response?.status === 401) {
      console.log('💡 Credentials issue - verify consumer key/secret');
    }
  }
}

console.log('⚠️  IMPORTANT: Replace testPhone with your actual Kenyan number!');
console.log('⚠️  Format: 254XXXXXXXXX (e.g., 254712345678)');
console.log('');

testProductionStkPush();
