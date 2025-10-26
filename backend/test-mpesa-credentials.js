// Test M-PESA credentials
const axios = require('axios');

const credentials = {
  MPESA_CONSUMER_KEY: 'yqApGHNGuRmG2y94AXbUHukXqmEIwsAFaWcIGPejedWNcMUH',
  MPESA_CONSUMER_SECRET: 'RUCumMcAa73DXEtddIYZfhHAAtlxJ2stPkmjfAhSfSa0mvYq7VH2JdBl8cwMtDTo',
  MPESA_SHORTCODE: '4185659',
  MPESA_ENV: 'production'
};

async function testCredentials() {
  console.log('🔍 Testing M-PESA Credentials...\n');
  
  const url = 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const auth = Buffer.from(`${credentials.MPESA_CONSUMER_KEY}:${credentials.MPESA_CONSUMER_SECRET}`).toString('base64');
  
  try {
    console.log('Testing with:');
    console.log('- Consumer Key:', credentials.MPESA_CONSUMER_KEY);
    console.log('- Consumer Secret:', credentials.MPESA_CONSUMER_SECRET.substring(0, 10) + '...');
    console.log('- Shortcode:', credentials.MPESA_SHORTCODE);
    console.log('- Environment:', credentials.MPESA_ENV);
    console.log('- URL:', url);
    console.log();
    
    const response = await axios.get(url, {
      headers: { 
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    
    console.log('✅ SUCCESS! M-PESA credentials are valid');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.log('❌ FAILED! M-PESA credentials are invalid');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
    console.log();
    console.log('🔧 Possible solutions:');
    console.log('1. Use sandbox credentials for testing:');
    console.log('   MPESA_CONSUMER_KEY=your_sandbox_key');
    console.log('   MPESA_CONSUMER_SECRET=your_sandbox_secret');
    console.log('   MPESA_SHORTCODE=174379');
    console.log('   MPESA_ENV=sandbox');
    console.log();
    console.log('2. Get valid production credentials from Safaricom');
    console.log('3. Check if the credentials have expired');
  }
}

testCredentials();