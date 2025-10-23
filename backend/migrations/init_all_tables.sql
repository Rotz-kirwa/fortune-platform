-- Create all required tables for Fortune Investment Platform

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  customer_name VARCHAR(100) NOT NULL,
  product VARCHAR(100) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investments table
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
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  method VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  transaction_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Investment plans table
CREATE TABLE IF NOT EXISTS investment_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  min_amount NUMERIC(10,2) NOT NULL,
  max_amount NUMERIC(10,2),
  daily_return_rate NUMERIC(5,4) NOT NULL,
  duration_days INT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample investment plans
INSERT INTO investment_plans (name, min_amount, max_amount, daily_return_rate, duration_days, description) VALUES
('Starter Plan', 1000.00, 10000.00, 0.0150, 30, 'Perfect for beginners - 1.5% daily returns for 30 days'),
('Growth Plan', 10000.00, 50000.00, 0.0200, 60, 'Accelerated growth - 2% daily returns for 60 days'),
('Premium Plan', 50000.00, 200000.00, 0.0250, 90, 'Premium returns - 2.5% daily returns for 90 days'),
('Elite Plan', 200000.00, NULL, 0.0300, 120, 'Elite tier - 3% daily returns for 120 days')
ON CONFLICT DO NOTHING;