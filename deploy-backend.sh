#!/bin/bash

echo "🚀 Deploying Fortune Investment Platform Backend..."

# Navigate to backend directory
cd backend

# Add and commit changes
git add .
git commit -m "Fix: Remove table creation in production to avoid permissions error

- Modified Payment model to only check table existence in production
- Added production setup script for environment validation
- Fixed database permissions issue on Render deployment"

# Push to main branch (triggers Render deployment)
git push origin main

echo "✅ Backend deployed! Check Render dashboard for deployment status."
echo ""
echo "📝 Don't forget to add these environment variables in Render:"
echo "MPESA_CONSUMER_KEY=VvpMBSUKLtlPuDGFCC3n5eZt3DM140fSngYrDr9I07NAn6OJ"
echo "MPESA_CONSUMER_SECRET=Ej8aBKJGJGJGJGJGJGJGJGJGJGJGJGJG"
echo "MPESA_SHORTCODE=4185659"
echo "MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"
echo "MPESA_CALLBACK_URL=https://fortune-platform-1.onrender.com/api/payments/callback"
echo "MPESA_ENV=production"