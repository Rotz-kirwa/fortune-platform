// test-both-environments.js - Test both sandbox and production
const axios = require('axios');
require('dotenv').config();

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_PASSKEY
} = process.env;

const testPhone = '254791260817';

// Test configurations
const environments = [
  {
    name: 'SANDBOX',
    oauthUrl: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stkUrl: 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    shortcode: '174379', // Standard sandbox shortcode
    passkey: 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'
  },
  {
    name: 'PRODUCTION',
    oauthUrl: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
    stkUrl: 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
    shortcode: MPESA_SHORTCODE,
    passkey: MPESA_PASSKEY
  }
];

// Get access token
async function getAccessToken(oauthUrl) {
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  
  const response = await axios.get(oauthUrl, {
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json'
    }
  });
  return response.data.access_token;
}

// Generate password
function generatePassword(shortcode, passkey) {
  const timestamp = new Date().toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
  const raw = `${shortcode}${passkey}${timestamp}`;
  return { 
    password: Buffer.from(raw).toString('base64'), 
    timestamp 
  };
}

// Test STK Push
async function testStkPush(env) {
  try {
    console.log(`\n🧪 Testing ${env.name} Environment`);
    console.log('Shortcode:', env.shortcode);
    console.log('Phone:', testPhone);
    
    const accessToken = await getAccessToken(env.oauthUrl);
    console.log('✅ Access token obtained');
    
    const { password, timestamp } = generatePassword(env.shortcode, env.passkey);
    
    const requestBody = {
      BusinessShortCode: env.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: 1,
      PartyA: testPhone,
      PartyB: env.shortcode,
      PhoneNumber: testPhone,
      CallBackURL: 'https://incorporable-nolan-nonviviparous.ngrok-free.app/api/pay/callback',
      AccountReference: 'FORTUNE001',
      TransactionDesc: 'Fortune Test Payment'
    };
    
    console.log('📱 Sending STK Push...');
    
    const response = await axios.post(env.stkUrl, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ STK Push SUCCESS!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.ResponseCode === '0') {
      console.log(`🎉 ${env.name} WORKS! Check your phone 254791260817 for payment prompt!`);
      return true;
    }
    
  } catch (error) {
    console.log(`❌ ${env.name} FAILED`);
    console.log('Status:', error.response?.status);
    console.log('Data:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.data?.errorMessage?.includes('Merchant')) {
      console.log('💡 Shortcode not configured for this environment');
    } else if (error.response?.status === 401) {
      console.log('💡 Invalid credentials for this environment');
    } else if (error.response?.status === 400) {
      console.log('💡 Bad request - check credentials/environment match');
    }
    return false;
  }
}

// Test both environments
async function testBothEnvironments() {
  console.log('🔍 Testing M-PESA Integration in Both Environments');
  console.log('Consumer Key:', MPESA_CONSUMER_KEY?.substring(0, 10) + '...');
  console.log('Your Shortcode:', MPESA_SHORTCODE);
  console.log('Test Phone:', testPhone);
  
  let workingEnvironment = null;
  
  for (const env of environments) {
    const success = await testStkPush(env);
    if (success) {
      workingEnvironment = env.name;
      break;
    }
  }
  
  console.log('\n📋 RESULTS:');
  if (workingEnvironment) {
    console.log(`✅ SUCCESS: ${workingEnvironment} environment is working!`);
    console.log(`🔧 Update your .env file to use ${workingEnvironment} settings`);
  } else {
    console.log('❌ Both environments failed');
    console.log('💡 Possible issues:');
    console.log('   - Credentials not activated by Safaricom');
    console.log('   - Wrong environment for your credentials');
    console.log('   - Shortcode not configured for STK Push');
  }
}

testBothEnvironments();