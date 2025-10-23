# Implementation Plan

- [x] 1. Set up database schema and models


  - Create database migration script for new tables (transactions, withdrawals, balances, audit_logs)
  - Update existing tables (users, payments) with new columns
  - Create database indexes for performance optimization
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 10.1_



- [ ] 1.1 Create Transaction model
  - Write Transaction model with CRUD methods
  - Implement transaction creation with validation
  - Implement transaction status updates
  - Implement transaction query methods with filters


  - _Requirements: 4.1, 4.2, 10.1_

- [ ] 1.2 Create Balance model
  - Write Balance model with balance calculation methods
  - Implement balance initialization for new users


  - Implement balance locking/unlocking methods
  - Implement balance update methods with transaction safety
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 1.3 Create Withdrawal model


  - Write Withdrawal model with CRUD methods
  - Implement withdrawal creation with validation
  - Implement withdrawal status update methods
  - Implement withdrawal query methods for users and admins


  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 1.4 Create AuditLog model
  - Write AuditLog model with logging methods



  - Implement audit log creation with metadata
  - Implement audit log query methods with filters
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 1.5 Update existing models
  - Add role, phone_number, status, last_login columns to User model
  - Add user_id, investment_id, mpesa fields to Payment model


  - Update User model methods to handle new fields
  - Update Payment model methods to handle new fields
  - _Requirements: 1.1, 3.5, 5.2, 5.3_

- [x] 2. Implement M-PESA callback processing


  - Enhance M-PESA callback endpoint to process payments
  - Implement payment verification logic
  - Implement investment activation after successful payment
  - Implement payment failure handling
  - Implement duplicate callback prevention
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 5.1, 5.2, 5.3, 5.4, 5.5_



- [ ] 2.1 Create PaymentService
  - Write PaymentService class with callback processing method
  - Implement payment verification against expected amount
  - Implement M-PESA transaction ID validation
  - Implement phone number matching logic

  - _Requirements: 1.1, 5.1, 5.2, 5.3_

- [ ] 2.2 Implement callback handler
  - Update /api/pay/callback endpoint to use PaymentService
  - Parse M-PESA callback data structure
  - Extract transaction details from callback
  - Handle successful payment callbacks
  - Handle failed payment callbacks
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2.3 Implement investment activation
  - Create method to activate investment after payment
  - Update investment status to active
  - Create transaction record for deposit
  - Update user balance with investment amount
  - Send activation notification to user
  - _Requirements: 1.2, 4.2, 6.2, 7.2_

- [ ] 2.4 Implement payment failure handling
  - Create method to handle failed payments
  - Log payment failure with reason
  - Create failed transaction record
  - Send failure notification to user
  - _Requirements: 1.3, 7.1_

- [ ] 3. Implement M-PESA B2C for withdrawals
  - Add B2C payment function to M-PESA library
  - Implement B2C callback handler
  - Implement B2C timeout handler
  - Implement withdrawal processing with B2C
  - _Requirements: 2.2, 2.3, 2.4_

- [ ] 3.1 Enhance M-PESA library
  - Add initiateB2C function for withdrawal payments
  - Implement B2C request payload construction
  - Implement B2C authentication and token generation
  - Add error handling for B2C failures
  - _Requirements: 2.2_

- [ ] 3.2 Create B2C callback endpoints
  - Create /api/pay/b2c-callback endpoint
  - Parse B2C callback data structure
  - Extract transaction details from B2C callback
  - Update withdrawal status based on callback
  - Update user balance after successful B2C
  - _Requirements: 2.3, 2.4_

- [ ] 3.3 Create B2C timeout handler
  - Create /api/pay/b2c-timeout endpoint
  - Handle B2C timeout scenarios
  - Unlock user balance on timeout
  - Update withdrawal status to failed
  - _Requirements: 2.4_

