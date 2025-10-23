// setup-database.js - Fix database setup and permissions
const { Pool } = require('pg');
require('dotenv').config();

async function setupDatabase() {
  // Connect as postgres superuser first
  const adminPool = new Pool({
    user: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: process.env.DB_PORT || 5432,
  });

  try {
    console.log('🔧 Setting up database...');
    
    // Create database if not exists
    await adminPool.query(`
      SELECT 'CREATE DATABASE fortune_db' 
      WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'fortune_db')
    `).then(async (result) => {
      if (result.rows.length > 0) {
        await adminPool.query('CREATE DATABASE fortune_db');
        console.log('✅ Database created');
      }
    });

    // Create user if not exists
    await adminPool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'fortune') THEN
          CREATE USER fortune WITH PASSWORD 'secret';
        END IF;
      END $$;
    `);

    // Grant privileges
    await adminPool.query('GRANT ALL PRIVILEGES ON DATABASE fortune_db TO fortune');
    console.log('✅ User and permissions set');

    await adminPool.end();

    // Now connect to fortune_db as fortune user
    const fortunePool = new Pool({
      user: 'fortune',
      host: process.env.DB_HOST || 'localhost',
      database: 'fortune_db',
      password: 'secret',
      port: process.env.DB_PORT || 5432,
    });

    // Create tables
    await fortunePool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        phone_number VARCHAR(15),
        status VARCHAR(20) DEFAULT 'active',
        last_login TIMESTAMP,
        created_at TIMESTAMP DEFAULT now()
      )
    `);

    await fortunePool.query(`
      CREATE TABLE IF NOT EXISTS investment_plans (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        min_amount NUMERIC(10,2) NOT NULL,
        max_amount NUMERIC(10,2),
        daily_return_rate NUMERIC(5,4) NOT NULL,
        duration_days INT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await fortunePool.query(`
      CREATE TABLE IF NOT EXISTS investments (
        id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(id) ON DELETE CASCADE,
        plan_name VARCHAR(100) NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        daily_return_rate NUMERIC(5,4) NOT NULL,
        duration_days INT NOT NULL,
        total_return NUMERIC(10,2) DEFAULT 0,
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        maturity_date TIMESTAMP
      )
    `);

    await fortunePool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(100) NOT NULL,
        product VARCHAR(100) NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await fortunePool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        amount NUMERIC(10,2) NOT NULL,
        method VARCHAR(50) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        transaction_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample investment plans
    await fortunePool.query(`
      INSERT INTO investment_plans (name, min_amount, max_amount, daily_return_rate, duration_days, description) 
      VALUES
        ('Starter Plan', 1000.00, 10000.00, 0.0150, 30, 'Perfect for beginners - 1.5% daily returns for 30 days'),
        ('Growth Plan', 10000.00, 50000.00, 0.0200, 60, 'Accelerated growth - 2% daily returns for 60 days'),
        ('Premium Plan', 50000.00, 200000.00, 0.0250, 90, 'Premium returns - 2.5% daily returns for 90 days'),
        ('Elite Plan', 200000.00, NULL, 0.0300, 120, 'Elite tier - 3% daily returns for 120 days')
      ON CONFLICT DO NOTHING
    `);

    console.log('✅ All tables created successfully');
    await fortunePool.end();

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;