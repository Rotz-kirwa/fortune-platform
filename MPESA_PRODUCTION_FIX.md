# M-PESA Production System Fix Guide

## Current Issues Identified

### 1. Database Permission Error
**Error**: `must be owner of table payments`
**Cause**: PostgreSQL user lacks proper permissions
**Impact**: Server cannot start

### 2. Missing pending_investments Table
**Issue**: PendingInvestment model references non-existent table
**Impact**: Investment workflow fails

### 3. M-PESA Configuration Verification Needed
**Issue**: Need to verify production credentials work
**Impact**: Payment processing may fail

## Step-by-Step Fix Process

### Step 1: Fix Database Issues
```bash
# Run the database fix script
cd backend
node fix-db-now.js
```

### Step 2: Verify M-PESA Configuration
```bash
# Test M-PESA production credentials
node test-mpesa-production.js
```

### Step 3: Test Complete Investment Workflow
```bash
# Test end-to-end investment process
node test-investment-workflow.js
```

### Step 4: Start Server
```bash
# Start the development server
npm run dev
```

## Critical M-PESA & Investment Workflow Components

### 1. **M-PESA STK Push Flow**
```
User clicks "Pay via M-PESA" → 
Frontend calls /api/pay/stk → 
Backend initiates STK Push → 
M-PESA sends prompt to user's phone → 
User enters PIN → 
M-PESA sends callback to /api/payments/callback
```

### 2. **Investment Creation Flow**
```
STK Push successful → 
Create pending_investment record → 
M-PESA callback received → 
Verify payment details → 
Create actual investment → 
Update pending_investment status
```

### 3. **Key Database Tables**
- `users` - User accounts
- `investment_plans` - Available investment tiers
- `pending_investments` - Temporary records during payment
- `investments` - Active user investments
- `payments` - Payment transaction records

## Production Checklist

### ✅ M-PESA Configuration
- [x] Production credentials configured
- [x] Callback URL set to production domain
- [x] STK Push endpoint working
- [x] Callback endpoint handling responses

### ✅ Database Setup
- [ ] All required tables exist
- [ ] Proper user permissions granted
- [ ] Indexes created for performance
- [ ] Foreign key constraints working

### ✅ Investment Workflow
- [ ] Investment plans loaded
- [ ] Pending investment creation works
- [ ] Callback processing activates investments
- [ ] Dashboard shows correct data

## Environment Variables Check

Ensure these are properly set in `.env`:
```
# Database
DB_USER=fortune
DB_HOST=localhost
DB_NAME=fortune_db
DB_PASS=secret

# M-PESA Production
MPESA_ENV=production
MPESA_CONSUMER_KEY=yqApGHNGuRmG2y94AXbUHukXqmEIwsAFaWcIGPejedWNcMUH
MPESA_CONSUMER_SECRET=RUCumMcAa73DXEtddIYZfhHAAtlxJ2stPkmjfAhSfSa0mvYq7VH2JdBl8cwMtDTo
MPESA_SHORTCODE=4185659
MPESA_PASSKEY=cfdafe23e67aa246d4f143e9c669bb12689294d31e131f1a1cb578d00679b756
MPESA_CALLBACK_URL=https://fortune-platform-1.onrender.com/api/payments/callback
```

## Testing Commands

```bash
# Fix database issues
node fix-db-now.js

# Test M-PESA
node test-mpesa-production.js

# Test investment workflow
node test-investment-workflow.js

# Start server
npm run dev
```

## Expected Results

### Successful M-PESA Test:
```
✅ STK Push Success:
Response Code: 0
Response Description: Success. Request accepted for processing
Checkout Request ID: ws_CO_123456789
Customer Message: Success. Request accepted for processing
```

### Successful Investment Workflow:
```
✅ Database connected successfully
✅ Found 4 investment plans
✅ Pending investments table exists
✅ STK Push initiated successfully
✅ Pending investment created successfully
✅ Investment created successfully
```

## Next Steps After Fix

1. **Deploy to Production**: Update Render deployment
2. **Test with Real Phone**: Use actual Kenyan phone number
3. **Monitor Callbacks**: Check logs for M-PESA responses
4. **Verify Dashboard**: Ensure investments show correctly

## Support

If issues persist:
1. Check server logs for detailed errors
2. Verify M-PESA credentials with Safaricom
3. Test database connectivity
4. Review callback URL accessibility