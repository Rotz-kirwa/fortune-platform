#!/bin/bash

echo "🚀 Deploying Fortune Investment Platform Fixes..."

# Update M-PESA credentials in Render
echo "📋 Updated M-PESA credentials:"
echo "Consumer Key: yqApGHNGuRmG2y94AXbUHukXqmEIwsAFaWcIGPejedWNcMUH"
echo "Consumer Secret: RUCumMcAa73DXEtddIYZfhHAAtlxJ2stPkmjfAhSfSa0mvYq7VH2JdBl8cwMtDTo"
echo "Shortcode: 4185659"

echo ""
echo "✅ Fixed Issues:"
echo "1. CORS configuration updated"
echo "2. Database permission errors removed"
echo "3. Frontend API URL corrected"
echo "4. M-PESA credentials updated"

echo ""
echo "📤 Deploy Commands:"
echo "git add ."
echo "git commit -m 'Fix CORS, database permissions, and M-PESA credentials'"
echo "git push origin main"

echo ""
echo "🔧 Render Environment Variables to Update:"
echo "MPESA_CONSUMER_KEY=yqApGHNGuRmG2y94AXbUHukXqmEIwsAFaWcIGPejedWNcMUH"
echo "MPESA_CONSUMER_SECRET=RUCumMcAa73DXEtddIYZfhHAAtlxJ2stPkmjfAhSfSa0mvYq7VH2JdBl8cwMtDTo"