# Monay Consumer Wallet - Database Schema Requirements
**⚠️ CRITICAL: This document identifies EXISTING tables to reuse and NEW tables/columns needed**

## 🔴 IMPORTANT: Database Sharing Notice
- **Database**: PostgreSQL on port 5432 (SHARED)
- **Database Name**: `monay` (SHARED with Enterprise Wallet & CaaS)
- **Principle**: REUSE existing tables, EXTEND only when absolutely necessary
- **Coordination Required**: Any changes to existing tables must be coordinated with other teams

---

## 📊 Existing Tables to REUSE (DO NOT MODIFY Without Coordination)

### ✅ CONFIRMED EXISTING TABLES in monay-backend-common

#### 1. **users** table (User.js model)
**Status**: ✅ EXISTS - REUSE COMPLETELY
```sql
-- Confirmed existing columns:
- id (STRING/UUID primary key)
- firstName
- lastName
- email (unique)
- mobile (includes country code)
- phoneNumber (virtual field)
- isActive (BOOLEAN)
- isEmailVerified
- isMobileVerified
- role
- qrcode
- profileImage
- countryCode
- createdAt
- updatedAt
```
**Consumer Wallet Usage**: Primary user accounts, authentication

#### 2. **wallets** table (Wallet.js model)
**Status**: ✅ EXISTS - REUSE COMPLETELY
```sql
-- Confirmed existing columns:
- id (STRING primary key)
- userId (FK to users)
- walletAddress (unique)
- walletType (ENUM: 'solana', 'evm', 'bitcoin', 'virtual')
- balance (DECIMAL 20,8)
- currency (STRING, default 'USD')
- isDefault (BOOLEAN)
- stripeCustomerId
- stripePaymentMethodId
- metadata (JSONB)
- status
- createdAt
- updatedAt
```
**Consumer Wallet Usage**: Multi-currency wallet management

#### 3. **transactions** table (Transaction.js model)
**Status**: ✅ EXISTS - REUSE COMPLETELY
```sql
-- Confirmed existing columns:
- id
- senderId
- receiverId
- amount
- currency
- type
- status
- transactionHash
- metadata
- paymentRequestId (FK to payment_requests)
- createdAt
- updatedAt
```
**Consumer Wallet Usage**: All transaction records

#### 4. **user_cards** table (UserCard.js model)
**Status**: ✅ EXISTS - REUSE COMPLETELY
```sql
-- Confirmed existing columns:
- id
- userId
- cardNumber (encrypted/masked)
- cardType
- expiryMonth
- expiryYear
- isDefault
- createdAt
- updatedAt
```
**Consumer Wallet Usage**: Card management

#### 5. **kyc_documents** table (KycDocument.js model)
**Status**: ✅ EXISTS - REUSE COMPLETELY
```sql
-- Confirmed existing columns:
- id
- userId
- documentType
- documentNumber
- documentUrl
- verificationStatus
- createdAt
- updatedAt
```
**Consumer Wallet Usage**: KYC verification

#### 6. **payment_requests** table (PaymentRequest.js model)
**Status**: ✅ EXISTS - REUSE COMPLETELY
```sql
-- Confirmed existing columns:
- id
- requesterId (FK to users)
- payerId (FK to users)
- amount
- message
- declineReason
- status (ENUM: 'pending', 'paid', 'declined')
- createdAt
- updatedAt
```
**Consumer Wallet Usage**: Payment requests feature

#### 7. **child_parents** table (ChildParent.js model)
**Status**: ✅ EXISTS - PRIMARY/SECONDARY ACCOUNTS ALREADY IMPLEMENTED!
```sql
-- Confirmed existing columns:
- userId (secondary/child user)
- parentId (primary/parent user)
- verificationOtp
- isParentVerified (BOOLEAN)
- limit (FLOAT - spending limit)
- remainAmount (FLOAT)
- status (ENUM: 'active', 'inactive', 'deleted')
- createdAt
- updatedAt
```
**Consumer Wallet Usage**: This ALREADY implements Primary/Secondary account relationships!

#### 8. **user_bank_accounts** table (UserBankAccount.js model)
**Status**: ✅ EXISTS - REUSE COMPLETELY
```sql
-- For ACH and bank transfers
- id
- userId
- accountNumber
- routingNumber
- accountType
- isDefault
- status
```

#### 9. **invoices** table (from migrations)
**Status**: ✅ EXISTS - REUSE COMPLETELY
```sql
-- Confirmed from 000_create_invoices.sql:
- id (UUID)
- invoice_number (unique)
- user_id
- type (inbound/outbound)
- amount
- currency
- status
- client_name
- vendor_name
- description
- payment_method
- due_date
- paid_date
- is_recurring
- metadata (JSONB)
```

