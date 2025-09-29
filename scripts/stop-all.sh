#!/bin/bash

# Fortune Investment Platform - Stop All Services
echo "🛑 Stopping Fortune Investment Platform..."

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Kill backend process
if [ -f "$PROJECT_ROOT/.backend.pid" ]; then
    BACKEND_PID=$(cat "$PROJECT_ROOT/.backend.pid")
    kill $BACKEND_PID 2>/dev/null
    rm "$PROJECT_ROOT/.backend.pid"
    echo "✅ Backend stopped"
else
    pkill -f "nodemon.*server.js" 2>/dev/null
    pkill -f "node.*server.js" 2>/dev/null
    echo "✅ Backend processes killed"
fi

# Kill frontend process
if [ -f "$PROJECT_ROOT/.frontend.pid" ]; then
    FRONTEND_PID=$(cat "$PROJECT_ROOT/.frontend.pid")
    kill $FRONTEND_PID 2>/dev/null
    rm "$PROJECT_ROOT/.frontend.pid"
    echo "✅ Frontend stopped"
else
    pkill -f "react-scripts" 2>/dev/null
    pkill -f "npm.*start" 2>/dev/null
    echo "✅ Frontend processes killed"
fi

echo "🎉 All services stopped!"