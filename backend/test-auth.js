// test-auth.js - Test authentication and investment endpoints
const axios = require('axios');

async function testAuth() {
  try {
    console.log('🔐 Testing authentication...');
    
    // 1. Test login
    const loginResponse = await axios.post('http://localhost:4000/api/users/login', {
      email: 'test@example.com',
      password: 'password'
    });
    
    console.log('✅ Login successful');
    const token = loginResponse.data.token;
    console.log('Token:', token?.substring(0, 20) + '...');
    
    // 2. Test investment endpoints with token
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    
    console.log('\n📊 Testing investment endpoints...');
    
    // Test dashboard stats
    try {
      const statsResponse = await axios.get('http://localhost:4000/api/investments/dashboard-stats', { headers });
      console.log('✅ Dashboard stats working');
      console.log('Stats:', statsResponse.data);
    } catch (error) {
      console.log('❌ Dashboard stats failed:', error.response?.status, error.response?.data);
    }
    
    // Test my investments
    try {
      const investmentsResponse = await axios.get('http://localhost:4000/api/investments/my-investments', { headers });
      console.log('✅ My investments working');
      console.log('Investments:', investmentsResponse.data);
    } catch (error) {
      console.log('❌ My investments failed:', error.response?.status, error.response?.data);
    }
    
    // Test investment plans (should work without auth)
    try {
      const plansResponse = await axios.get('http://localhost:4000/api/investments/plans');
      console.log('✅ Investment plans working');
      console.log('Plans count:', plansResponse.data.length);
    } catch (error) {
      console.log('❌ Investment plans failed:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Authentication test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
  }
}

testAuth();