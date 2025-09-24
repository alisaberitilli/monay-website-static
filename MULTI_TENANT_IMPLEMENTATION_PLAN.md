# Multi-Tenant Architecture Implementation Plan
## Vault-Based Multi-Tenant System for Monay Platform
## Version 2.0 - Updated with Hybrid Billing Model & USDXM

### Executive Summary
This document provides a comprehensive, step-by-step implementation plan for the Vault-Based Multi-Tenant Architecture with **Hybrid Billing Model** and **USDXM stablecoin integration** across all Monay applications. The implementation will be executed in sequential phases to ensure system stability and minimize risk.

## Key Architecture Changes
- **Billing Model**: Hybrid (base subscription + usage overages) instead of complex usage-based
- **Payment**: USDXM (USD eXpress Monay) stablecoin with 10% discount
- **Gross Margins**: Enforced 60-80% based on tier
- **Computation Units**: Abstract measure for complex operations

## Implementation Timeline Overview
- **Total Duration**: 8-10 weeks (reduced from 12-14)
- **Team Size**: 4-6 developers
- **Testing Buffer**: 2 weeks included
- **Rollback Strategy**: Each phase reversible

## Phase 1: Database Foundation (Week 1-2)

### 1.1 Create Tenant Management Tables
**Location**: `/monay-backend-common/src/migrations/003_tenant_management.sql`

#### Tasks:
1. Design tenant table schema
2. Create tenant_codes sequence generator
3. Implement tenant partitioning strategy
4. Add indexes for performance
5. Create audit trail tables

#### Deliverables:
- Migration script for tenants table
- Tenant code generation function
- Partition management procedures
- Performance benchmarks

### 1.2 Create Groups Management Tables
**Location**: `/monay-backend-common/src/migrations/004_groups_management.sql`

#### Tasks:
1. Design groups table for households/holdings
2. Create group membership tables
3. Implement group hierarchy support
4. Add group configuration fields
5. Create group validation triggers

#### Deliverables:
- Groups table migration
- Group membership functions
- Hierarchy traversal queries
- Group type constraints

### 1.3 Create Hybrid Billing Infrastructure Tables ✅ COMPLETED
**Location**: `/monay-backend-common/src/migrations/005_billing_infrastructure.sql`

#### Tasks Completed:
1. ✅ Design billing_tier_config table (base fee + overages)
2. ✅ Create operation_costs table (computation units)
3. ✅ Implement billing_metrics table (monthly aggregation)
4. ✅ Add stablecoin_payment_config table
5. ✅ Create gross margin enforcement (60-80%)

#### Key Changes from Original:
- **Simplified**: Base subscription + usage overages instead of complex events
- **USDXM Integration**: 10% discount for native stablecoin
- **Computation Units**: Abstract measure instead of granular tracking
- **Margin Tracking**: Built-in gross margin percentage per tier

### 1.4 Update Existing Tables
**Location**: `/monay-backend-common/src/migrations/006_add_tenant_columns.sql`

#### Tasks:
1. Add tenant_id to transactions table
2. Add tenant_id to wallets table
3. Add tenant_id to invoices table
4. Add tenant_id to cards table
5. Update all foreign key relationships

#### Deliverables:
- ALTER TABLE scripts
- Data migration for existing records
- Rollback procedures
- Verification queries

## Phase 2: Backend API Infrastructure (Week 3-4)

### 2.1 Tenant Management Service
**Location**: `/monay-backend-common/src/services/tenantService.js`

#### Tasks:
1. Create tenant provisioning functions
2. Implement tenant isolation middleware
3. Build tenant switching logic
4. Add tenant validation helpers
5. Create tenant cleanup procedures

#### API Endpoints:
```
POST   /api/tenants/create
GET    /api/tenants/:id
PUT    /api/tenants/:id
DELETE /api/tenants/:id
POST   /api/tenants/switch
GET    /api/tenants/current
```

### 2.2 Group Management Service
**Location**: `/monay-backend-common/src/services/groupService.js`

#### Tasks:
1. Create group creation logic
2. Implement member management
3. Build hierarchy navigation
4. Add billing aggregation
5. Create treasury sharing logic

