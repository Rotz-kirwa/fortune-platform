#!/bin/bash

echo "🚀 Fortune Investment Platform - Quick Start"
echo "=========================================="

# Navigate to backend
cd backend

echo "📦 Installing dependencies..."
npm install

echo "🔧 Running emergency database fix..."
node emergency-fix.js

echo "🔒 Applying security fixes..."
node security-fix.js

echo "🎯 Starting server..."
npm run dev