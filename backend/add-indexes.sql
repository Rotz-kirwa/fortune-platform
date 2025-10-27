-- Performance indexes for Fortune Investment Platform

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Investments table indexes
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_created_at ON investments(created_at);
CREATE INDEX IF NOT EXISTS idx_investments_maturity_date ON investments(maturity_date);

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_mpesa_transaction_id ON payments(mpesa_transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);

-- Pending investments indexes
CREATE INDEX IF NOT EXISTS idx_pending_investments_user_id ON pending_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_pending_investments_checkout_id ON pending_investments(checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_pending_investments_status ON pending_investments(status);
CREATE INDEX IF NOT EXISTS idx_pending_investments_expires_at ON pending_investments(expires_at);

-- Investment plans indexes
CREATE INDEX IF NOT EXISTS idx_investment_plans_active ON investment_plans(id) WHERE id IS NOT NULL;

SELECT 'Performance indexes created successfully!' as status;