#### API Endpoints:
```
POST   /api/groups/create
GET    /api/groups/:id
POST   /api/groups/:id/members
DELETE /api/groups/:id/members/:userId
GET    /api/groups/:id/hierarchy
GET    /api/groups/:id/billing
```

### 2.3 Billing Calculation Service ✅ UPDATED FOR HYBRID MODEL
**Location**: `/monay-backend-common/src/services/billing-calculation.js`

#### Tasks Completed:
1. ✅ Implement operation tracking with computation units
2. ✅ Create hybrid bill calculation (base + overages)
3. ✅ Build USDXM discount logic (10% off)
4. ✅ Add gross margin enforcement
5. ✅ Create monthly billing aggregation

#### API Endpoints (Updated):
```
POST   /api/billing/track-operation     # Track usage with computation units
GET    /api/billing/calculate/:tenantId # Calculate hybrid bill with USDXM discount
GET    /api/billing/history/:tenantId   # Get billing history
POST   /api/billing/payment             # Process USDXM payment
GET    /api/billing/usage/:tenantId     # Get current usage vs limits
POST   /api/billing/process-monthly     # Run monthly billing for all tenants
```

### 2.4 HD Wallet Derivation Service
**Location**: `/monay-backend-common/src/services/walletDerivationService.js`

#### Tasks:
1. Implement BIP-44 derivation
2. Create tenant path generation
3. Build key isolation logic
4. Add HSM integration
5. Create recovery functions

#### API Endpoints:
```
POST   /api/wallets/derive/:tenantId
GET    /api/wallets/path/:tenantId
POST   /api/wallets/recover/:tenantId
GET    /api/wallets/addresses/:tenantId
```

## Phase 3: Middleware & Security (Week 5)

### 3.1 Tenant Isolation Middleware
**Location**: `/monay-backend-common/src/middleware/tenantIsolation.js`

#### Tasks:
1. Create request tenant extraction
2. Implement RLS enforcement
3. Add query filtering
4. Build response filtering
5. Create audit logging

### 3.2 Session Management Updates
**Location**: `/monay-backend-common/src/middleware/sessionManager.js`

#### Tasks:
1. Update JWT structure
2. Add multi-context support
3. Implement context switching
4. Add tenant validation
5. Create session migration

### 3.3 CORS Configuration Updates
**Location**: `/monay-backend-common/src/config/cors.js`

#### Tasks:
1. Add tenant-specific origins
2. Implement dynamic CORS
3. Add subdomain support
4. Create whitelist management
5. Add security headers

### 3.4 Rate Limiting Updates
**Location**: `/monay-backend-common/src/middleware/rateLimiter.js`

#### Tasks:
1. Add tenant-based limits
2. Implement tier-based throttling
3. Create usage tracking
4. Add burst protection
5. Build quota management

## Phase 4: Database Procedures & Functions (Week 6)

### 4.1 Tenant Management Functions
**Location**: `/monay-backend-common/src/migrations/007_tenant_functions.sql`

#### Functions to Create:
```sql
- create_tenant()
- upgrade_tenant_tier()
- calculate_tenant_usage()
- enforce_tenant_limits()
- cleanup_tenant_data()
```

### 4.2 Billing Calculation Functions
**Location**: `/monay-backend-common/src/migrations/008_billing_functions.sql`

#### Functions to Create:
```sql
- calculate_transaction_cost()
- apply_margin_markup()
- aggregate_group_billing()
- process_payment_waterfall()
- generate_invoice_data()
```

### 4.3 Group Management Functions
**Location**: `/monay-backend-common/src/migrations/009_group_functions.sql`

#### Functions to Create:
```sql
- create_household_group()
- create_holding_company()
- add_group_member()
- calculate_group_limits()
- share_treasury_access()
```

## Phase 5: Frontend - Enterprise Wallet Updates (Week 7)

### 5.1 Tenant Selection UI
**Location**: `/monay-caas/monay-enterprise-wallet/src/components/TenantSelector.tsx`

#### Tasks:
1. Create tenant dropdown component
2. Add context switching UI
3. Implement visual indicators
4. Add tenant info display
5. Create quick switch menu

### 5.2 Group Management Interface
**Location**: `/monay-caas/monay-enterprise-wallet/src/pages/groups/`

