// Test new M-PESA credentials
const axios = require('axios');

const credentials = {
  MPESA_CONSUMER_KEY: 'yqApGHNGuRmG2y94AXbUHukXqmEIwsAFaWcIGPejedWNcMUH',
  MPESA_CONSUMER_SECRET: 'RUCumMcAa73DXEtddIYZfhHAAtlxJ2stPkmjfAhSfSa0mvYq7VH2JdBl8cwMtDTo',
  MPESA_SHORTCODE: '4185659',
  MPESA_ENV: 'production'
};

async function testCredentials() {
  console.log('🔍 Testing New M-PESA Credentials...\n');
  
  const url = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const auth = Buffer.from(`${credentials.MPESA_CONSUMER_KEY}:${credentials.MPESA_CONSUMER_SECRET}`).toString('base64');
  
  try {
    const response = await axios.get(url, {
      headers: { 
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ SUCCESS! New M-PESA credentials are valid');
    console.log('Access Token:', response.data.access_token);
    console.log('Expires In:', response.data.expires_in, 'seconds');
    
  } catch (error) {
    console.log('❌ FAILED! Credentials invalid');
    console.log('Error:', error.response?.data || error.message);
  }
}

testCredentials();