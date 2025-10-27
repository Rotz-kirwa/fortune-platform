#!/bin/bash

echo "🔧 Fixing Fortune Investment Platform Deployment Issues..."

# 1. Deploy backend with CORS fix
echo "📤 Deploying backend with CORS fix..."
cd backend
git add .
git commit -m "Fix CORS configuration and remove database permission errors"

# 2. Deploy frontend with correct API URL
echo "📤 Deploying frontend with correct API URL..."
cd ../frontend
git add .
git commit -m "Fix API URL to match backend deployment"

echo "✅ Fixes applied! Now you need to:"
echo "1. Push backend changes to trigger Render deployment"
echo "2. Push frontend changes to trigger Vercel deployment"
echo "3. Update M-PESA credentials in Render environment variables:"
echo "   - Get valid MPESA_CONSUMER_SECRET from Safaricom"
echo "   - Ensure all M-PESA credentials are correct"
echo ""
echo "🚨 CRITICAL: Your M-PESA_CONSUMER_SECRET is incomplete!"
echo "   Current: Ej8aBKJGJGJGJGJGJGJGJGJGJGJGJGJG"
echo "   You need the full secret from Safaricom Developer Portal"