#### Pages to Create:
- `index.tsx` - Groups list
- `create.tsx` - Create group wizard
- `[id]/members.tsx` - Member management
- `[id]/billing.tsx` - Billing view
- `[id]/settings.tsx` - Group settings

### 5.3 Billing Dashboard Updates
**Location**: `/monay-caas/monay-enterprise-wallet/src/pages/billing/`

#### Components to Update:
- Usage metrics display
- Margin calculator
- Invoice preview
- Payment history
- Cost breakdown charts

### 5.4 Multi-Tenant Wallet View
**Location**: `/monay-caas/monay-enterprise-wallet/src/components/WalletMultiView.tsx`

#### Tasks:
1. Create consolidated wallet view
2. Add tenant filtering
3. Implement balance aggregation
4. Add cross-tenant transfers
5. Create treasury view

## Phase 6: Frontend - Admin Dashboard Updates (Week 8)

### 6.1 Tenant Administration
**Location**: `/monay-admin/src/pages/tenants/`

#### Pages to Create:
- `index.tsx` - Tenant list
- `create.tsx` - Tenant provisioning
- `[id]/details.tsx` - Tenant details
- `[id]/limits.tsx` - Limit configuration
- `[id]/billing.tsx` - Billing management

### 6.2 User-Organization Management
**Location**: `/monay-admin/src/pages/users/`

#### Updates Required:
- Add user type selector
- Create organization assignment
- Update user profile forms
- Add context management
- Implement role assignment

### 6.3 Billing Administration
**Location**: `/monay-admin/src/pages/billing/`

#### Components to Create:
- Margin configuration
- Tier management
- Invoice generation
- Payment processing
- Revenue analytics

### 6.4 Compliance Updates
**Location**: `/monay-admin/src/pages/compliance/`

#### Tasks:
1. Add tenant-based KYC view
2. Create group compliance dashboard
3. Update transaction monitoring
4. Add tenant risk scoring
5. Implement audit trails

## Phase 7: Frontend - Consumer Wallet Updates (Week 9)

### 7.1 Individual vs Organization Mode
**Location**: `/monay-cross-platform/web/src/components/ModeSelector.tsx`

#### Tasks:
1. Create mode selection UI
2. Add visual differentiation
3. Implement feature toggling
4. Add upgrade prompts
5. Create onboarding flow

### 7.2 Household Features
**Location**: `/monay-cross-platform/web/src/pages/household/`

#### Pages to Create:
- Family member management
- Shared expenses view
- Allowance management
- Family billing view
- Member permissions

### 7.3 Small Business Features
**Location**: `/monay-cross-platform/web/src/pages/business/`

#### Pages to Create:
- Employee wallets
- Invoice management
- Expense tracking
- Multi-location view
- Business analytics

### 7.4 Registration Flow Updates
**Location**: `/monay-cross-platform/web/src/pages/onboarding/`

#### Tasks:
1. Add user type selection
2. Create individual flow
3. Create business flow
4. Add household setup
5. Implement verification

## Phase 8: Mobile Application Updates (Week 10)

### 8.1 iOS Updates
**Location**: `/monay-cross-platform/ios/`

#### Tasks:
1. Add tenant switching
2. Update session management
3. Implement context indicators
4. Add household features
5. Create business mode

### 8.2 Android Updates
**Location**: `/monay-cross-platform/android/`

#### Tasks:
1. Mirror iOS changes
2. Add tenant persistence
3. Update notifications
4. Implement deep linking
5. Add widget support

## Phase 9: Integration & Event Pipeline (Week 11)

### 9.1 Kafka Event Pipeline
**Location**: `/monay-backend-common/src/events/`

#### Components:
```javascript
- billingEventProducer.js
- billingEventConsumer.js
- eventAggregator.js
- eventSchemas.js
- deadLetterQueue.js
```

### 9.2 Redis Cache Updates
**Location**: `/monay-backend-common/src/cache/`

#### Tasks:
1. Add tenant namespacing
2. Implement cache isolation
3. Create tenant-specific TTLs
4. Add cache warming
5. Build invalidation logic

### 9.3 WebSocket Updates
**Location**: `/monay-backend-common/src/sockets/`

#### Tasks:
1. Add tenant rooms
2. Implement broadcast filtering
3. Create group channels
4. Add presence tracking
5. Build notification routing

