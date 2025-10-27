// Fix server crash by removing problematic Payment model initialization
const fs = require('fs');
const path = require('path');

// Remove the initPaymentTable call that's causing the crash
const paymentModelPath = path.join(__dirname, 'models', 'Payment.js');

if (fs.existsSync(paymentModelPath)) {
  let content = fs.readFileSync(paymentModelPath, 'utf8');
  
  // Remove any initPaymentTable calls
  content = content.replace(/initPaymentTable\(\);?\s*/g, '');
  content = content.replace(/await\s+initPaymentTable\(\);?\s*/g, '');
  
  fs.writeFileSync(paymentModelPath, content);
  console.log('✅ Fixed Payment model - removed problematic initialization');
} else {
  console.log('❌ Payment model not found');
}

console.log('🎉 Server fix completed - try npm run dev now');