#### 10. **invoice_wallets** table (from migrations)
**Status**: ✅ EXISTS - For Invoice-First Wallet System
```sql
-- Advanced wallet features for invoices
- id
- invoice_id
- mode (ephemeral/persistent/adaptive)
- base_address
- solana_address
- quantum keys and compliance features
```

---

## 🆕 NEW Tables Needed (Consumer Wallet Specific)

### ✨ GREAT NEWS: Primary/Secondary Accounts Already Exist!
The `child_parents` table already implements the Primary/Secondary account relationship we need!
We just need to extend it slightly for additional features.

### 2. **auto_topup_rules**
```sql
CREATE TABLE auto_topup_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES payment_methods(id),
  trigger_balance DECIMAL(15,2) NOT NULL,
  topup_amount DECIMAL(15,2) NOT NULL,
  max_topup_per_day DECIMAL(15,2),
  max_topup_per_month DECIMAL(15,2),
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 3. **payment_requests**
```sql
CREATE TABLE payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_user_id UUID REFERENCES users(id),
  payer_user_id UUID REFERENCES users(id),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  reason TEXT NOT NULL, -- Invoice-first model
  status VARCHAR(20) DEFAULT 'pending', -- pending/paid/cancelled/expired
  qr_code TEXT,
  paid_transaction_id UUID REFERENCES transactions(id),
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP,
  metadata JSONB
);
```

### 4. **ready_cash_loans**
```sql
CREATE TABLE ready_cash_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  wallet_id UUID REFERENCES wallets(id),
  loan_amount DECIMAL(15,2) NOT NULL,
  disbursed_amount DECIMAL(15,2),
  repaid_amount DECIMAL(15,2) DEFAULT 0,
  interest_rate DECIMAL(5,2),
  status VARCHAR(20), -- pending/approved/disbursed/repaid/defaulted
  due_date DATE,
  eligibility_score DECIMAL(5,2),
  disbursed_at TIMESTAMP,
  repaid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB -- cashflow analysis, etc.
);
```

### 5. **gift_cards**
```sql
CREATE TABLE gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE NOT NULL,
  sender_user_id UUID REFERENCES users(id),
  recipient_email VARCHAR(255),
  recipient_user_id UUID REFERENCES users(id),
  amount DECIMAL(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  status VARCHAR(20), -- created/sent/claimed/expired
  expires_at TIMESTAMP,
  claimed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);
```

### 6. **loyalty_rewards**
```sql
CREATE TABLE loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  points_balance INTEGER DEFAULT 0,
  tier VARCHAR(20), -- bronze/silver/gold/platinum
  total_points_earned INTEGER DEFAULT 0,
  total_points_redeemed INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  transaction_id UUID REFERENCES transactions(id),
  points_earned INTEGER,
  points_redeemed INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7. **bills_management**
```sql
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  biller_name VARCHAR(255),
  biller_type VARCHAR(50), -- utility/telecom/insurance/etc
  account_number VARCHAR(100),
  amount_due DECIMAL(15,2),
  due_date DATE,
  auto_pay_enabled BOOLEAN DEFAULT false,
  payment_method_id UUID REFERENCES payment_methods(id),
  last_paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);
```

### 8. **super_app_bookings**
```sql
CREATE TABLE super_app_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  service_type VARCHAR(50), -- flight/hotel/ride/food/etc
  provider VARCHAR(100), -- Uber/Lyft/DoorDash/etc
  booking_reference VARCHAR(100),
  amount DECIMAL(15,2),
  status VARCHAR(20),
  booking_data JSONB, -- Complete booking details
  transaction_id UUID REFERENCES transactions(id),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

### 9. **ai_financial_insights**
```sql
CREATE TABLE ai_financial_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  insight_type VARCHAR(50), -- budget/saving/spending/investment
  category VARCHAR(50),
  recommendation TEXT,
  confidence_score DECIMAL(3,2),
  is_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  metadata JSONB
);
```

### 10. **charity_donations**
```sql
CREATE TABLE charity_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  charity_id UUID,
  charity_name VARCHAR(255),
  amount DECIMAL(15,2),
  currency VARCHAR(10),
  transaction_id UUID REFERENCES transactions(id),
  tax_receipt_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## ⚠️ MODIFICATIONS Needed to Existing Tables (COORDINATE WITH TEAM)

### 1. **users** table - Additional columns needed:
```sql
-- COORDINATE BEFORE ADDING:
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'primary'; -- primary/secondary
ALTER TABLE users ADD COLUMN IF NOT EXISTS parent_user_id UUID REFERENCES users(id); -- for secondary accounts
ALTER TABLE users ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS country_code VARCHAR(2) DEFAULT 'US';

-- India-specific KYC fields (if not exists)
ALTER TABLE users ADD COLUMN IF NOT EXISTS aadhaar_number VARCHAR(20); -- encrypted
ALTER TABLE users ADD COLUMN IF NOT EXISTS pan_number VARCHAR(20); -- encrypted
```

