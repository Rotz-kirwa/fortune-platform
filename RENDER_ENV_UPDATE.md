# 🚨 URGENT: Update Render Environment Variables

## ❌ **Current Issue:**
- M-PESA showing "Wrong credentials" error
- Render backend still has old/incorrect M-PESA credentials
- Need to update environment variables in Render dashboard

## 🔧 **Required Render Environment Variables:**

Go to your Render dashboard → Backend Service → Environment tab and set these **EXACT** values:

```
MPESA_CONSUMER_KEY=yqApGHNGuRmG2y94AXbUHukXqmEIwsAFaWcIGPejedWNcMUH
MPESA_CONSUMER_SECRET=RUCumMcAa73DXEtddIYZfhHAAtlxJ2stPkmjfAhSfSa0mvYq7VH2JdBl8cwMtDTo
MPESA_SHORTCODE=4185659
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://fortune-platform-1.onrender.com/api/payments/callback
MPESA_ENV=production
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here
```

## 📋 **Steps to Update:**

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select your backend service** (fortune-platform-1 or similar)
3. **Click "Environment" tab**
4. **Add/Update each variable** listed above
5. **Click "Save Changes"**
6. **Wait for automatic redeploy** (2-3 minutes)

## ✅ **After Update:**
- M-PESA payments will work
- No more "Wrong credentials" error
- STK Push will be successful

## 🎯 **Critical Variables:**
- `MPESA_CONSUMER_KEY` - Your production key
- `MPESA_CONSUMER_SECRET` - Your production secret  
- `MPESA_SHORTCODE` - 4185659
- `MPESA_ENV` - Must be "production"

**Update these in Render NOW to fix the M-PESA error!**