## Phase 10: Regression Testing for Hybrid Billing (Week 10)

### 10.1 Database Regression Tests
**Purpose**: Verify billing calculations and constraints work correctly

#### Test Scenarios:
```sql
-- Test 1: USDXM discount calculation
SELECT calculate_tenant_billing('tenant-uuid', '2025-01-01'::date);
-- Expected: discount_cents = floor(subtotal * 0.1)

-- Test 2: Gross margin enforcement
INSERT INTO tenants (billing_tier, gross_margin_percent)
VALUES ('small_business', 45); -- Should fail (min 60%)

-- Test 3: Stablecoin-only payments
UPDATE billing_metrics SET payment_method = 'USD'; -- Should fail

-- Test 4: Computation units tracking
INSERT INTO billing_operations (operation_type, computation_units)
VALUES ('smart_contract_deploy', 5000);
-- Verify units are accumulated correctly
```

### 10.2 Service Layer Regression Tests
```javascript
describe('Hybrid Billing Regression Tests', () => {
  test('USDXM discount applies correctly', async () => {
    const bill = await billingService.calculateCurrentBill(tenantId);
    expect(bill.costs.usdxm_discount_cents).toBe(
      Math.floor(bill.costs.total_before_discount_cents * 0.1)
    );
  });

  test('Gross margins enforced by tier', async () => {
    const tenant = await tenantService.createTenant({
      type: 'enterprise',
      billing_tier: 'enterprise'
    });
    expect(tenant.gross_margin_percent).toBeGreaterThanOrEqual(70);
    expect(tenant.gross_margin_percent).toBeLessThanOrEqual(90);
  });

  test('Computation units accumulate correctly', async () => {
    await billingService.trackOperation(tenantId, 'smart_contract_deploy');
    const metrics = await billingService.getTenantMetrics(tenantId);
    expect(metrics.computation_units_used).toBeGreaterThanOrEqual(5000);
  });
});
```

### 10.3 API Regression Tests
```javascript
describe('API Regression Tests', () => {
  test('Payment with USDXM gets discount', async () => {
    const response = await request(app)
      .post('/api/billing/payment')
      .send({
        tenant_id: tenantId,
        amount_cents: 10000,
        payment_method: 'USDXM'
      });
    expect(response.body.discount_applied).toBe(1000); // 10%
    expect(response.body.final_amount).toBe(9000);
  });

  test('Usage tracking with limits', async () => {
    const response = await request(app)
      .get(`/api/billing/usage/${tenantId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.body).toMatchObject({
      transactions: {
        limit: expect.any(Number),
        used: expect.any(Number),
        remaining: expect.any(Number)
      },
      computation_units: {
        limit: expect.any(Number),
        used: expect.any(Number),
        remaining: expect.any(Number)
      }
    });
  });
});
```

### 10.4 Breaking Changes Testing
**Critical areas to test after billing model change:**

1. **Payment Processing**:
   - Old fiat payment methods should be rejected
   - Only stablecoins (USDXM, USDC, USDT) accepted
   - USDXM discount automatic application

2. **Billing Calculations**:
   - Base fee + overages instead of pure usage
   - Computation units instead of granular metrics
   - Monthly aggregation instead of real-time

3. **Margin Enforcement**:
   - Free tier: 0% margin
   - Small business: 60-70% margin
   - Enterprise: 70-90% margin

## Phase 11: Quality Assurance (Week 11)

### 10.1 Unit Tests
**Location**: `/monay-backend-common/tests/unit/`

#### Test Suites:
- Tenant isolation tests
- Billing calculation tests
- Group hierarchy tests
- Wallet derivation tests
- Session management tests

### 10.2 Integration Tests
**Location**: `/monay-backend-common/tests/integration/`

#### Test Scenarios:
- Cross-tenant isolation
- Billing aggregation
- Group operations
- Upgrade paths
- Context switching

### 10.3 End-to-End Tests
**Location**: `/monay-backend-common/tests/e2e/`

#### User Journeys:
- Individual registration
- Business onboarding
- Household creation
- Tenant upgrade
- Cross-context operations

### 10.4 Performance Tests
**Location**: `/monay-backend-common/tests/performance/`

#### Benchmarks:
- 1M concurrent tenants
- 10K TPS per tenant
- <200ms API response
- <1s context switch
- 99.95% uptime

## Phase 11: Migration & Deployment (Week 14)

### 11.1 Data Migration
**Location**: `/monay-backend-common/scripts/migration/`

#### Scripts:
```bash
- migrate-existing-users.js
- assign-tenant-ids.js
- create-default-groups.js
- verify-migration.js
- rollback-migration.js
```

### 11.2 Deployment Strategy

#### Staging Deployment:
1. Deploy database changes
2. Deploy backend services
3. Deploy frontend updates
4. Run integration tests
5. Perform load testing

#### Production Deployment:
1. Blue-green deployment
2. Gradual rollout (5%, 25%, 50%, 100%)
3. Monitor error rates
4. Check performance metrics
5. Verify billing accuracy

### 11.3 Rollback Plan

#### Database Rollback:
```sql
- Backup before migration
- Keep old columns for 30 days
- Dual-write during transition
- Verification queries
- One-click rollback script
```

#### Application Rollback:
- Feature flags for all changes
- Gradual feature enablement
- Quick disable switches
- Previous version standby
- Traffic rerouting capability

## Configuration Changes

### Environment Variables
```bash
# Tenant Configuration
TENANT_ISOLATION_ENABLED=true
DEFAULT_TENANT_TIER=free
MAX_TENANTS_PER_USER=5
TENANT_SWITCHING_ENABLED=true

