-- Fix database issues for M-PESA and Investment system
-- Run this to resolve permission and missing table issues

-- Create missing pending_investments table
CREATE TABLE IF NOT EXISTS pending_investments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  plan_id INT NOT NULL,
  plan_name VARCHAR(100) NOT NULL,
  amount NUMERIC(10,2) NOT NULL,
  daily_return_rate NUMERIC(5,4) NOT NULL,
  duration_days INT NOT NULL,
  phone_number VARCHAR(15) NOT NULL,
  checkout_request_id VARCHAR(100) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '15 minutes'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for pending_investments
CREATE INDEX IF NOT EXISTS idx_pending_investments_checkout_id ON pending_investments(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_pending_investments_user_id ON pending_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_investments_status ON pending_investments(status);
CREATE INDEX IF NOT EXISTS idx_pending_investments_expires_at ON pending_investments(expires_at);

-- Grant permissions to fortune user (if needed)
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fortune;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fortune;

-- Ensure payments table has all required columns
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS investment_id INT REFERENCES investments(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS mpesa_transaction_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS mpesa_receipt_number VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS callback_data JSONB;

-- Success message
SELECT 'Database fixes applied successfully!' as status;