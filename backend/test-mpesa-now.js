// Test M-PESA credentials
require('dotenv').config();
const { getToken } = require('./lib/mpesa');

async function testCredentials() {
  console.log('🔧 Testing M-PESA Credentials...');
  console.log('Environment:', process.env.MPESA_ENV);
  console.log('Consumer Key:', process.env.MPESA_CONSUMER_KEY?.substring(0, 10) + '...');
  console.log('Consumer Secret:', process.env.MPESA_CONSUMER_SECRET?.substring(0, 10) + '...');
  console.log('Shortcode:', process.env.MPESA_SHORTCODE);
  
  try {
    const token = await getToken();
    console.log('✅ SUCCESS: M-PESA credentials are valid');
    console.log('Token length:', token.length);
  } catch (error) {
    console.log('❌ FAILED:', error.message);
  }
}

testCredentials();