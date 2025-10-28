const dailyReturnsService = require('./services/dailyReturnsService');

async function runDailyReturns() {
  try {
    console.log('🚀 Starting daily returns calculation...');
    
    // Create table if it doesn't exist
    await dailyReturnsService.createDailyReturnsTable();
    
    // Calculate daily returns
    await dailyReturnsService.calculateDailyReturns();
    
    console.log('🎉 Daily returns calculation completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('💥 Daily returns calculation failed:', error);
    process.exit(1);
  }
}

runDailyReturns();