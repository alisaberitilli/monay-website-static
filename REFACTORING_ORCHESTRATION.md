# Invoice-First Architecture Refactoring Orchestration Guide

## 🎯 Objective
Implement Invoice-First wallet architecture across all Monay applications with 4 parallel Claude sessions.

## 📋 Session Assignments & Execution Order

### SESSION 1: Backend (Port 3001) - START FIRST ⚡
**Branch:** `refactor/backend-20251005`
**Directory:** `/monay-backend-common`
**Plan:** `IMPLEMENTATION_PLAN_BACKEND.md`

#### Critical First Tasks (Complete Before Others Start):
1. **Database Schema** (30 mins)
   ```sql
   -- Core tables needed by all apps
   - invoice_wallets
   - ephemeral_wallets
   - provider_health
   - wallet_reserves
   ```

2. **Core Services** (1 hour)
   ```javascript
   - InvoiceWalletFactory
   - EphemeralWalletManager
   - ProviderOrchestrator
   ```

3. **Base API Endpoints** (30 mins)
   ```
   POST /api/v1/invoices/create-wallet
   POST /api/v1/wallets/ephemeral/create
   GET  /api/v1/providers/health
   ```

**Session 1 Start Command:**
```bash
cd /Users/alisaberi/Data/0ProductBuild/monay/monay-backend-common
git checkout refactor/backend-20251005
code IMPLEMENTATION_PLAN_BACKEND.md
# Give Claude: "Implement Phase 1 of Invoice-First backend from IMPLEMENTATION_PLAN_BACKEND.md"
```

---

### SESSION 2: Admin Dashboard (Port 3002) - START AFTER BACKEND APIs
**Branch:** `refactor/admin-20251005`
**Directory:** `/monay-admin`
**Plan:** `IMPLEMENTATION_PLAN_ADMIN.md`
**Dependencies:** Backend APIs must be ready

#### Key Components:
- Provider health monitoring dashboard
- Invoice wallet analytics
- Reserve reconciliation UI
- Real-time metrics WebSocket integration

**Session 2 Start Command:**
```bash
cd /Users/alisaberi/Data/0ProductBuild/monay/monay-admin
git checkout refactor/admin-20251005
code IMPLEMENTATION_PLAN_ADMIN.md
# Give Claude: "Implement admin dashboard for Invoice-First from IMPLEMENTATION_PLAN_ADMIN.md. Backend APIs are ready on port 3001."
```

---

### SESSION 3: Enterprise Wallet (Port 3007) - START AFTER BACKEND APIs
**Branch:** `refactor/enterprise-20251005`
**Directory:** `/monay-caas/monay-enterprise-wallet`
**Plan:** `IMPLEMENTATION_PLAN_ENTERPRISE.md`
**Dependencies:** Backend InvoiceWalletFactory must be ready

#### Key Features:
- Enterprise invoice creation UI
- Bulk invoice processing
- Vendor payment automation
- Payroll disbursement system

**Session 3 Start Command:**
```bash
cd /Users/alisaberi/Data/0ProductBuild/monay/monay-caas/monay-enterprise-wallet
git checkout refactor/enterprise-20251005
code IMPLEMENTATION_PLAN_ENTERPRISE.md
# Give Claude: "Implement enterprise Invoice-First features from IMPLEMENTATION_PLAN_ENTERPRISE.md. Backend APIs are ready on port 3001."
```

---

### SESSION 4: Consumer Wallet (Port 3003) - START AFTER BACKEND APIs
**Branch:** `refactor/consumer-20251005`
**Directory:** `/monay-cross-platform/web`
**Plan:** `IMPLEMENTATION_PLAN_CONSUMER.md`
**Dependencies:** Backend ephemeral wallet APIs must be ready

#### Key Features:
- Invoice payment flows
- Request-to-Pay (R2P) UI
- P2P invoice transfers
- Smart invoice features

**Session 4 Start Command:**
```bash
cd /Users/alisaberi/Data/0ProductBuild/monay/monay-cross-platform/web
git checkout refactor/consumer-20251005
code IMPLEMENTATION_PLAN_CONSUMER.md
# Give Claude: "Implement consumer Invoice-First features from IMPLEMENTATION_PLAN_CONSUMER.md. Backend APIs are ready on port 3001."
```

---

## 🔄 Execution Timeline

### Phase 1: Backend Foundation (2 hours)
**Session 1 SOLO**
- Database migrations
- Core services
- Basic API endpoints
- WebSocket setup

### Phase 2: Parallel Frontend Development (4 hours)
**Sessions 2, 3, 4 IN PARALLEL**
- Each session implements their UI components
- All use the same backend APIs on port 3001
- No conflicts as each works in different directories

### Phase 3: Integration Testing (1 hour)
**All Sessions Together**
- End-to-end flow testing
- Cross-application invoice flows
- Performance validation

---

## 📡 API Contract (Backend provides to all frontends)

