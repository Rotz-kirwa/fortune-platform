# M-PESA Production Setup Guide

## Current Issues
1. **Invalid Consumer Secret**: Your current secret `Ej8aBKJGJGJGJGJGJGJGJGJGJGJGJGJG` is incomplete
2. **Wrong Credentials Error**: M-PESA is rejecting your authentication

## Required Actions

### 1. Get Valid M-PESA Credentials
Visit [Safaricom Developer Portal](https://developer.safaricom.co.ke/):
1. Login to your account
2. Go to your app dashboard
3. Copy the **complete** Consumer Key and Consumer Secret

### 2. Update Render Environment Variables
In your Render dashboard, set these environment variables:

```
MPESA_CONSUMER_KEY=your_actual_consumer_key
MPESA_CONSUMER_SECRET=your_actual_consumer_secret_full_length
MPESA_SHORTCODE=4185659
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_CALLBACK_URL=https://fortune-platform-1.onrender.com/api/payments/callback
MPESA_ENV=production
```

### 3. Test Credentials
Use this endpoint to test: `GET /api/payments/test-credentials`

### 4. Verify Callback URL
Ensure your callback URL is registered in Safaricom Developer Portal:
- URL: `https://fortune-platform-1.onrender.com/api/payments/callback`
- Method: POST

## Common Issues
- **401 Unauthorized**: Wrong consumer key/secret
- **500 Internal Error**: Invalid shortcode or passkey
- **Timeout**: Network issues or wrong environment URLs

## Next Steps
1. Get correct credentials from Safaricom
2. Update Render environment variables
3. Redeploy backend
4. Test STK Push functionality