# Billing Configuration
BILLING_EVENT_TOPIC=billing-events
BILLING_AGGREGATION_INTERVAL=60000
MARGIN_CALCULATION_ENABLED=true
DEFAULT_MARGIN_PERCENT=60

# Group Configuration
MAX_GROUP_MEMBERS=100
HOUSEHOLD_BILLING_AGGREGATION=true
HOLDING_COMPANY_TREASURY=true
GROUP_HIERARCHY_DEPTH=5

# Wallet Configuration
HD_WALLET_ENABLED=true
HSM_INTEGRATION=true
WALLET_DERIVATION_PATH=m/44'/501'
KEY_ROTATION_INTERVAL=90
```

### CORS Updates
```javascript
// monay-backend-common/src/config/cors.js
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000', // Website
      'http://localhost:3002', // Admin
      'http://localhost:3003', // Web App
      'http://localhost:3007', // Enterprise Wallet
      // Add tenant-specific subdomains
      /^https:\/\/[a-z0-9-]+\.monay\.com$/,
    ];
    // ... validation logic
  },
  credentials: true,
  exposedHeaders: ['X-Tenant-Id', 'X-Group-Id', 'X-Context'],
};
```

## Monitoring & Alerts

### Key Metrics to Track
1. **Tenant Metrics**
   - Active tenants count
   - Tenant creation rate
   - Tenant upgrade rate
   - Isolation violations
   - Cross-tenant attempts

2. **Billing Metrics**
   - Event processing rate
   - Margin accuracy
   - Invoice generation time
   - Payment success rate
   - Revenue per tenant

3. **Performance Metrics**
   - API response times by tenant
   - Database query times
   - Cache hit rates
   - WebSocket connections
   - Context switch times

### Alert Thresholds
```yaml
alerts:
  - name: TenantIsolationViolation
    condition: cross_tenant_access > 0
    severity: critical

  - name: BillingCalculationError
    condition: calculation_errors > 10/min
    severity: high

  - name: HighTenantLatency
    condition: p95_latency > 500ms
    severity: medium

  - name: GroupHierarchyDepth
    condition: hierarchy_depth > 10
    severity: low
