#!/bin/bash

echo "🚀 Starting Fortune Investment Platform..."

# Check if PostgreSQL is running
if ! pgrep -x "postgres" > /dev/null; then
    echo "⚠️  PostgreSQL not running. Starting PostgreSQL..."
    sudo service postgresql start
fi

# Setup database (this will handle permissions)
echo "🔧 Setting up database..."
cd backend

# Create database and user with proper permissions
sudo -u postgres psql -c "DROP DATABASE IF EXISTS fortune_db;"
sudo -u postgres psql -c "DROP USER IF EXISTS fortune;"
sudo -u postgres psql -c "CREATE USER fortune WITH PASSWORD 'secret';"
sudo -u postgres psql -c "CREATE DATABASE fortune_db OWNER fortune;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE fortune_db TO fortune;"

# Run migrations
echo "📊 Running database migrations..."
PGPASSWORD=secret psql -h localhost -U fortune -d fortune_db -f migrations/init_all_tables.sql

# Start backend
echo "🔧 Starting backend server..."
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend in new terminal
echo "🎨 Starting frontend..."
cd ../frontend
npm start &
FRONTEND_PID=$!

echo "✅ Fortune Investment Platform started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:4000"
echo "❤️  Health Check: http://localhost:4000/api/health"

# Keep script running
wait