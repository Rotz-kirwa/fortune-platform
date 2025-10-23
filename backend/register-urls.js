// register-urls.js - Register M-PESA callback URLs with Safaricom
const axios = require('axios');
require('dotenv').config();

const {
  MPESA_CONSUMER_KEY,
  MPESA_CONSUMER_SECRET,
  MPESA_SHORTCODE,
  MPESA_CALLBACK_URL
} = process.env;

// Get access token
async function getAccessToken() {
  const url = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');
  
  console.log('🔍 Debug Info:');
  console.log('Consumer Key:', MPESA_CONSUMER_KEY?.substring(0, 10) + '...');
  console.log('Consumer Secret:', MPESA_CONSUMER_SECRET?.substring(0, 10) + '...');
  console.log('Shortcode:', MPESA_SHORTCODE);
  
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data.access_token;
  } catch (error) {
    console.error('❌ Access Token Error Details:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Headers:', error.response?.headers);
    throw error;
  }
}

// Register URLs
async function registerUrls() {
  try {
    const registerUrl = 'https://sandbox.safaricom.co.ke/mpesa/c2b/v2/registerurl';
    
    // Extract base URL from callback URL
    const baseUrl = MPESA_CALLBACK_URL.replace('/api/pay/callback', '');
    
    const requestBody = {
      ShortCode: MPESA_SHORTCODE,
      ResponseType: "Completed",
      ConfirmationURL: `${baseUrl}/api/pay/confirmation`,
      ValidationURL: `${baseUrl}/api/pay/validation`
    };

    console.log('📡 Registering URLs with Safaricom...');
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));

    // Get fresh access token right before the request
    console.log('🔑 Getting fresh access token...');
    const accessToken = await getAccessToken();
    console.log('✅ Fresh access token obtained');

    const response = await axios.post(registerUrl, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 30000
    });

    console.log('✅ URLs registered successfully!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error registering URLs:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    
    if (error.response?.status === 401) {
      console.log('💡 Token issue - trying with different shortcode format...');
      // Try with different shortcode format
      await tryAlternativeRegistration();
    }
  }
}

// Alternative registration with different parameters
async function tryAlternativeRegistration() {
  try {
    console.log('🔄 Trying alternative registration...');
    
    const registerUrl = 'https://sandbox.safaricom.co.ke/mpesa/c2b/v2/registerurl';
    const baseUrl = MPESA_CALLBACK_URL.replace('/api/pay/callback', '');
    
    // Try with test shortcode for sandbox
    const requestBody = {
      ShortCode: "600982", // Common sandbox shortcode
      ResponseType: "Completed",
      ConfirmationURL: `${baseUrl}/api/pay/confirmation`,
      ValidationURL: `${baseUrl}/api/pay/validation`
    };

    console.log('Alternative Request Body:', JSON.stringify(requestBody, null, 2));

    const accessToken = await getAccessToken();
    const response = await axios.post(registerUrl, requestBody, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Alternative registration successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Alternative registration also failed:', error.response?.data || error.message);
    console.log('💡 Your shortcode 4185659 might not be configured for C2B URL registration');
    console.log('💡 Contact Safaricom to enable C2B for your shortcode');
  }
}

// Validate environment variables first
if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_SHORTCODE) {
  console.error('❌ Missing required environment variables:');
  console.error('MPESA_CONSUMER_KEY:', !!MPESA_CONSUMER_KEY);
  console.error('MPESA_CONSUMER_SECRET:', !!MPESA_CONSUMER_SECRET);
  console.error('MPESA_SHORTCODE:', !!MPESA_SHORTCODE);
  console.error('MPESA_CALLBACK_URL:', !!MPESA_CALLBACK_URL);
  process.exit(1);
}

// Run the registration
registerUrls();