- [ ] 4. Implement balance management system
  - Create BalanceService with balance operations
  - Implement balance initialization for new users
  - Implement balance locking for pending withdrawals
  - Implement balance updates for transactions
  - Implement balance calculation methods
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 4.1 Create BalanceService
  - Write BalanceService class with balance methods
  - Implement getUserBalance method
  - Implement addToAvailableBalance method
  - Implement deductFromAvailableBalance method
  - Implement lockBalance and unlockBalance methods
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 4.2 Implement balance API endpoints
  - Create GET /api/balance endpoint
  - Create GET /api/balance/history endpoint
  - Implement balance calculation with locked amounts
  - Return available, locked, and total balance
  - _Requirements: 6.1_

- [ ] 4.3 Integrate balance with investments
  - Update investment creation to lock balance
  - Update investment maturity to unlock balance
  - Update daily returns to credit available balance
  - _Requirements: 6.2, 6.3, 6.4_

- [ ] 5. Implement withdrawal system
  - Create WithdrawalService with withdrawal operations
  - Implement withdrawal request creation
  - Implement withdrawal approval workflow
  - Implement withdrawal processing with M-PESA B2C
  - Implement withdrawal completion handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 5.1 Create WithdrawalService
  - Write WithdrawalService class with withdrawal methods
  - Implement createWithdrawal method with validation
  - Implement approveWithdrawal method for admins
  - Implement processWithdrawal method with B2C integration
  - Implement rejectWithdrawal method
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 5.2 Create withdrawal API endpoints
  - Create POST /api/withdrawals endpoint for requests
  - Create GET /api/withdrawals endpoint for user history
  - Create GET /api/withdrawals/pending endpoint for admins
  - Create PUT /api/withdrawals/:id/approve endpoint
  - Create PUT /api/withdrawals/:id/reject endpoint
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 5.3 Implement withdrawal validation
  - Validate user has sufficient available balance
  - Validate minimum withdrawal amount
  - Validate maximum withdrawal amount
  - Validate daily withdrawal limit
  - Validate phone number format
  - _Requirements: 2.1, 2.5_

- [ ] 5.4 Implement withdrawal workflow
  - Lock balance when withdrawal is requested
  - Update status to approved when admin approves
  - Initiate B2C payment when processing
  - Complete withdrawal and unlock balance on success
  - Refund balance and update status on failure
  - _Requirements: 2.2, 2.3, 2.4, 6.5_

- [ ] 6. Implement transaction history system
  - Create TransactionService with transaction operations
  - Implement transaction creation for all financial events
  - Implement transaction query with filters
  - Implement transaction statistics calculation
  - Implement transaction export functionality
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 6.1 Create TransactionService
  - Write TransactionService class with transaction methods
  - Implement createTransaction method
  - Implement getUserTransactions method with pagination
  - Implement getTransactionByReference method
  - Implement updateTransactionStatus method
  - _Requirements: 4.1, 4.2_

- [ ] 6.2 Create transaction API endpoints
  - Create GET /api/transactions endpoint with filters
  - Create GET /api/transactions/:id endpoint
  - Create GET /api/transactions/stats endpoint
  - Create POST /api/transactions/export endpoint
  - _Requirements: 4.1, 4.3, 4.5_

- [ ] 6.3 Integrate transactions with all financial events
  - Create transaction on investment deposit
  - Create transaction on withdrawal request
  - Create transaction on daily return credit
  - Create transaction on commission payment
  - _Requirements: 4.2_

- [ ] 7. Implement admin dashboard backend
  - Create AdminController with admin operations
  - Implement admin authentication and authorization
  - Implement dashboard statistics calculation
  - Implement user management endpoints
  - Implement system monitoring endpoints
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 7.1 Create admin middleware
  - Write admin authentication middleware
  - Implement role-based access control
  - Check user role is admin or super_admin
  - Return 403 error for non-admin users
  - _Requirements: 3.5_

- [ ] 7.2 Create AdminController
  - Write AdminController class with admin methods
  - Implement getDashboardStats method
  - Implement getAllUsers method
  - Implement getUserDetails method
  - Implement suspendUser and activateUser methods
  - _Requirements: 3.1, 3.2, 8.1, 8.2, 8.3_

