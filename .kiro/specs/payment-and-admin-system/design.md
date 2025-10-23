# Design Document

## Overview

This design document outlines the technical architecture for implementing M-PESA callback processing, withdrawal system, admin dashboard, and transaction history in the Fortune Investment Platform. The design focuses on reliability, security, and scalability while maintaining the existing codebase structure.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   User       │  │    Admin     │  │ Transaction  │      │
│  │  Dashboard   │  │  Dashboard   │  │   History    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Express)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Payment     │  │  Withdrawal  │  │    Admin     │      │
│  │ Controller   │  │  Controller  │  │  Controller  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Transaction  │  │   Balance    │  │    Audit     │      │
│  │  Service     │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ transactions │  │  withdrawals │  │  audit_logs  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   balances   │  │    admins    │  │   payments   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   M-PESA     │  │    Email     │  │     SMS      │      │
│  │   Daraja     │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. Database Models

#### Transactions Table
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'deposit', 'withdrawal', 'return', 'commission'
  amount NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled'
  reference VARCHAR(100) UNIQUE, -- M-PESA transaction ID or internal reference
  description TEXT,
  metadata JSONB, -- Store additional data like phone number, investment_id, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_reference ON transactions(reference);
```

#### Withdrawals Table
```sql
CREATE TABLE withdrawals (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  phone_number VARCHAR(15) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'processing', 'completed', 'failed', 'cancelled'
  mpesa_transaction_id VARCHAR(100),
  mpesa_receipt_number VARCHAR(100),
  admin_id INT REFERENCES users(id), -- Admin who approved/rejected
  admin_notes TEXT,
  failure_reason TEXT,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP,
  completed_at TIMESTAMP
);

