# Database Migration Guide

## The Error You're Seeing

```
error: must be owner of table payments
```

This means your database user doesn't have permission to alter existing tables. Don't worry, we can fix this!

## Solution: Run Migration Manually

### Option 1: Using psql (Recommended)

```bash
cd backend/migrations

# Run the migration
psql -U fortune -d fortune_db -f 002_add_columns_only.sql

# Enter your database password when prompted
```

### Option 2: Using sudo (if you have postgres superuser access)

```bash
cd backend/migrations

# Run as postgres superuser
sudo -u postgres psql -d fortune_db -f 002_add_columns_only.sql
```

### Option 3: Using Docker (if using Docker for PostgreSQL)

```bash
cd backend/migrations

# Copy migration file to container and run
docker cp 002_add_columns_only.sql postgres_container:/tmp/
docker exec -it postgres_container psql -U fortune -d fortune_db -f /tmp/002_add_columns_only.sql
```

### Option 4: Manual SQL (if psql doesn't work)

Connect to your database using any tool (pgAdmin, DBeaver, etc.) and run this SQL:

```sql
-- Add columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15);
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

-- Add columns to payments table
ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS investment_id INT REFERENCES investments(id);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS mpesa_transaction_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS mpesa_receipt_number VARCHAR(100);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS phone_number VARCHAR(15);
ALTER TABLE payments ADD COLUMN IF NOT EXISTS callback_data JSONB;
```

## After Running Migration

1. **Restart your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **You should see:**
   ```
   🚀 Server listening on port 4000
   ✅ PostgreSQL connected with pg Pool.
   ```

3. **No more errors!** The models will now work with the updated tables.

## Verify Migration Worked

Connect to your database and check:

```sql
-- Check users table has new columns
\d users

-- Check payments table has new columns
\d payments

-- Check new tables exist
\dt
```

You should see:
- `users` table with: role, phone_number, status, last_login
- `payments` table with: user_id, investment_id, mpesa_transaction_id, etc.
- New tables: transactions, withdrawals, balances, audit_logs

## Troubleshooting

### Still getting permission errors?

You need to grant permissions to your database user:

```sql
-- Connect as postgres superuser
sudo -u postgres psql

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO fortune;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO fortune;

-- Exit
\q
```

### Can't connect to database?

Check your `.env` file has correct credentials:
```
DB_USER=fortune
DB_HOST=localhost
DB_NAME=fortune_db
DB_PASS=secret
DB_PORT=5432
```

### Need to reset everything?

If you want to start fresh (⚠️ THIS WILL DELETE ALL DATA):

```sql
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS balances CASCADE;
DROP TABLE IF EXISTS withdrawals CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS investment_plans CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

Then restart your backend server and all tables will be recreated.

## Next Steps

Once migration is complete:
1. ✅ Restart backend server
2. ✅ Test with a small investment
3. ✅ Check logs for successful callback processing
4. ✅ Verify data in database

Need help? Check the logs or ask for assistance!
