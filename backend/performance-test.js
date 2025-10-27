// Performance test script
const axios = require('axios');

async function performanceTest() {
  console.log('🚀 Running performance tests...');
  
  const baseURL = 'http://localhost:4000';
  const tests = [
    { name: 'Health Check', url: '/api/health' },
    { name: 'Users Endpoint', url: '/api/users' },
    { name: 'Payments Endpoint', url: '/api/payments' },
    { name: 'Investments Endpoint', url: '/api/investments' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    const start = Date.now();
    try {
      const response = await axios.get(baseURL + test.url, { timeout: 5000 });
      const duration = Date.now() - start;
      
      results.push({
        name: test.name,
        status: response.status,
        duration: duration,
        success: true
      });
      
      console.log(`✅ ${test.name}: ${duration}ms (${response.status})`);
    } catch (error) {
      const duration = Date.now() - start;
      results.push({
        name: test.name,
        status: error.response?.status || 'ERROR',
        duration: duration,
        success: false,
        error: error.message
      });
      
      console.log(`❌ ${test.name}: ${duration}ms (${error.response?.status || 'ERROR'})`);
    }
  }
  
  // Calculate average response time
  const successfulTests = results.filter(r => r.success);
  const avgResponseTime = successfulTests.length > 0 
    ? successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length 
    : 0;
  
  console.log('\n📊 Performance Summary:');
  console.log(`Average Response Time: ${Math.round(avgResponseTime)}ms`);
  console.log(`Success Rate: ${successfulTests.length}/${results.length} (${Math.round(successfulTests.length/results.length*100)}%)`);
  
  if (avgResponseTime < 200) {
    console.log('🎉 Excellent performance! Ready for production.');
  } else if (avgResponseTime < 500) {
    console.log('✅ Good performance! Production ready.');
  } else {
    console.log('⚠️ Performance needs improvement.');
  }
}

performanceTest();