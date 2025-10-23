#!/bin/bash

# Fortune Investment Platform - Database Migration Script
# This script adds new columns to existing tables

echo "🚀 Starting database migration..."

# Database connection details from .env
DB_USER=${DB_USER:-fortune}
DB_NAME=${DB_NAME:-fortune_db}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo "📊 Database: $DB_NAME"
echo "👤 User: $DB_USER"
echo "🖥️  Host: $DB_HOST:$DB_PORT"
echo ""

# Function to run SQL command
run_sql() {
    PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$1"
}

echo "1️⃣  Adding columns to users table..."
run_sql "ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';" 2>/dev/null || echo "   ⚠️  role column may already exist"
run_sql "ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15);" 2>/dev/null || echo "   ⚠️  phone_number column may already exist"
run_sql "ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';" 2>/dev/null || echo "   ⚠️  status column may already exist"
run_sql "ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;" 2>/dev/null || echo "   ⚠️  last_login column may already exist"
echo "   ✅ Users table updated"

echo ""
echo "2️⃣  Adding columns to payments table..."
run_sql "ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id);" 2>/dev/null || echo "   ⚠️  user_id column may already exist"
run_sql "ALTER TABLE payments ADD COLUMN IF NOT EXISTS investment_id INT REFERENCES investments(id);" 2>/dev/null || echo "   ⚠️  investment_id column may already exist"
run_sql "ALTER TABLE payments ADD COLUMN IF NOT EXISTS mpesa_transaction_id VARCHAR(100);" 2>/dev/null || echo "   ⚠️  mpesa_transaction_id column may already exist"
run_sql "ALTER TABLE payments ADD COLUMN IF NOT EXISTS mpesa_receipt_number VARCHAR(100);" 2>/dev/null || echo "   ⚠️  mpesa_receipt_number column may already exist"
run_sql "ALTER TABLE payments ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15);" 2>/dev/null || echo "   ⚠️  phone_number column may already exist"
run_sql "ALTER TABLE payments ADD COLUMN IF NOT EXISTS callback_data JSONB;" 2>/dev/null || echo "   ⚠️  callback_data column may already exist"
echo "   ✅ Payments table updated"

echo ""
echo "3️⃣  Creating new tables..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f 001_add_payment_and_admin_tables.sql 2>/dev/null
echo "   ✅ New tables created"

echo ""
echo "🎉 Migration completed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Restart your backend server: npm run dev"
echo "   2. Test with a small investment"
echo "   3. Check the logs for successful callback processing"
