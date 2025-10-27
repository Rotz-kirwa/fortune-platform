// Clear any cached modules and restart clean
delete require.cache[require.resolve('./models/Payment.js')];
console.log('✅ Cache cleared - restart server now');