- [ ] 7.3 Create admin API endpoints
  - Create GET /api/admin/dashboard endpoint
  - Create GET /api/admin/users endpoint
  - Create GET /api/admin/users/:id endpoint
  - Create PUT /api/admin/users/:id/suspend endpoint
  - Create PUT /api/admin/users/:id/activate endpoint
  - Create GET /api/admin/investments endpoint
  - Create GET /api/admin/transactions endpoint
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 8.1, 8.2, 8.3_

- [ ] 7.4 Implement dashboard statistics
  - Calculate total users count
  - Calculate total investments amount
  - Calculate total withdrawals amount
  - Calculate pending withdrawals count
  - Calculate platform revenue
  - Calculate active users count
  - _Requirements: 3.1_

- [ ] 8. Implement audit logging system
  - Create AuditService with logging operations
  - Implement audit log creation for all critical actions
  - Implement audit log query with filters
  - Integrate audit logging across all services
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 8.1 Create AuditService
  - Write AuditService class with audit methods
  - Implement logAction method with metadata
  - Implement getAuditLogs method with filters
  - Implement getUserActivity method
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 8.2 Create audit API endpoints
  - Create GET /api/admin/audit-logs endpoint
  - Implement pagination for audit logs
  - Implement filtering by user, action, date range
  - _Requirements: 10.4_

- [ ] 8.3 Integrate audit logging
  - Log payment callbacks
  - Log withdrawal approvals/rejections
  - Log admin actions
  - Log balance changes
  - Log user status changes
  - _Requirements: 10.1, 10.2_

- [ ] 9. Implement frontend user components
  - Create balance display components
  - Create withdrawal request components
  - Create transaction history components
  - Update dashboard with new features
  - _Requirements: 2.1, 4.1, 6.1_

- [ ] 9.1 Create BalanceCard component
  - Display available balance
  - Display locked balance
  - Display total balance
  - Show balance breakdown
  - Add refresh button
  - _Requirements: 6.1_

- [ ] 9.2 Create WithdrawalModal component
  - Create withdrawal request form
  - Validate withdrawal amount
  - Show available balance
  - Display withdrawal fees if any
  - Show estimated processing time
  - Handle form submission
  - _Requirements: 2.1_

- [ ] 9.3 Create WithdrawalHistory component
  - Display user withdrawal history
  - Show withdrawal status with colors
  - Display M-PESA receipt numbers
  - Show processing timestamps
  - Add status filter
  - _Requirements: 2.1_

- [ ] 9.4 Create TransactionList component
  - Display user transactions in table
  - Show transaction type with icons
  - Display amount with color coding
  - Show transaction status
  - Add date range filter
  - Add transaction type filter
  - Implement pagination
  - _Requirements: 4.1, 4.3_

- [ ] 9.5 Update user dashboard
  - Add balance card to dashboard
  - Add withdrawal button
  - Add transaction history section
  - Update portfolio stats with balance info
  - _Requirements: 6.1_

- [ ] 10. Implement frontend admin components
  - Create admin dashboard page
  - Create user management components
  - Create withdrawal approval components
  - Create transaction monitoring components
  - Create audit log viewer
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 10.4_

- [ ] 10.1 Create AdminDashboard page
  - Display platform statistics cards
  - Show total users, investments, withdrawals
  - Display pending withdrawals count
  - Show recent activity feed
  - Add quick action buttons
  - _Requirements: 3.1_

- [ ] 10.2 Create UserManagement component
  - Display all users in table
  - Show user status with badges
  - Add search and filter functionality
  - Add suspend/activate buttons
  - Show user investment summary
  - Implement pagination
  - _Requirements: 3.2, 8.1, 8.2, 8.3_

- [ ] 10.3 Create WithdrawalApproval component
  - Display pending withdrawals in table
  - Show user details and amount
  - Add approve/reject buttons
  - Show user balance information
  - Add admin notes field
  - Implement approval workflow
  - _Requirements: 3.3, 2.2_

