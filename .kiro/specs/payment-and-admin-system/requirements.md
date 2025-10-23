# Requirements Document

## Introduction

This document outlines the requirements for implementing critical missing features in the Fortune Investment Platform: M-PESA callback processing, withdrawal system, admin dashboard, and transaction history. These features are essential for the platform to function properly in production.

## Glossary

- **System**: The Fortune Investment Platform backend and frontend application
- **M-PESA**: Mobile money payment service by Safaricom
- **STK Push**: SIM Toolkit Push - M-PESA payment prompt sent to user's phone
- **Callback**: HTTP POST request from M-PESA to System after payment completion
- **Investment**: User's deposited funds in a specific investment plan
- **Withdrawal**: User's request to transfer funds from platform to M-PESA account
- **Admin**: Platform administrator with elevated privileges
- **Transaction**: Any financial operation (deposit, withdrawal, commission)
- **User**: Platform investor with standard privileges

## Requirements

### Requirement 1: M-PESA Callback Processing

**User Story:** As a user, I want my investment to be automatically activated when my M-PESA payment is successful, so that I can start earning returns immediately.

#### Acceptance Criteria

1. WHEN M-PESA sends a successful payment callback, THE System SHALL create a payment record in the database
2. WHEN M-PESA sends a successful payment callback, THE System SHALL activate the corresponding investment
3. WHEN M-PESA sends a failed payment callback, THE System SHALL log the failure and notify the user
4. WHEN a payment callback is received, THE System SHALL validate the transaction details before processing
5. WHEN a duplicate callback is received, THE System SHALL prevent duplicate investment activation

### Requirement 2: Withdrawal System

**User Story:** As a user, I want to withdraw my returns to my M-PESA account, so that I can access my earned profits.

#### Acceptance Criteria

1. WHEN a user requests a withdrawal, THE System SHALL validate the user has sufficient available balance
2. WHEN a withdrawal is approved, THE System SHALL initiate M-PESA B2C payment to the user's phone number
3. WHEN a withdrawal is processed, THE System SHALL deduct the amount from the user's available balance
4. WHEN a withdrawal fails, THE System SHALL refund the amount to the user's available balance
5. WHERE a user has active investments, THE System SHALL calculate available balance excluding locked investment amounts

### Requirement 3: Admin Dashboard

**User Story:** As an admin, I want a dashboard to manage users, investments, and withdrawals, so that I can oversee platform operations.

#### Acceptance Criteria

1. WHEN an admin logs in, THE System SHALL display a dashboard with platform statistics
2. WHEN an admin views the user list, THE System SHALL display all registered users with their investment details
3. WHEN an admin views pending withdrawals, THE System SHALL display all withdrawal requests awaiting approval
4. WHEN an admin approves a withdrawal, THE System SHALL process the M-PESA payment
5. WHERE an admin role is required, THE System SHALL restrict access to users without admin privileges

### Requirement 4: Transaction History

**User Story:** As a user, I want to view my complete transaction history, so that I can track all my deposits, withdrawals, and earnings.

#### Acceptance Criteria

1. WHEN a user views transaction history, THE System SHALL display all transactions in reverse chronological order
2. WHEN a transaction is created, THE System SHALL record the transaction type, amount, status, and timestamp
3. WHEN a user filters transactions, THE System SHALL display only transactions matching the selected criteria
4. WHERE a transaction involves M-PESA, THE System SHALL display the M-PESA transaction ID
5. WHEN a user exports transaction history, THE System SHALL generate a downloadable report

### Requirement 5: Payment Verification

**User Story:** As the system, I want to verify M-PESA payments before activating investments, so that fraudulent transactions are prevented.

#### Acceptance Criteria

1. WHEN a payment callback is received, THE System SHALL verify the callback signature from M-PESA
2. WHEN a payment amount is received, THE System SHALL match it against the expected investment amount
3. WHEN a payment phone number is received, THE System SHALL match it against the user's registered phone number
4. IF a payment verification fails, THEN THE System SHALL reject the transaction and log the failure
5. WHEN a payment is verified, THE System SHALL update the payment status to confirmed

### Requirement 6: Balance Management

**User Story:** As a user, I want to see my available balance separate from locked investment amounts, so that I know how much I can withdraw.

#### Acceptance Criteria

1. WHEN a user views their dashboard, THE System SHALL display total balance, locked balance, and available balance
2. WHEN an investment is created, THE System SHALL lock the investment amount
3. WHEN an investment matures, THE System SHALL unlock the principal and add returns to available balance
4. WHEN daily returns are calculated, THE System SHALL add returns to available balance
5. WHERE a withdrawal is pending, THE System SHALL lock the withdrawal amount until processed

### Requirement 7: Notification System

**User Story:** As a user, I want to receive notifications for important events, so that I stay informed about my investments.

#### Acceptance Criteria

1. WHEN a payment is successful, THE System SHALL send a confirmation notification to the user
2. WHEN an investment is activated, THE System SHALL send an activation notification to the user
3. WHEN a withdrawal is processed, THE System SHALL send a confirmation notification to the user
4. WHEN daily returns are credited, THE System SHALL send a summary notification to the user
5. WHERE a user has enabled email notifications, THE System SHALL send notifications via email

### Requirement 8: Admin User Management

**User Story:** As an admin, I want to manage user accounts, so that I can handle support requests and security issues.

#### Acceptance Criteria

1. WHEN an admin views a user profile, THE System SHALL display complete user information and investment history
2. WHEN an admin suspends a user account, THE System SHALL prevent the user from making new investments
3. WHEN an admin activates a suspended account, THE System SHALL restore full user privileges
4. WHEN an admin views user activity, THE System SHALL display login history and transaction logs
5. WHERE a user requests account deletion, THE System SHALL allow admin to process the request after settling balances

### Requirement 9: Investment Maturity Handling

**User Story:** As the system, I want to automatically handle investment maturity, so that users receive their returns without manual intervention.

#### Acceptance Criteria

1. WHEN an investment reaches maturity date, THE System SHALL calculate final returns
2. WHEN an investment matures, THE System SHALL unlock the principal amount
3. WHEN an investment matures, THE System SHALL add total returns to available balance
4. WHEN an investment matures, THE System SHALL update investment status to completed
5. WHEN an investment matures, THE System SHALL send a maturity notification to the user

### Requirement 10: Audit Trail

**User Story:** As an admin, I want a complete audit trail of all system operations, so that I can investigate issues and ensure compliance.

#### Acceptance Criteria

1. WHEN any financial transaction occurs, THE System SHALL log the transaction with timestamp and user details
2. WHEN an admin performs an action, THE System SHALL log the action with admin identifier
3. WHEN a system error occurs, THE System SHALL log the error with stack trace and context
4. WHEN an audit log is queried, THE System SHALL return logs matching the search criteria
5. WHERE compliance requires, THE System SHALL retain audit logs for a minimum of seven years
