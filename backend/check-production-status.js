// Simple script to check production deployment status
const https = require('https');

console.log('🔍 Checking Production Status...\n');

// Check if the server is responding at all
const options = {
  hostname: 'fortune-platform-1.onrender.com',
  port: 443,
  path: '/api/health',
  method: 'GET',
  timeout: 10000
};

const req = https.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('\nResponse Body:');
    console.log(data.substring(0, 500) + '...');
    
    if (res.statusCode === 502) {
      console.log('\n❌ 502 Bad Gateway - Server deployment failed');
      console.log('This usually means:');
      console.log('1. Missing environment variables');
      console.log('2. Database connection issues');
      console.log('3. Application startup errors');
      console.log('\n📝 Next steps:');
      console.log('1. Add M-PESA environment variables to Render');
      console.log('2. Check Render deployment logs');
      console.log('3. Verify database connection string');
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Request failed:', err.message);
});

req.on('timeout', () => {
  console.error('❌ Request timed out');
  req.destroy();
});

req.end();