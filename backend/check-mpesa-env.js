// Check M-PESA environment variables
console.log('🔍 M-PESA Environment Check:');
console.log('MPESA_CONSUMER_KEY:', process.env.MPESA_CONSUMER_KEY ? '✅ Set' : '❌ Missing');
console.log('MPESA_CONSUMER_SECRET:', process.env.MPESA_CONSUMER_SECRET ? '✅ Set' : '❌ Missing');
console.log('MPESA_SHORTCODE:', process.env.MPESA_SHORTCODE ? '✅ Set' : '❌ Missing');
console.log('MPESA_PASSKEY:', process.env.MPESA_PASSKEY ? '✅ Set' : '❌ Missing');
console.log('MPESA_CALLBACK_URL:', process.env.MPESA_CALLBACK_URL ? '✅ Set' : '❌ Missing');
console.log('MPESA_ENV:', process.env.MPESA_ENV ? '✅ Set' : '❌ Missing');

if (!process.env.MPESA_CONSUMER_SECRET) {
  console.log('\n❌ CRITICAL: MPESA_CONSUMER_SECRET is missing!');
  console.log('Add this to Render environment variables:');
  console.log('MPESA_CONSUMER_SECRET=Ej8aBKJGJGJGJGJGJGJGJGJGJGJGJGJG');
}