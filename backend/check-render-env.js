// check-render-env.js - Check production M-PESA environment variables
const https = require('https');

const checkRenderEnvironment = async () => {
  console.log('🔍 Checking Render Production Environment...\n');
  
  try {
    // Make a request to your production health endpoint
    const response = await fetch('https://fortune-platform-1.onrender.com/api/health');
    const data = await response.json();
    
    console.log('✅ Production server is running');
    console.log('Server status:', data.status);
    console.log('Environment:', data.environment || 'Not specified');
    
  } catch (error) {
    console.log('❌ Cannot reach production server:', error.message);
  }

  // Test M-PESA endpoint to see if variables are loaded
  try {
    const mpesaResponse = await fetch('https://fortune-platform-1.onrender.com/api/payments/test-env', {
      method: 'GET'
    });
    
    if (mpesaResponse.ok) {
      const mpesaData = await mpesaResponse.json();
      console.log('\n🔍 M-PESA Environment Status:');
      console.log(mpesaData);
    } else {
      console.log('\n❌ M-PESA test endpoint not available');
    }
  } catch (error) {
    console.log('\n❌ Cannot test M-PESA environment:', error.message);
  }
};

checkRenderEnvironment();