CREATE INDEX idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX idx_withdrawals_status ON withdrawals(status);
```

#### Balances Table
```sql
CREATE TABLE balances (
  id SERIAL PRIMARY KEY,
  user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  available_balance NUMERIC(10,2) DEFAULT 0.00,
  locked_balance NUMERIC(10,2) DEFAULT 0.00,
  total_deposited NUMERIC(10,2) DEFAULT 0.00,
  total_withdrawn NUMERIC(10,2) DEFAULT 0.00,
  total_returns NUMERIC(10,2) DEFAULT 0.00,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_balances_user_id ON balances(user_id);
```

#### Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  admin_id INT REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- 'payment_received', 'withdrawal_approved', etc.
  entity_type VARCHAR(50), -- 'investment', 'withdrawal', 'user', etc.
  entity_id INT,
  old_value JSONB,
  new_value JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

#### Update Users Table
```sql
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user'; -- 'user', 'admin', 'super_admin'
ALTER TABLE users ADD COLUMN phone_number VARCHAR(15);
ALTER TABLE users ADD COLUMN status VARCHAR(20) DEFAULT 'active'; -- 'active', 'suspended', 'deleted'
ALTER TABLE users ADD COLUMN last_login TIMESTAMP;
```

#### Update Payments Table
```sql
ALTER TABLE payments ADD COLUMN user_id INT REFERENCES users(id);
ALTER TABLE payments ADD COLUMN investment_id INT REFERENCES investments(id);
ALTER TABLE payments ADD COLUMN mpesa_transaction_id VARCHAR(100);
ALTER TABLE payments ADD COLUMN mpesa_receipt_number VARCHAR(100);
ALTER TABLE payments ADD COLUMN phone_number VARCHAR(15);
ALTER TABLE payments ADD COLUMN callback_data JSONB;
```

### 2. Backend Services

#### TransactionService
```javascript
class TransactionService {
  // Create a new transaction
  async createTransaction(userId, type, amount, reference, metadata)
  
  // Get user transactions with pagination
  async getUserTransactions(userId, filters, page, limit)
  
  // Get transaction by reference
  async getTransactionByReference(reference)
  
  // Update transaction status
  async updateTransactionStatus(transactionId, status, metadata)
  
  // Get transaction statistics
  async getTransactionStats(userId, startDate, endDate)
}
```

#### BalanceService
```javascript
class BalanceService {
  // Get user balance
  async getUserBalance(userId)
  
  // Initialize balance for new user
  async initializeBalance(userId)
  
  // Add to available balance
  async addToAvailableBalance(userId, amount, description)
  
  // Deduct from available balance
  async deductFromAvailableBalance(userId, amount, description)
  
  // Lock balance (for pending withdrawals)
  async lockBalance(userId, amount)
  
  // Unlock balance (if withdrawal fails)
  async unlockBalance(userId, amount)
  
  // Calculate total balance
  async calculateTotalBalance(userId)
}
```

#### WithdrawalService
```javascript
class WithdrawalService {
  // Create withdrawal request
  async createWithdrawal(userId, amount, phoneNumber)
  
  // Get pending withdrawals (admin)
  async getPendingWithdrawals()
  
  // Approve withdrawal (admin)
  async approveWithdrawal(withdrawalId, adminId)
  
  // Process withdrawal (initiate M-PESA B2C)
  async processWithdrawal(withdrawalId)
  
  // Complete withdrawal (after M-PESA confirmation)
  async completeWithdrawal(withdrawalId, mpesaData)
  
  // Reject withdrawal (admin)
  async rejectWithdrawal(withdrawalId, adminId, reason)
  
  // Get user withdrawals
  async getUserWithdrawals(userId)
}
```

#### PaymentService
```javascript
class PaymentService {
  // Process M-PESA callback
  async processCallback(callbackData)
  
  // Verify payment
  async verifyPayment(transactionId, amount, phoneNumber)
  
  // Activate investment after payment
  async activateInvestment(paymentId, investmentId)
  
  // Handle payment failure
  async handlePaymentFailure(paymentId, reason)
  
  // Get payment by M-PESA transaction ID
  async getPaymentByMpesaId(mpesaTransactionId)
}
```

#### AuditService
```javascript
class AuditService {
  // Log action
  async logAction(userId, action, entityType, entityId, oldValue, newValue, metadata)
  
  // Get audit logs with filters
  async getAuditLogs(filters, page, limit)
  
  // Get user activity
  async getUserActivity(userId, startDate, endDate)
}
```

### 3. M-PESA Integration

#### Enhanced M-PESA Library
```javascript
// lib/mpesa.js

// Existing STK Push function (already implemented)
async function initiateStkPush({ amount, phoneNumber, accountReference })

// New: B2C Payment (for withdrawals)
async function initiateB2C({ amount, phoneNumber, remarks, occasion })

// New: Transaction Status Query
async function queryTransactionStatus(checkoutRequestId)

// New: Account Balance Query
async function queryAccountBalance()

// New: Verify callback signature
function verifyCallbackSignature(callbackData, signature)
```

### 4. API Endpoints

#### Transaction Endpoints
```
GET    /api/transactions              - Get user transactions (protected)
GET    /api/transactions/:id          - Get transaction by ID (protected)
GET    /api/transactions/stats        - Get transaction statistics (protected)
POST   /api/transactions/export       - Export transactions (protected)
```

#### Withdrawal Endpoints
```
POST   /api/withdrawals               - Create withdrawal request (protected)
GET    /api/withdrawals               - Get user withdrawals (protected)
GET    /api/withdrawals/pending       - Get pending withdrawals (admin)
PUT    /api/withdrawals/:id/approve   - Approve withdrawal (admin)
PUT    /api/withdrawals/:id/reject    - Reject withdrawal (admin)
POST   /api/withdrawals/:id/process   - Process withdrawal (admin)
```

#### Balance Endpoints
```
GET    /api/balance                   - Get user balance (protected)
GET    /api/balance/history           - Get balance history (protected)
```

#### Admin Endpoints
```
GET    /api/admin/dashboard           - Get admin dashboard stats (admin)
GET    /api/admin/users               - Get all users (admin)
GET    /api/admin/users/:id           - Get user details (admin)
PUT    /api/admin/users/:id/suspend   - Suspend user (admin)
PUT    /api/admin/users/:id/activate  - Activate user (admin)
GET    /api/admin/investments         - Get all investments (admin)
GET    /api/admin/transactions        - Get all transactions (admin)
GET    /api/admin/audit-logs          - Get audit logs (admin)
```

#### Enhanced Payment Endpoints
```
POST   /api/pay/callback              - M-PESA STK callback (enhanced)
POST   /api/pay/b2c-callback          - M-PESA B2C callback (new)
POST   /api/pay/timeout               - M-PESA timeout callback (new)
```

### 5. Frontend Components

#### User Components
```
components/
├── balance/
│   ├── BalanceCard.tsx           - Display user balance
│   ├── BalanceHistory.tsx        - Balance change history
│   └── WithdrawalForm.tsx        - Withdrawal request form
├── transactions/
│   ├── TransactionList.tsx       - List of transactions
│   ├── TransactionFilter.tsx     - Filter transactions
│   └── TransactionExport.tsx     - Export functionality
└── withdrawal/
    ├── WithdrawalModal.tsx       - Withdrawal request modal
    ├── WithdrawalHistory.tsx     - User withdrawal history
    └── WithdrawalStatus.tsx      - Withdrawal status tracker
```

#### Admin Components
```
components/admin/
├── AdminDashboard.tsx            - Admin overview
├── UserManagement.tsx            - User list and management
├── WithdrawalApproval.tsx        - Pending withdrawal approvals
├── InvestmentManagement.tsx      - All investments view
├── TransactionMonitor.tsx        - Real-time transaction monitoring
├── AuditLogViewer.tsx            - Audit log browser
└── SystemStats.tsx               - Platform statistics
```

## Data Models

### Transaction Model
```typescript
interface Transaction {
  id: number;
  user_id: number;
  type: 'deposit' | 'withdrawal' | 'return' | 'commission';
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  description: string;
  metadata: {
    phone_number?: string;
    investment_id?: number;
    mpesa_transaction_id?: string;
    [key: string]: any;
  };
  created_at: Date;
  updated_at: Date;
}
```

### Withdrawal Model
```typescript
interface Withdrawal {
  id: number;
  user_id: number;
  amount: number;
  phone_number: string;
  status: 'pending' | 'approved' | 'processing' | 'completed' | 'failed' | 'cancelled';
  mpesa_transaction_id?: string;
  mpesa_receipt_number?: string;
  admin_id?: number;
  admin_notes?: string;
  failure_reason?: string;
  requested_at: Date;
  processed_at?: Date;
  completed_at?: Date;
}
```

### Balance Model
```typescript
interface Balance {
  id: number;
  user_id: number;
  available_balance: number;
  locked_balance: number;
  total_deposited: number;
  total_withdrawn: number;
  total_returns: number;
  updated_at: Date;
}
```

## Error Handling

### Payment Callback Errors
```javascript
// Handle duplicate callbacks
if (existingPayment) {
  return { status: 'duplicate', message: 'Payment already processed' };
}

// Handle invalid amount
if (callbackAmount !== expectedAmount) {
  await logAudit('payment_amount_mismatch', { expected, received });
  return { status: 'error', message: 'Amount mismatch' };
}

// Handle M-PESA failure
if (resultCode !== '0') {
  await handlePaymentFailure(paymentId, resultDescription);
  return { status: 'failed', message: resultDescription };
}
```

### Withdrawal Errors
```javascript
// Insufficient balance
if (userBalance < withdrawalAmount) {
  throw new Error('Insufficient balance');
}

// Minimum withdrawal amount
if (withdrawalAmount < MIN_WITHDRAWAL) {
  throw new Error(`Minimum withdrawal is KSh ${MIN_WITHDRAWAL}`);
}

// M-PESA B2C failure
if (b2cResponse.ResultCode !== '0') {
  await unlockBalance(userId, amount);
  await updateWithdrawalStatus(withdrawalId, 'failed', b2cResponse.ResultDesc);
}
```

## Testing Strategy

### Unit Tests
- Transaction service methods
- Balance calculation logic
- Payment verification logic
- Withdrawal validation
- M-PESA integration functions

### Integration Tests
- M-PESA callback processing flow
- Withdrawal approval and processing flow
- Balance updates across transactions
- Admin operations

### End-to-End Tests
- Complete investment flow (payment → activation)
- Complete withdrawal flow (request → approval → processing)
- Admin dashboard operations
- Transaction history and filtering

### Manual Testing Checklist
- [ ] M-PESA STK Push with real payment
- [ ] M-PESA callback processing
- [ ] Investment activation after payment
- [ ] Withdrawal request creation
- [ ] Admin withdrawal approval
- [ ] M-PESA B2C payment
- [ ] Balance calculations
- [ ] Transaction history display
- [ ] Admin dashboard statistics
- [ ] Audit log recording

## Security Considerations

### Authentication & Authorization
- JWT token validation on all protected routes
- Role-based access control (user vs admin)
- Admin-only endpoints protected with role check
- Session timeout and token refresh

### Payment Security
- Verify M-PESA callback signature
- Validate callback source IP (Safaricom IPs only)
- Prevent duplicate payment processing
- Encrypt sensitive payment data
- Log all payment attempts

### Withdrawal Security
- Two-factor authentication for withdrawals (future)
- Admin approval required for large withdrawals
- Daily withdrawal limits per user
- Fraud detection for suspicious patterns
- Lock balance during pending withdrawal

### Data Protection
- Encrypt sensitive user data
- Hash phone numbers in logs
- Sanitize all user inputs
- Prevent SQL injection with parameterized queries
- Rate limiting on API endpoints

## Performance Optimization

### Database Optimization
- Index frequently queried columns
- Use connection pooling
- Implement query result caching
- Optimize complex joins
- Archive old transactions

### API Optimization
- Implement pagination for large datasets
- Cache dashboard statistics
- Use database transactions for atomic operations
- Implement request throttling
- Optimize N+1 queries

### Frontend Optimization
- Lazy load admin components
- Implement virtual scrolling for long lists
- Cache API responses
- Debounce search inputs
- Optimize re-renders with React.memo

## Deployment Considerations

### Environment Variables
```
# Withdrawal Configuration
MIN_WITHDRAWAL_AMOUNT=100
MAX_WITHDRAWAL_AMOUNT=100000
WITHDRAWAL_FEE_PERCENTAGE=0
DAILY_WITHDRAWAL_LIMIT=500000

# Admin Configuration
ADMIN_EMAIL=admin@fortune.com
SUPER_ADMIN_EMAIL=superadmin@fortune.com

# M-PESA B2C Configuration
MPESA_B2C_SHORTCODE=600XXX
MPESA_B2C_INITIATOR_NAME=apiuser
MPESA_B2C_SECURITY_CREDENTIAL=encrypted_password
MPESA_B2C_QUEUE_TIMEOUT_URL=https://domain.com/api/pay/b2c-timeout
MPESA_B2C_RESULT_URL=https://domain.com/api/pay/b2c-callback

# Notification Configuration
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=false
```

### Database Migrations
- Create migration scripts for new tables
- Add columns to existing tables
- Create indexes
- Seed initial admin user
- Migrate existing data if needed

### Monitoring & Logging
- Log all M-PESA callbacks
- Monitor withdrawal processing times
- Alert on failed payments
- Track balance discrepancies
- Monitor API response times

## Future Enhancements

### Phase 2 Features
- Automated daily return crediting
- Investment maturity automation
- Referral system implementation
- Email/SMS notifications
- Two-factor authentication

### Phase 3 Features
- Mobile app (React Native)
- Advanced analytics dashboard
- Automated fraud detection
- Multi-currency support
- API for third-party integrations
