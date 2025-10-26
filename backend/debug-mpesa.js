// Debug M-PESA step by step
require('dotenv').config();
const axios = require('axios');

const {
  MPESA_ENV, MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_CALLBACK_URL
} = process.env;

console.log('🔍 M-PESA Configuration Debug:');
console.log('Environment:', MPESA_ENV);
console.log('Consumer Key:', MPESA_CONSUMER_KEY?.substring(0, 10) + '...');
console.log('Consumer Secret:', MPESA_CONSUMER_SECRET?.substring(0, 10) + '...');
console.log('Shortcode:', MPESA_SHORTCODE);
console.log('Passkey:', MPESA_PASSKEY?.substring(0, 10) + '...');
console.log('Callback URL:', MPESA_CALLBACK_URL);

async function debugMpesa() {
  try {
    // Step 1: Test OAuth
    console.log('\n🔑 Step 1: Testing OAuth...');
    const oauthUrl = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
    
    const oauthRes = await axios.get(oauthUrl, {
      headers: { Authorization: `Basic ${auth}` },
      timeout: 30000
    });
    
    console.log('✅ OAuth Success:', {
      access_token: oauthRes.data.access_token?.substring(0, 10) + '...',
      expires_in: oauthRes.data.expires_in
    });
    
    // Step 2: Test STK Push
    console.log('\n📱 Step 2: Testing STK Push...');
    const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
    const raw = `${MPESA_SHORTCODE}${MPESA_PASSKEY}${timestamp}`;
    const password = Buffer.from(raw).toString('base64');
    
    console.log('Password components:', {
      shortcode: MPESA_SHORTCODE,
      passkey: MPESA_PASSKEY?.substring(0, 10) + '...',
      timestamp: timestamp,
      raw_length: raw.length
    });
    
    const stkUrl = 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
    const stkBody = {
      BusinessShortCode: MPESA_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: 1,
      PartyA: '254712345678',
      PartyB: MPESA_SHORTCODE,
      PhoneNumber: '254712345678',
      CallBackURL: MPESA_CALLBACK_URL,
      AccountReference: 'Test',
      TransactionDesc: 'Test Payment'
    };
    
    const stkRes = await axios.post(stkUrl, stkBody, {
      headers: {
        Authorization: `Bearer ${oauthRes.data.access_token}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    console.log('✅ STK Push Success:', stkRes.data);
    
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
    
    if (error.response?.data) {
      console.log('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

debugMpesa();