### Invoice Wallet APIs
```typescript
// Create invoice with wallet
POST /api/v1/invoices/create-wallet
Body: {
  amount: number,
  currency: string,
  vendorId: string,
  description: string,
  dueDate: Date,
  metadata: object
}
Response: {
  invoiceId: string,
  walletAddress: string,
  paymentLink: string,
  qrCode: string
}

// Create ephemeral wallet
POST /api/v1/wallets/ephemeral/create
Body: {
  purpose: 'p2p' | 'invoice' | 'payroll',
  expiryMinutes: number,
  amount?: number
}
Response: {
  walletId: string,
  address: string,
  expiresAt: Date
}

// Provider health
GET /api/v1/providers/health
Response: {
  providers: [{
    name: string,
    status: 'healthy' | 'degraded' | 'down',
    latency: number,
    successRate: number
  }]
}
```

### WebSocket Events
```typescript
// Backend emits to all connected clients
ws.emit('invoice.created', { invoiceId, walletAddress })
ws.emit('invoice.paid', { invoiceId, txHash, amount })
ws.emit('wallet.expired', { walletId })
ws.emit('provider.statusChange', { provider, status })
```

---

## ⚠️ Critical Coordination Points

### 1. Database Schema Lock-in (Session 1 First)
- Session 1 MUST complete database schema before others start
- No schema changes after Phase 1 completion

### 2. API Endpoint Naming (Immutable After Phase 1)
- All endpoints defined in Phase 1 are final
- Frontend sessions depend on these exact paths

### 3. WebSocket Event Names (Standardized)
- Use exact event names as specified
- All apps listen to same events

### 4. Shared Types/Interfaces
```typescript
// All sessions use these same types
interface Invoice {
  id: string;
  walletAddress: string;
  amount: number;
  status: 'pending' | 'paid' | 'expired';
}

interface EphemeralWallet {
  id: string;
  address: string;
  expiresAt: Date;
  balance: number;
}
```

---

## 🚀 Launch Sequence

### Step 1: Start Backend Session (9:00 AM)
```bash
# Terminal 1 - Backend Development
cd monay-backend-common
git checkout refactor/backend-20251005
npm run dev  # Keep running on port 3001
```

### Step 2: Wait for Backend Phase 1 (11:00 AM)
- Confirm database migrations complete
- Test core APIs with curl/Postman
- Verify WebSocket connection

### Step 3: Launch Frontend Sessions (11:00 AM)
```bash
# Terminal 2 - Admin
cd monay-admin
git checkout refactor/admin-20251005
npm run dev  # Port 3002

# Terminal 3 - Enterprise
cd monay-caas/monay-enterprise-wallet
git checkout refactor/enterprise-20251005
npm run dev  # Port 3007

# Terminal 4 - Consumer
cd monay-cross-platform/web
git checkout refactor/consumer-20251005
npm run dev  # Port 3003
```

---

## 🔍 Integration Checkpoints

### Checkpoint 1: Backend APIs Ready (After 2 hours)
```bash
# Test core endpoints
curl http://localhost:3001/api/v1/providers/health
curl -X POST http://localhost:3001/api/v1/invoices/create-wallet -d '{...}'
```

### Checkpoint 2: Frontend Connections (After 3 hours)
- Admin dashboard shows provider health
- Enterprise can create invoices
- Consumer can view invoices

### Checkpoint 3: End-to-End Flow (After 5 hours)
1. Enterprise creates invoice → Backend generates wallet
2. Admin sees new invoice in dashboard
3. Consumer pays invoice → All apps update in real-time

---

## 📝 Session Instructions Template

### For Each Claude Session, Provide:
```markdown
You are implementing the [COMPONENT] part of Invoice-First architecture.

Your implementation plan: [IMPLEMENTATION_PLAN_XXX.md]
Your branch: refactor/[component]-20251005
Your directory: [path]
Your port: [port]

Backend APIs are ready on http://localhost:3001
Database schema is already migrated.

Focus on your specific features:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Use these exact API endpoints: [list endpoints]
Listen for these WebSocket events: [list events]

Start with Phase 1 from your implementation plan.
```

---

## 🛠️ Troubleshooting

### If Backend Session Gets Blocked:
- Other sessions can mock API responses temporarily
- Use static data to continue UI development

### If Merge Conflicts Occur:
- Each session works in separate directories
- Conflicts unlikely, but resolve in favor of feature branches

### If Integration Fails:
- Check port availability: `lsof -i :3001,3002,3003,3007`
- Verify database connection: `psql -U alisaberi -d monay -c "\\dt"`
- Check Redis: `redis-cli ping`

---

## ✅ Success Criteria

1. **Backend**: All Invoice-First APIs operational
2. **Admin**: Real-time monitoring dashboard functional
3. **Enterprise**: Can create and manage bulk invoices
4. **Consumer**: Can pay invoices via ephemeral wallets
5. **Integration**: End-to-end invoice flow works across all apps

---

## 🎯 Final Merge Strategy

After all sessions complete:
```bash
# 1. Merge backend first (foundation)
git checkout main
git merge refactor/backend-20251005

# 2. Merge frontends (no conflicts expected)
git merge refactor/admin-20251005
git merge refactor/enterprise-20251005
git merge refactor/consumer-20251005

# 3. Run integration tests
npm run test:integration

# 4. Tag release
git tag -a v2.0.0-invoice-first -m "Invoice-First Architecture Implementation"
git push origin main --tags
```