- [ ] 10.4 Create TransactionMonitor component
  - Display all platform transactions
  - Show real-time transaction updates
  - Add filters by type, status, user
  - Display transaction details modal
  - Add export functionality
  - _Requirements: 3.4_

- [ ] 10.5 Create AuditLogViewer component
  - Display audit logs in table
  - Show action, user, timestamp
  - Add filters by action type, user, date
  - Display old and new values
  - Implement pagination
  - _Requirements: 10.4_

- [ ] 10.6 Create admin routing and navigation
  - Add /admin route with protection
  - Create admin navigation menu
  - Add admin header with logout
  - Implement role-based route guards
  - _Requirements: 3.5_

- [ ] 11. Implement notification system
  - Create notification service
  - Implement email notifications
  - Implement in-app notifications
  - Integrate notifications with events
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 11.1 Create NotificationService
  - Write NotificationService class
  - Implement sendEmail method
  - Implement sendSMS method (optional)
  - Implement createInAppNotification method
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 11.2 Create email templates
  - Create payment confirmation email template
  - Create investment activation email template
  - Create withdrawal confirmation email template
  - Create daily returns summary email template
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 11.3 Integrate notifications
  - Send notification on successful payment
  - Send notification on investment activation
  - Send notification on withdrawal processing
  - Send notification on withdrawal completion
  - _Requirements: 7.1, 7.2, 7.3_

- [ ] 12. Implement investment maturity handling
  - Create maturity check service
  - Implement automatic maturity processing
  - Implement maturity notifications
  - Update investment status on maturity
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 12.1 Create MaturityService
  - Write MaturityService class
  - Implement checkMatureInvestments method
  - Implement processMaturity method
  - Calculate final returns on maturity
  - _Requirements: 9.1, 9.2_

- [ ] 12.2 Implement maturity processing
  - Unlock investment principal amount
  - Credit total returns to available balance
  - Update investment status to completed
  - Create transaction record for maturity
  - Send maturity notification
  - _Requirements: 9.2, 9.3, 9.4, 9.5_

- [ ] 12.3 Create maturity cron job
  - Set up scheduled task to check maturities
  - Run maturity check daily
  - Process all mature investments
  - Log maturity processing results
  - _Requirements: 9.1_

- [ ] 13. Testing and validation
  - Test M-PESA callback processing
  - Test withdrawal workflow end-to-end
  - Test balance calculations
  - Test admin operations
  - Test transaction history
  - _Requirements: All_

- [ ] 13.1 Test payment callback processing
  - Test successful payment callback
  - Test failed payment callback
  - Test duplicate callback prevention
  - Test amount mismatch handling
  - Test investment activation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ] 13.2 Test withdrawal system
  - Test withdrawal request creation
  - Test insufficient balance validation
  - Test withdrawal approval by admin
  - Test B2C payment initiation
  - Test withdrawal completion
  - Test withdrawal failure handling
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 13.3 Test balance management
  - Test balance initialization
  - Test balance locking/unlocking
  - Test balance updates on transactions
  - Test balance calculation accuracy
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 13.4 Test admin dashboard
  - Test admin authentication
  - Test dashboard statistics
  - Test user management operations
  - Test withdrawal approval workflow
  - Test audit log viewing
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 14. Documentation and deployment
  - Update API documentation
  - Create admin user guide
  - Update deployment configuration
  - Set up environment variables
  - Deploy to production
  - _Requirements: All_

- [ ] 14.1 Update documentation
  - Document new API endpoints
  - Document M-PESA callback format
  - Document withdrawal workflow
  - Document admin operations
  - Create troubleshooting guide
  - _Requirements: All_

- [ ] 14.2 Configure production environment
  - Set up production database
  - Configure M-PESA B2C credentials
  - Set up email service
  - Configure withdrawal limits
  - Set up monitoring and alerts
  - _Requirements: All_

- [ ] 14.3 Create initial admin user
  - Create database seed script
  - Add initial admin user
  - Set admin role and permissions
  - Test admin login
  - _Requirements: 3.5_
