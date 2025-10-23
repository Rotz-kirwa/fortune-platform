#!/bin/bash

echo "🔧 Quick fix for database permissions..."

# Fix database permissions
sudo -u postgres psql -c "
ALTER TABLE IF EXISTS users OWNER TO fortune;
ALTER TABLE IF EXISTS payments OWNER TO fortune;
ALTER TABLE IF EXISTS orders OWNER TO fortune;
ALTER TABLE IF EXISTS investments OWNER TO fortune;
ALTER TABLE IF EXISTS investment_plans OWNER TO fortune;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fortune;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fortune;
" fortune_db

echo "✅ Database permissions fixed!"
echo "Now run: cd backend && npm run dev"