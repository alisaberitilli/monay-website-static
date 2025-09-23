# Monay Consumer Wallet - Quick Start Build Plan

## 🎉 GREAT NEWS: Most Infrastructure Already Exists!

After reviewing the monay-backend-common codebase, we can immediately build many Consumer Wallet features using existing infrastructure with ZERO database changes!

---

## ✅ Features We Can Build IMMEDIATELY (No DB Changes)

### 1. **Primary/Secondary Account System** ✅ READY
- **Table**: `child_parents` already exists!
- **Features Available**:
  - Link secondary users to primary accounts
  - Set spending limits (`limit` field)
  - Track remaining amounts (`remainAmount`)
  - Parent verification system (`isParentVerified`)
  - Status management (active/inactive)
- **What We Can Build Today**:
  - Secondary user onboarding flow
  - QR code linking (User model has `qrcode` field)
  - Spending limit management
  - Family wallet dashboard

### 2. **Payment Requests** ✅ READY
- **Table**: `payment_requests` exists!
- **Features Available**:
  - Create payment requests
  - Track status (pending/paid/declined)
  - Add messages/reasons
  - Link to transactions
- **What We Can Build Today**:
  - Request money feature
  - Payment request dashboard
  - Notification system (Notification model exists)

### 3. **Multi-Currency Wallets** ✅ READY
- **Table**: `wallets` exists with support for:
  - Multiple wallet types (solana, evm, bitcoin, virtual)
  - Balance tracking
  - Multiple currencies
  - Stripe integration
- **What We Can Build Today**:
  - Wallet dashboard
  - Multi-currency support
  - Virtual card issuance

### 4. **KYC/Identity** ✅ READY
- **Tables**: `user_kyc`, `kyc_documents` exist!
- **What We Can Build Today**:
  - KYC onboarding flow
  - Document upload
  - Verification status tracking

### 5. **Cards** ✅ READY
- **Table**: `user_cards` exists!
- **What We Can Build Today**:
  - Virtual card management
  - Card linking
  - Default card selection

### 6. **Transactions** ✅ READY
- **Table**: `transactions` exists with full support
- **What We Can Build Today**:
  - P2P transfers
  - Transaction history
  - Transaction tracking

### 7. **Bank Accounts** ✅ READY
- **Table**: `user_bank_accounts` exists!
- **What We Can Build Today**:
  - ACH setup
  - Bank account linking
  - Bank transfers

### 8. **Invoices** ✅ READY
- **Table**: `invoices` exists with Invoice-First Wallet support
- **What We Can Build Today**:
  - Invoice payments
  - Invoice management
  - Invoice-first wallet creation

---

## 🔨 Build Order - Phase 1 (Week 1-2)

### Day 1-2: Set Up Consumer Web App
```bash
cd /Users/alisaberi/Data/0ProductBuild/monay/monay-cross-platform/web

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Set:
# NEXT_PUBLIC_API_URL=http://localhost:3001
# NEXT_PUBLIC_APP_URL=http://localhost:3003

# 3. Start development
npm run dev
```

### Day 3-4: Implement Authentication
- Use existing `/api/auth/login` endpoint
- Use existing `/api/auth/register` endpoint
- Implement JWT storage
- Add biometric login UI

### Day 5-6: Build Wallet Dashboard
- Use existing `/api/wallets` endpoints
- Display multi-currency balances
- Show transaction history
- Add/withdraw funds UI

### Day 7-8: Implement P2P Transfers
- Use existing transactions system
- Build transfer UI
- Add contact management
- QR code scanning

### Day 9-10: Primary/Secondary Accounts
- Use existing `child_parents` table
- Build invitation flow
- Implement spending limits
- Create oversight dashboard

---

## 📝 NEW Tables We Need to Add (Phase 2)

Only these tables are truly missing:

### 1. **auto_topup_rules** (NEW)
```sql
CREATE TABLE auto_topup_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id VARCHAR REFERENCES wallets(id),
  payment_method_id VARCHAR,
  trigger_balance DECIMAL(15,2),
  topup_amount DECIMAL(15,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2. **ready_cash_loans** (NEW)
```sql
CREATE TABLE ready_cash_loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id),
  loan_amount DECIMAL(15,2),
  status VARCHAR(20),
  due_date DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. **gift_cards** (NEW)
```sql
CREATE TABLE gift_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(20) UNIQUE,
  sender_user_id VARCHAR REFERENCES users(id),
  amount DECIMAL(15,2),
  status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4. **loyalty_rewards** (NEW)
```sql
CREATE TABLE loyalty_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id),
  points_balance INTEGER DEFAULT 0,
  tier VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5. **bills** (NEW)
```sql
CREATE TABLE bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id),
  biller_name VARCHAR(255),
  amount_due DECIMAL(15,2),
  due_date DATE,
  auto_pay_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 6. **super_app_bookings** (NEW)
```sql
CREATE TABLE super_app_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id),
  service_type VARCHAR(50),
  provider VARCHAR(100),
  amount DECIMAL(15,2),
  booking_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 API Endpoints Already Available

### From monay-backend-common:
```javascript
// Authentication
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/verify-otp

// Users
GET /api/users/profile
PUT /api/users/profile
POST /api/users/upload-avatar

// Wallets
GET /api/wallets
POST /api/wallets/create
GET /api/wallets/:id/balance
POST /api/wallets/set-default

// Transactions
POST /api/transactions/transfer
GET /api/transactions/history
GET /api/transactions/:id

// Payment Requests
POST /api/payment-requests/create
GET /api/payment-requests
PUT /api/payment-requests/:id/pay
PUT /api/payment-requests/:id/decline

// Cards
GET /api/cards
POST /api/cards/add
DELETE /api/cards/:id

// Bank Accounts
GET /api/bank-accounts
POST /api/bank-accounts/add
POST /api/bank-accounts/verify

// KYC
POST /api/kyc/submit
GET /api/kyc/status
POST /api/kyc/upload-document
```

---

## 🎯 Immediate Action Plan

### Step 1: Start Building UI (No Backend Changes)
1. Set up Next.js web app on port 3003
2. Create authentication flow
3. Build wallet dashboard
4. Implement P2P transfers
5. Add payment requests
6. Create Primary/Secondary account management

### Step 2: Extend Existing Tables (Minor Changes)
Coordinate with team to add these columns:
- `users` table: Add `preferred_language`, `country_code`
- `wallets` table: Add `auto_topup_enabled`, `minimum_balance`
- `child_parents` table: Add `relationship_type`, `auto_topup_amount`

### Step 3: Add New Tables (Phase 2)
Create migrations for truly new features:
- Auto top-up rules
- Ready Cash loans
- Gift cards & loyalty
- Bills management
- Super app bookings

---

## 📊 Success Metrics

### Week 1 Deliverables:
- ✅ Authentication working
- ✅ Wallet dashboard live
- ✅ P2P transfers functional
- ✅ Payment requests working

### Week 2 Deliverables:
- ✅ Primary/Secondary accounts
- ✅ Card management
- ✅ Bank account linking
- ✅ Transaction history

### No Database Changes Required for MVP! 🎉

---

## 💡 Key Insights

1. **80% of features can use existing tables** - Great code reuse!
2. **Primary/Secondary accounts already built** - Just needs UI
3. **Payment infrastructure ready** - Stripe integration exists
4. **No breaking changes needed** - All additive

## Next Steps:
1. Start building the web UI immediately
2. Use existing API endpoints
3. Gradually add new tables for advanced features
4. Coordinate minor column additions with team

**Bottom Line**: We can have a working Consumer Wallet MVP in 1-2 weeks using existing infrastructure!