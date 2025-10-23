#!/bin/bash

echo "🚀 Starting Fortune Backend..."

cd backend

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "Starting PostgreSQL..."
    sudo service postgresql start
    sleep 2
fi

# Quick database fix
echo "🔧 Fixing database permissions..."
sudo -u postgres psql -d fortune_db -c "
ALTER TABLE IF EXISTS users OWNER TO fortune;
ALTER TABLE IF EXISTS payments OWNER TO fortune;
ALTER TABLE IF EXISTS orders OWNER TO fortune;
ALTER TABLE IF EXISTS investments OWNER TO fortune;
ALTER TABLE IF EXISTS investment_plans OWNER TO fortune;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fortune;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fortune;
" 2>/dev/null || echo "Database permissions already set"

# Start the backend server
echo "🔧 Starting backend server..."
npm run dev