```

## Documentation Updates

### API Documentation
- Update Swagger/OpenAPI specs
- Add tenant-specific examples
- Document rate limits
- Add authentication flows
- Create migration guide

### Developer Documentation
- Tenant isolation guidelines
- Billing calculation formulas
- Group hierarchy patterns
- Wallet derivation paths
- Testing best practices

### User Documentation
- Individual user guide
- Business user guide
- Household setup guide
- Billing explanation
- Context switching guide

## Risk Mitigation

### Technical Risks
1. **Data Isolation Breach**
   - Mitigation: Cryptographic isolation, RLS, extensive testing

2. **Performance Degradation**
   - Mitigation: Proper indexing, caching, query optimization

3. **Billing Errors**
   - Mitigation: Extensive testing, dual calculation verification

4. **Migration Failures**
   - Mitigation: Incremental migration, rollback procedures

### Business Risks
1. **User Confusion**
   - Mitigation: Clear UI, gradual rollout, user education

2. **Revenue Impact**
   - Mitigation: Careful margin testing, A/B testing

3. **Compliance Issues**
   - Mitigation: Audit trails, compliance testing

## Success Criteria

### Technical Success Metrics
- ✅ 100% tenant isolation verified
- ✅ <200ms API response time (P95)
- ✅ 99.95% system uptime maintained
- ✅ Zero data leakage incidents
- ✅ All tests passing (>90% coverage)

### Business Success Metrics
- ✅ 80% user adoption of new features
- ✅ 20% increase in enterprise signups
- ✅ 15% reduction in support tickets
- ✅ 93% gross margin achieved
- ✅ 30% increase in household groups

## Next Steps

### Immediate Actions (This Week)
1. Review and approve implementation plan
2. Allocate development resources
3. Set up tracking dashboards
4. Create project timeline
5. Begin Phase 1 implementation

### Preparation Tasks
1. Backup production database
2. Set up staging environment
3. Configure monitoring tools
4. Prepare rollback procedures
5. Schedule team training

## Current Implementation Status (Updated: January 23, 2025)

### ✅ Completed Phases (Weeks 1-3)
1. **Database Schema**: All migrations created with hybrid billing model
2. **Backend Services**: Tenant, group, and billing services implemented
3. **Middleware**: Tenant isolation with vault-based security
4. **Billing Model**: Hybrid system with USDXM integration

### 🔄 In Progress (Week 4)
1. **Database Functions**: Creating triggers and procedures
2. **API Routes**: Implementing tenant management endpoints

### ⏳ Remaining Phases (Weeks 5-8)
1. **Frontend Updates**: All three applications need UI updates
2. **Testing**: Comprehensive regression testing
3. **Deployment**: Staged rollout with monitoring

## Key Changes from Original Plan

### Billing Model Revolution
- **FROM**: Complex usage-based billing with hundreds of metrics
- **TO**: Simple hybrid model (base + overages + computation units)
- **BENEFIT**: 70% reduction in billing complexity, easier to understand

### Payment Strategy
- **FROM**: Traditional fiat + crypto options
- **TO**: Stablecoin-only with USDXM preferred (10% discount)
- **BENEFIT**: Lower transaction costs, instant settlement

### Margin Enforcement
- **FROM**: Variable margins without enforcement
- **TO**: Strict 60-80% margins by tier
- **BENEFIT**: Predictable profitability, sustainable growth

## Regression Risk Areas

### High Risk:
1. **Payment Processing**: Existing fiat integrations will break
2. **Billing Calculations**: All billing logic needs rewrite
3. **Customer Migration**: Need to transition payment methods

### Mitigation Strategies:
1. **Dual Processing**: Keep old system running for 30 days
2. **USDXM Incentives**: 10% discount drives adoption
3. **Clear Communication**: Extensive documentation and support

## Next Immediate Steps

### This Week (Phase 4-5):
1. Complete database functions migration
2. Implement API routes with new billing endpoints
3. Begin frontend component updates
4. Set up comprehensive testing environment

### Next Week (Phase 6-7):
1. Complete UI updates for all applications
2. Run full regression test suite
3. Performance optimization
4. Security audit

### Deployment Week (Phase 8):
1. Staging environment validation
2. Production deployment (blue-green)
3. Monitor metrics and rollback if needed
4. Customer communication

## Conclusion

This updated implementation plan reflects the significant improvements made to the billing model while maintaining the robust multi-tenant architecture. The hybrid billing model with USDXM integration provides a simpler, more profitable approach while the vault-based isolation ensures security and scalability.

**Revised Timeline**: 8-10 weeks (reduced from 14)
**Current Progress**: 40% complete (Phases 1-3 done)
**Risk Level**: Medium-High (due to billing changes)
**Expected Benefits**:
- 70% reduction in billing complexity
- 10-15% increase in margins
- 50% reduction in payment processing costs
- 300% ROI in Year 1

---

*Document Version: 2.0*
*Last Updated: January 23, 2025*
*Status: In Implementation - Phase 4*