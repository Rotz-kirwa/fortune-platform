// Test Complete Investment Workflow
require('dotenv').config();
const { Pool } = require('pg');
const { initiateStkPush } = require('./lib/mpesa');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function testInvestmentWorkflow() {
  console.log('🧪 Testing Complete Investment Workflow...\n');
  
  try {
    // 1. Test Database Connection
    console.log('1️⃣ Testing Database Connection...');
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected successfully\n');

    // 2. Check Investment Plans
    console.log('2️⃣ Checking Investment Plans...');
    const plansResult = await pool.query('SELECT * FROM investment_plans ORDER BY id');
    console.log(`✅ Found ${plansResult.rows.length} investment plans:`);
    plansResult.rows.forEach(plan => {
      console.log(`   - ${plan.name}: ${(plan.daily_return_rate * 100).toFixed(1)}% daily, ${plan.duration_days} days`);
    });
    console.log('');

    // 3. Check Pending Investments Table
    console.log('3️⃣ Checking Pending Investments Table...');
    try {
      await pool.query('SELECT COUNT(*) FROM pending_investments');
      console.log('✅ Pending investments table exists\n');
    } catch (err) {
      console.log('❌ Pending investments table missing - run fix-db-now.js first\n');
      return;
    }

    // 4. Test M-PESA STK Push
    console.log('4️⃣ Testing M-PESA STK Push...');
    try {
      const stkResult = await initiateStkPush({
        amount: 1000,
        phoneNumber: '254712345678',
        accountReference: 'TEST-WORKFLOW'
      });
      
      if (stkResult.ResponseCode === '0') {
        console.log('✅ STK Push initiated successfully');
        console.log(`   Checkout Request ID: ${stkResult.CheckoutRequestID}`);
        
        // 5. Create Pending Investment
        console.log('\n5️⃣ Creating Pending Investment...');
        const pendingResult = await pool.query(`
          INSERT INTO pending_investments 
          (user_id, plan_id, plan_name, amount, daily_return_rate, duration_days, phone_number, checkout_request_id)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `, [null, 1, 'Starter Plan', 1000, 0.015, 30, '254712345678', stkResult.CheckoutRequestID]);
        
        console.log('✅ Pending investment created successfully');
        console.log(`   ID: ${pendingResult.rows[0].id}`);
        console.log(`   Amount: KSh ${pendingResult.rows[0].amount}`);
        console.log(`   Status: ${pendingResult.rows[0].status}`);
        
      } else {
        console.log('❌ STK Push failed:', stkResult.ResponseDescription);
      }
    } catch (error) {
      console.log('❌ M-PESA test failed:', error.message);
    }

    // 6. Test Investment Creation (simulate successful callback)
    console.log('\n6️⃣ Testing Investment Creation...');
    try {
      const investmentResult = await pool.query(`
        INSERT INTO investments 
        (user_id, plan_name, amount, daily_return_rate, duration_days, maturity_date)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `, [null, 'Test Plan', 1000, 0.015, 30, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]);
      
      console.log('✅ Investment created successfully');
      console.log(`   ID: ${investmentResult.rows[0].id}`);
      console.log(`   Amount: KSh ${investmentResult.rows[0].amount}`);
      console.log(`   Daily Return: ${(investmentResult.rows[0].daily_return_rate * 100).toFixed(1)}%`);
      
      // Clean up test investment
      await pool.query('DELETE FROM investments WHERE id = $1', [investmentResult.rows[0].id]);
      console.log('   (Test investment cleaned up)');
      
    } catch (error) {
      console.log('❌ Investment creation failed:', error.message);
    }

    console.log('\n🎉 Investment workflow test completed!');
    
  } catch (error) {
    console.error('❌ Workflow test failed:', error.message);
  } finally {
    await pool.end();
  }
}

testInvestmentWorkflow();