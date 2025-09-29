#!/bin/bash

# Fortune Investment Platform - Start All Services
echo "🚀 Starting Fortune Investment Platform..."

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Start Backend Server
echo "⚙️ Starting backend server on port 4000..."
cd "$PROJECT_ROOT/backend"
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
sleep 5

# Start Frontend Server
echo "🌐 Starting frontend server on port 3000..."
cd "$PROJECT_ROOT/frontend"
npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
sleep 8

# Check if services are running
echo "🔍 Checking services..."
if curl -s http://localhost:4000/api/health > /dev/null; then
    echo "✅ Backend running on http://localhost:4000"
else
    echo "❌ Backend failed to start"
fi

if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend running on http://localhost:3000"
else
    echo "❌ Frontend failed to start"
fi

echo ""
echo "🎉 Fortune Investment Platform is ready!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:4000"
echo ""
echo "To stop all services, run: ./scripts/stop-all.sh"

# Save PIDs for stopping later
echo $BACKEND_PID > "$PROJECT_ROOT/.backend.pid"
echo $FRONTEND_PID > "$PROJECT_ROOT/.frontend.pid"