### 2. **wallets** table - Additional columns needed:
```sql
-- COORDINATE BEFORE ADDING:
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS auto_topup_enabled BOOLEAN DEFAULT false;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS minimum_balance DECIMAL(15,2) DEFAULT 0;
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS wallet_nickname VARCHAR(50);
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;
```

### 3. **transactions** table - Additional metadata fields:
```sql
-- May need to ensure metadata JSONB includes:
- split_bill_id (for group payments)
- request_id (for payment requests)
- invoice_id (for invoice payments)
- category (food/travel/utilities/etc)
- merchant_name
- location_data
```

### 4. **cards** table - Additional fields:
```sql
-- COORDINATE BEFORE ADDING:
ALTER TABLE cards ADD COLUMN IF NOT EXISTS nfc_enabled BOOLEAN DEFAULT false;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS tap_to_pay_enabled BOOLEAN DEFAULT false;
ALTER TABLE cards ADD COLUMN IF NOT EXISTS card_design VARCHAR(50);
ALTER TABLE cards ADD COLUMN IF NOT EXISTS linked_wallet_id UUID REFERENCES wallets(id);
```

---

## 📍 Regional Tables (India-Specific)

### 1. **upi_handles** (India)
```sql
CREATE TABLE upi_handles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  upi_id VARCHAR(100) UNIQUE NOT NULL, -- user@monay
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. **bharat_qr_codes** (India)
```sql
CREATE TABLE bharat_qr_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  merchant_id UUID,
  qr_code_data TEXT,
  qr_type VARCHAR(20), -- static/dynamic
  amount DECIMAL(15,2), -- for dynamic QR
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

---

## 🔄 API Endpoints to Coordinate

### Existing Endpoints to Use (from monay-backend-common):
- `POST /api/auth/login`
- `POST /api/auth/register`
- `GET /api/users/profile`
- `GET /api/wallets/balance`
- `POST /api/transactions/create`
- `GET /api/transactions/history`

### New Endpoints Needed:
- `POST /api/accounts/secondary/create`
- `PUT /api/accounts/secondary/{id}/limits`
- `POST /api/wallet/auto-topup/configure`
- `POST /api/payments/request/create`
- `POST /api/loans/ready-cash/apply`
- `POST /api/bills/add`
- `POST /api/super-app/book`
- `GET /api/ai/insights`
- `POST /api/loyalty/earn`
- `POST /api/gift-cards/create`

---

## 🚀 Implementation Priority

### Phase 1: Core Features (Use Existing)
1. ✅ User authentication (existing)
2. ✅ Wallet management (existing)
3. ✅ Basic transactions (existing)
4. ✅ KYC flow (existing)

### Phase 2: Consumer-Specific Features
1. 🆕 Primary/Secondary accounts
2. 🆕 Auto top-up
3. 🆕 Payment requests
4. 🆕 Bills management

### Phase 3: Advanced Features
1. 🆕 Ready Cash loans
2. 🆕 Gift cards & loyalty
3. 🆕 Super app bookings
4. 🆕 AI insights

### Phase 4: Regional Features
1. 🆕 UPI integration (India)
2. 🆕 Bharat QR (India)
3. 🆕 Aadhaar Pay (India)

---

## ⚠️ Critical Coordination Points

### Before ANY Changes:
1. **Check with Enterprise Wallet team** - They may already have similar features
2. **Check with CaaS team** - Token/wallet features might overlap
3. **Review existing migrations** - Avoid conflicts with pending changes
4. **Test in shared dev environment** - Ensure no breaking changes

### Communication Required For:
- [ ] Adding columns to `users` table
- [ ] Adding columns to `wallets` table
- [ ] Modifying transaction metadata structure
- [ ] Adding new indexes for performance
- [ ] Any changes to existing API endpoints

---

## 🔐 Security Considerations

### Sensitive Data Encryption:
- Aadhaar numbers
- PAN numbers
- Bank account details
- Card numbers
- Payment method details

### Access Control:
- Primary users can view secondary account transactions
- Secondary users cannot view primary account details
- Merchants have limited access to customer data

---

## 📝 Next Steps

1. **Review with Team**: Share this document with Enterprise Wallet and CaaS teams
2. **Confirm Existing Schema**: Verify what tables/columns already exist
3. **Create Migration Plan**: Only for NEW tables
4. **API Documentation**: Document all new endpoints
5. **Testing Strategy**: Ensure zero regression on existing features

---

*Last Updated: [Current Date]*
*Status: DRAFT - Pending Team Review*