// setup-production.js - Production setup script
const pool = require('./config/db');

const setupProduction = async () => {
  console.log('🚀 Setting up production environment...\n');

  // Check database connection
  try {
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0].now);
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return;
  }

  // Check if tables exist (don't create them, just check)
  const tables = ['users', 'investments', 'orders', 'payments'];
  
  for (const table of tables) {
    try {
      const result = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        )
      `, [table]);
      
      if (result.rows[0].exists) {
        console.log(`✅ Table '${table}' exists`);
      } else {
        console.log(`❌ Table '${table}' missing`);
      }
    } catch (error) {
      console.log(`❌ Error checking table '${table}':`, error.message);
    }
  }

  // Check M-PESA environment variables
  console.log('\n🔍 M-PESA Environment Variables:');
  const mpesaVars = [
    'MPESA_CONSUMER_KEY',
    'MPESA_CONSUMER_SECRET', 
    'MPESA_SHORTCODE',
    'MPESA_PASSKEY',
    'MPESA_CALLBACK_URL',
    'MPESA_ENV'
  ];

  let missingVars = [];
  mpesaVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName}: Set`);
    } else {
      console.log(`❌ ${varName}: Missing`);
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.log('\n📝 Add these environment variables to Render:');
    console.log('MPESA_CONSUMER_KEY=VvpMBSUKLtlPuDGFCC3n5eZt3DM140fSngYrDr9I07NAn6OJ');
    console.log('MPESA_CONSUMER_SECRET=Ej8aBKJGJGJGJGJGJGJGJGJGJGJGJGJG');
    console.log('MPESA_SHORTCODE=4185659');
    console.log('MPESA_PASSKEY=your_passkey_here');
    console.log('MPESA_CALLBACK_URL=https://fortune-platform-1.onrender.com/api/payments/callback');
    console.log('MPESA_ENV=production');
  }

  await pool.end();
  console.log('\n✅ Setup complete');
};

setupProduction().catch(console.error);