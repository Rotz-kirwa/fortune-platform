// test-credentials.js - Test M-PESA credentials
const axios = require('axios');
require('dotenv').config();

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE
} = process.env;

async function testCredentials() {
  console.log('🔍 Testing M-PESA Credentials...');
  console.log('Consumer Key:', MPESA_CONSUMER_KEY);
  console.log('Consumer Secret:', MPESA_CONSUMER_SECRET);
  console.log('Shortcode:', MPESA_SHORTCODE);
  
  // Test different approaches
  const approaches = [
    {
      name: 'Production OAuth',
      url: 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    },
    {
      name: 'Sandbox OAuth (fallback)',
      url: 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    }
  ];

  for (const approach of approaches) {
    console.log(`\n🧪 Testing: ${approach.name}`);
    
    try {
      const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
      
      const response = await axios({
        method: 'GET',
        url: approach.url,
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      });
      
      console.log('✅ Success!');
      console.log('Access Token:', response.data.access_token?.substring(0, 20) + '...');
      console.log('Expires In:', response.data.expires_in);
      return response.data.access_token;
      
    } catch (error) {
      console.log('❌ Failed');
      console.log('Status:', error.response?.status);
      console.log('Status Text:', error.response?.statusText);
      console.log('Data:', error.response?.data);
      
      if (error.code === 'ENOTFOUND') {
        console.log('💡 Network issue - check internet connection');
      } else if (error.response?.status === 401) {
        console.log('💡 Invalid credentials - check consumer key/secret');
      } else if (error.response?.status === 400) {
        console.log('💡 Bad request - credentials might be for wrong environment');
      }
    }
  }
  
  console.log('\n❌ All attempts failed. Possible issues:');
  console.log('1. Credentials are for sandbox but using production URLs');
  console.log('2. App not approved/activated by Safaricom');
  console.log('3. Credentials are incorrect');
  console.log('4. Network/firewall issues');
}

testCredentials();