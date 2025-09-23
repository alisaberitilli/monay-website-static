# 🚀 Monay Master Enhancement Roadmap 2025
## Comprehensive Implementation Plan with Government Benefits Priority

---

## 🔐 IMPORTANT: Authentication & Identity Management
**ALL authentication, authorization, and identity verification features are handled by the Monay-ID service.**
Items marked with ✅ indicate delegation to Monay-ID. See `GENIUS_Act_Auth_Monay_ID.md` for complete auth requirements.

---

## 📅 Executive Timeline Overview
**Total Duration**: 24 Weeks (6 Months)
**Critical Deadline**: July 18, 2025 - GENIUS Act Compliance
**Start Date**: February 1, 2025
**Target Completion**: July 31, 2025

### Quick Reference Timeline
- **Phase 0**: Foundation (Weeks 1-2)
- **Phase 1**: Government Benefits Core (Weeks 3-6)
- **Phase 2**: GENIUS Act Compliance (Weeks 7-10)
- **Phase 3**: Payment Infrastructure (Weeks 11-14)
- **Phase 4**: Enterprise Integration (Weeks 15-18)
- **Phase 5**: Advanced Features (Weeks 19-22)
- **Phase 6**: Testing & Launch (Weeks 23-24)

---

## 🎯 Strategic Priorities
1. **Government Programs** - $1.3T market, regulatory compliance
2. **GENIUS Act Compliance** - Federal requirement by July 18, 2025
3. **Payment Rails Integration** - Foundation for all programs
4. **Enterprise ERP Integration** - B2B expansion
5. **Gig Economy Support** - Leverages same infrastructure

---

# Phase 0: Foundation & Infrastructure
**Duration**: Weeks 1-2
**Status**: ✅ COMPLETED

## Objectives
Establish core infrastructure for all subsequent features

## Implementation Tasks

### Week 1: Core Database & Architecture
- [x] **Hierarchical Organization Structure (ERP Required)** ✅
  - [x] Create organizations table with parent_id for hierarchy ✅
  - [x] Add org_type (holding, subsidiary, division, branch) ✅
  - [x] Implement path_ids array for fast hierarchy queries ✅
  - [x] Add erp_system and uses_subledger configuration ✅
  - [x] Create organization hierarchy view ✅

- [x] **Customer Accounts Architecture (Subledger Support)** ✅
  - [x] Create customer_accounts table for ERP subledgers ✅
  - [x] Support account hierarchy with parent_account_id ✅
  - [x] Add ledger_type (AR, AP, GL, SL) mapping ✅
  - [x] Include GL account codes and cost centers ✅
  - [x] Enable mass billing with billing_group_id ✅

- [x] **Mass Billing Groups** ✅
  - [x] Create billing_groups table for batch processing ✅
  - [x] Add billing_cycle and billing_day configuration ✅
  - [x] Support auto_generate and auto_send options ✅
  - [x] Implement account_selection_criteria in JSONB ✅

- [x] **Core Database Schema** ✅
  - [x] Implement Core + JSONB pattern for flexibility ✅
  - [x] Add multi-tenant support with company codes ✅
  - [x] Create tenants and organizations tables ✅
  - [x] Implement audit_logs table for all changes ✅
  - [x] Add system_settings and feature_flags tables ✅

- [x] **Customer & Verification Schema** ✅
  - [x] Create customers table with verification fields ✅
  - [x] Add verification_logs table ✅
  - [x] Create verification_attempts tracking ✅
  - [x] Add customer_addresses with geocoding ✅
  - [x] Implement customer_communications log ✅

- [x] **Government Benefits Schema** ✅
  - [x] Create beneficiaries master table ✅
  - [x] Add households composition table ✅
  - [x] Create benefit_enrollments table ✅
  - [x] Add benefit_balances tracking ✅
  - [x] Create benefit_transactions table ✅
  - [x] Add program_merchants whitelist ✅
  - [x] Implement eligibility_history tracking ✅

- [x] **Wallet & Card Schema** ✅
  - [x] Create wallets table with types ✅
  - [x] Add cards table with hierarchy ✅
  - [x] Create invoice_wallets linking table ✅
  - [x] Add wallet_transactions table ✅
  - [x] Implement card_authorizations table ✅
  - [x] Create spending_limits configuration ✅
  - [x] Add wallet_balances tracking ✅

- [x] **Invoice & Payment Schema** ✅
  - [x] Create invoices table with ERP sync ✅
  - [x] Add invoice_line_items table ✅
  - [x] Create payment_methods table ✅
  - [x] Add payment_transactions table ✅
  - [x] Implement payment_reconciliation table ✅

- [x] **Subledger Schema Design** ✅
  - [x] Create journal_entries table with debit/credit columns ✅
  - [x] Build chart_of_accounts mapping table ✅
  - [x] Add gl_account_mappings for transaction types ✅
  - [x] Create subledger_transactions tracking table ✅
  - [x] Implement period_closings table ✅
  - [x] Add reconciliation_status tracking ✅
  - [x] Build intercompany_transactions table ✅
  - [x] Create cost_center and profit_center tables ✅

- [x] **Loyalty Program Schema** ✅
  - [x] Create loyalty_programs configuration ✅
  - [x] Add loyalty_accounts per customer ✅
  - [x] Create points_transactions table ✅
  - [x] Add rewards_catalog table ✅
  - [x] Implement redemption_history tracking ✅
  - [x] Create tier_configurations table ✅
  - [x] Add campaign_rules engine table ✅

- [x] **Monay-Fiat Rails Integration** ✅
  - [x] Configure production endpoint (gps.monay.com) ✅
  - [x] Setup QA environment (qaapi.monay.com) ✅
  - [x] Create deposit client (v3 API) ✅
  - [x] Create payout client (v1 API) ✅
  - [x] Implement failover logic ✅

### Week 2: Business Rule Engine & Customer Enhancement
- [x] **BRE Core Framework** ✅
  - [x] Implement MCC restriction framework ✅
  - [x] Add program-specific rule categories ✅
  - [x] Create real-time authorization flow ✅
  - [x] Build velocity limit checks ✅
  - [x] Add balance management rules ✅
  - [x] Create rule versioning system ✅
  - [x] Build rule testing sandbox ✅

- [x] **BRE Rule Population - Federal Programs** ✅
  - [x] SNAP rules (MCC 5411,5422,5441,5451,5499; no alcohol/tobacco) ✅
  - [x] TANF rules (prohibited MCCs, cash limits, time tracking) ✅
  - [x] Medicaid rules (healthcare MCCs only, copay tracking) ✅
  - [x] WIC rules (specific items, vendor restrictions) ✅
  - [x] Veterans benefits (program-specific restrictions) ✅
  - [x] Section 8 rules (landlord-only payments) ✅
  - [x] LIHEAP rules (utility vendor payments only) ✅

- [x] **BRE Rule Population - State/Local Programs** ✅
  - [x] Unemployment Insurance (minimal restrictions, weekly cert) ✅
  - [x] School Choice/ESA (education MCCs, receipt required) ✅
  - [x] Child Care Assistance (provider payments, sliding copay) ✅
  - [x] Transportation assistance (transit/gas MCCs only) ✅
  - [x] Emergency rental assistance (landlord/utility payments) ✅
  - [x] Free/reduced meals (school payments only) ✅
  - [x] EITC advance payments (unrestricted spending) ✅

- [x] **BRE Compliance Rules** ✅
  - [x] Time limit enforcement (TANF 60-month federal) ✅
  - [x] Geographic restrictions (disaster zones) ✅
  - [x] Household composition rules ✅
  - [x] Income eligibility thresholds ✅
  - [x] Work requirement verification ✅
  - [x] Annual recertification triggers ✅
  - [x] Fraud detection patterns ✅

- [x] **Customer Verification System** ✅ (Integration with Monay-ID)
  - [x] Email verification with OTP ✅ (Via Monay-ID)
  - [x] SMS/Phone verification ✅ (Via Monay-ID)
  - [x] Address validation (Google API) ✅ (Via Monay-ID)
  - [x] Progressive verification tracking ✅ (Via Monay-ID)
  - [x] Verification status management ✅ (Via Monay-ID)
  - [x] Annual re-verification workflow ✅ (Via Monay-ID)

- [x] **Communication Layer (Nudge)** ✅
  - [x] Nudge API integration (stateless) ✅
  - [x] Email delivery configuration ✅
  - [x] SMS delivery setup ✅
  - [x] Template management ✅
  - [x] Delivery status webhooks ✅
  - [x] Fallback providers (SendGrid, Twilio) ✅

- [x] **Security Infrastructure** ✅
  - [x] Implement Row-Level Security (RLS) ✅
  - [x] Setup encryption for sensitive data ✅
  - [x] Configure HSM integration ✅
  - [x] Add PII tokenization ✅

### Additional Critical Weeks (25-28): ERP & Industry Verticals

### Week 25: SMB ERP Connectors ✅ COMPLETED
- [x] **QuickBooks Integration** ✅
  - [x] QuickBooks Online REST API ✅
  - [x] QuickBooks Desktop SDK ✅
- [x] **FreshBooks Integration** ✅
  - [x] OAuth 2.0 authentication ✅
  - [x] Invoice/expense sync ✅
  - [x] Time tracking ✅
  - [x] Project management ✅
- [x] **Wave Accounting Integration** ✅
  - [x] GraphQL API integration ✅
  - [x] Customer/invoice sync ✅
  - [x] Transaction tracking ✅
  - [x] Financial reporting ✅
- [x] **Zoho Books Enhancement** ✅
  - [x] Advanced tax management ✅
  - [x] Recurring billing ✅
  - [x] Automation rules ✅
  - [x] Multi-currency support ✅
- [x] **Sage Business Cloud** ✅
  - [x] Full accounting suite ✅
  - [x] Bank reconciliation ✅
  - [x] Payroll integration ✅
  - [x] Tax compliance ✅

- [ ] **Xero Integration**
  - [ ] OAuth 2.0 authentication
  - [ ] Contact management API
  - [ ] Invoice API integration
  - [ ] Bank feed reconciliation

- [ ] **Other SMB Platforms**
  - [ ] FreshBooks connector
  - [ ] Zoho Books integration
  - [ ] Wave Accounting adapter
  - [ ] Sage Business Cloud
  - [ ] Square POS for retail

### Week 26: Banking & Insurance Verticals
- [ ] **Banking Module**
  - [ ] CIF (Customer Information File) management
  - [x] BSA/AML compliance rules ✅ (Via Monay-ID integration)
  - [ ] Sweep account automation
  - [ ] Core banking integration (Fiserv, FIS)

- [ ] **Insurance Module**
  - [ ] Policy administration system
  - [ ] Claims processing workflow
  - [ ] Reserve calculations (IBNR, LAE)
  - [ ] Premium billing cycles

### Week 27: Telecom & Utilities
- [ ] **Telecom Billing**
  - [ ] Usage rating engine
  - [ ] Plan management (rate plans)
  - [ ] Roaming calculations
  - [ ] BAN/MSISDN management

- [ ] **Utilities Billing**
  - [ ] Meter reading integration
  - [ ] Consumption calculation
  - [ ] Tiered pricing support
  - [ ] Budget billing

### Week 28: Gig Economy & Remittance
- [ ] **Gig Platform Integration**
  - [x] Uber/Lyft driver API ✅ (Driver verification via Monay-ID)
  - [x] DoorDash/Instacart shopper ✅ (Shopper verification via Monay-ID)
  - [x] TaskRabbit/Handy Pro ✅ (Tasker verification via Monay-ID)
  - [ ] Stripe Connect/Hyperwallet (Payment processing only)

- [ ] **Remittance Platforms**
  - [ ] MTCN tracking
  - [ ] Corridor management
  - [ ] FX rate integration
  - [ ] Settlement networks

- [ ] **Equipment Leasing**
  - [ ] Lease contract management
  - [ ] Asset lifecycle tracking
  - [ ] Residual value calculation
  - [ ] Payment amortization

## Test Cases - Phase 0

### Customer Verification Tests
```javascript
describe('Customer Verification System', () => {
  test('Progressive verification workflow', async () => {
    const customer = await createCustomer({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890'
    });

    // Initial state - unverified
    expect(customer.email_verified).toBe(false);
    expect(customer.phone_verified).toBe(false);
    expect(customer.address_verified).toBe(false);

    // Email verification via Nudge
    const emailOTP = await sendEmailVerification(customer.id);
    expect(emailOTP.provider).toBe('nudge');
    await verifyEmail(customer.id, emailOTP.code);

    const updatedCustomer = await getCustomer(customer.id);
    expect(updatedCustomer.email_verified).toBe(true);
    expect(updatedCustomer.verification_level).toBe(1);

    // Phone verification
    const smsOTP = await sendSMSVerification(customer.id);
    await verifySMS(customer.id, smsOTP.code);

    // Address verification via Google
    const addressValidation = await validateAddress({
      street: '123 Main St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105'
    });
    expect(addressValidation.standardized).toBeDefined();
    expect(addressValidation.geocode).toHaveProperty('lat');
  });

  test('Nudge communication fallback', async () => {
    // Simulate Nudge failure
    mockNudgeFailure();

    const result = await sendEmail({
      to: 'test@example.com',
      subject: 'Test',
      body: 'Test message'
    });

    // Should fallback to SendGrid
    expect(result.provider).toBe('sendgrid');
    expect(result.delivered).toBe(true);
  });
});
```

### Invoice-First Wallet Tests
```javascript
describe('Invoice-First Wallet Architecture', () => {
  test('Automatic wallet and card creation on invoice', async () => {
    const invoice = await createInvoice({
      amount: 5000,
      customer_id: 'cust_123',
      type: 'one_time'
    });

    // Verify wallet was auto-created
    const wallet = await getWalletByInvoiceId(invoice.id);
    expect(wallet).toBeDefined();
    expect(wallet.mode).toBe('ephemeral');
    expect(wallet.spending_limit).toBe(5000);

    // Verify card was auto-issued
    const cards = await getCardsByWalletId(wallet.id);
    expect(cards).toHaveLength(1);
    expect(cards[0].type).toBe('virtual');
    expect(cards[0].single_use).toBe(true);
    expect(cards[0].spending_limit).toBe(5000);
  });

  test('Enterprise wallet hierarchy with cards', async () => {
    const treasury = await createTreasuryWallet({
      company: 'ACME Corp',
      type: 'enterprise_treasury'
    });

    // Verify role-based cards created
    const treasuryCards = await getCardsByWalletId(treasury.id);
    const cfoCard = treasuryCards.find(c => c.role === 'CFO');
    expect(cfoCard.limit).toBe(1000000);

    // Create department wallet
    const engineering = await createDepartmentWallet({
      parent: treasury.id,
      department: 'Engineering'
    });

    const engCards = await getCardsByWalletId(engineering.id);
    expect(engCards.length).toBeGreaterThan(0);
    expect(engCards[0].limit).toBeLessThan(cfoCard.limit);
  });
});
```

### Database Tests
```javascript
describe('Database Infrastructure', () => {
  test('Multi-tenant data isolation', async () => {
    // Create data for different tenants
    // Verify isolation with RLS
    // Test cross-tenant query prevention
  });

  test('JSONB field flexibility', async () => {
    // Store heterogeneous ERP data
    // Query JSONB fields efficiently
    // Update nested JSONB properties
  });

  test('Audit trail completeness', async () => {
    // Perform CRUD operations
    // Verify audit log entries
    // Test audit log immutability
  });
});
```

### Business Rule Engine Tests
```javascript
describe('BRE Program Rules Population', () => {
  test('SNAP MCC restrictions correctly configured', async () => {
    const snapRules = await getBREProgramRules('SNAP');

    expect(snapRules.allowedMCCs).toEqual([5411, 5422, 5441, 5451, 5499]);
    expect(snapRules.prohibitedItems).toContain('alcohol');
    expect(snapRules.prohibitedItems).toContain('tobacco');
    expect(snapRules.allowCashBack).toBe(false);
    expect(snapRules.allowATM).toBe(false);
  });

  test('All 14 programs have rules populated', async () => {
    const programs = [
      'SNAP', 'TANF', 'MEDICAID', 'WIC', 'SECTION_8', 'LIHEAP',
      'UI', 'SCHOOL_CHOICE', 'CCAP', 'VETERANS', 'TRANSPORT',
      'ERA', 'SCHOOL_MEALS', 'EITC'
    ];

    for (const program of programs) {
      const rules = await getBREProgramRules(program);
      expect(rules).toBeDefined();
      expect(rules.programType).toBe(program);
      expect(rules.restrictions).toBeDefined();
      expect(rules.eligibilityRules).toBeDefined();
    }
  });

  test('Rule validation for conflicting transactions', async () => {
    // Test SNAP transaction at liquor store
    const snapLiquor = await validateTransaction({
      program: 'SNAP',
      mcc: '5921', // Liquor store
      amount: 50
    });
    expect(snapLiquor.valid).toBe(false);
    expect(snapLiquor.reason).toContain('prohibited MCC');

    // Test Section 8 payment to non-landlord
    const section8Invalid = await validateTransaction({
      program: 'SECTION_8',
      recipientType: 'individual',
      amount: 1000
    });
    expect(section8Invalid.valid).toBe(false);
    expect(section8Invalid.reason).toContain('landlord-only');
  });

  test('Time limit enforcement for TANF', async () => {
    const beneficiary = {
      program: 'TANF',
      monthsUsed: 59
    };

    // Should allow at 59 months
    const allowed = await checkTimeLimit(beneficiary);
    expect(allowed.canContinue).toBe(true);
    expect(allowed.monthsRemaining).toBe(1);

    // Should block at 60 months
    beneficiary.monthsUsed = 60;
    const blocked = await checkTimeLimit(beneficiary);
    expect(blocked.canContinue).toBe(false);
    expect(blocked.reason).toContain('60-month federal limit');
  });
});
```

### Monay-Fiat Rails Tests
```javascript
describe('Payment Rails Integration', () => {
  test('Successful deposit via ACH', async () => {
    // Initiate ACH deposit
    // Verify transaction status
    // Check balance update
  });

  test('Failover between rails', async () => {
    // Simulate primary rail failure
    // Verify automatic failover
    // Confirm transaction completion
  });

  test('Real-time authorization <2s', async () => {
    // Submit authorization request
    // Measure response time
    // Verify sub-2 second response
  });
});
```

---

# Phase 1: Government Benefits Core Platform
**Duration**: Weeks 3-6
**Status**: ✅ COMPLETED
**Market Size**: $1.3 Trillion annually

## Objectives
Implement core government benefit programs with spending controls

## Implementation Tasks

### Week 3: Government Benefits Core (All 14 Programs)
- [x] **Database & Models** ✅
  - [x] Create beneficiary tables ✅
  - [x] Add household composition tracking ✅
  - [x] Implement benefit balance management ✅
  - [x] Setup enrollment workflows ✅

- [x] **Services Implemented** ✅
  - [x] benefitEligibilityVerification.js (900 lines) ✅
  - [x] benefitIssuanceWorkflows.js (1,200 lines) ✅
  - [x] benefitBalanceTracker.js (800 lines) ✅
  - [x] benefitTransactionProcessor.js (1,500 lines) ✅

- [x] **Routes Created** ✅
  - [x] governmentBenefits.js endpoints ✅
  - [x] Enrollment, balance, transactions ✅
  - [x] Disbursement and eligibility ✅
  - [x] All 14 programs supported ✅

### Week 4: Compliance & Monitoring
- [x] **MCC Restriction Engine** ✅
  - [x] mccRestrictionEngine.js (1,100 lines) ✅
  - [x] Program-specific MCC controls ✅
  - [x] Category-level restrictions ✅
  - [x] Time and location based rules ✅

- [x] **Monitoring & Detection** ✅
  - [x] transactionMonitoringSystem.js (1,800 lines) ✅
  - [x] fraudDetectionPatterns.js (1,600 lines) ✅
  - [x] complianceReporting.js (1,900 lines) ✅
  - [x] AML/CTR/SAR automation ✅

### Week 5: Self-Service Portal & Cards
- [x] **Portal Implementation** ✅
  - [x] benefitPortal.js routes (700 lines) ✅
  - [x] User dashboard and applications ✅
  - [x] Document management ✅
  - [x] Support ticket system ✅

- [x] **Card & Dashboard Services** ✅
  - [x] benefitCardManagement.js (1,800 lines) ✅
  - [x] benefitReportingDashboards.js (2,000 lines) ✅
  - [x] Digital wallet integration ✅
  - [x] Real-time metrics and reporting ✅

### Week 6: Multi-Language & Mobile
- [x] **Multi-Language Support** ✅
  - [x] multiLanguageSupport.js (1,700 lines) ✅
  - [x] 20 language support ✅
  - [x] All programs translated ✅
  - [x] Real-time translation engine ✅

- [x] **Mobile Optimization** ✅
  - [x] mobileOptimization.js (1,600 lines) ✅
  - [x] iOS/Android optimization ✅
  - [x] Push notifications ✅
  - [x] Biometric authentication ✅

## Test Cases - Phase 1

### SNAP Authorization Tests
```javascript
describe('SNAP Transaction Authorization', () => {
  test('Approve valid grocery purchase', async () => {
    const transaction = {
      amount: 50.00,
      mcc: '5411', // Grocery
      merchant: 'Safeway',
      items: ['milk', 'bread', 'vegetables']
    };
    const result = await authorizeSnapPurchase(transaction);
    expect(result.approved).toBe(true);
  });

  test('Deny alcohol purchase', async () => {
    const transaction = {
      amount: 25.00,
      mcc: '5411',
      items: ['beer', 'wine']
    };
    const result = await authorizeSnapPurchase(transaction);
    expect(result.approved).toBe(false);
    expect(result.reason).toContain('alcohol');
  });

  test('Deny non-food merchant', async () => {
    const transaction = {
      amount: 100.00,
      mcc: '5912', // Drug store
      merchant: 'CVS'
    };
    const result = await authorizeSnapPurchase(transaction);
    expect(result.approved).toBe(false);
  });
});
```

### School Choice Tests
```javascript
describe('School Choice ESA', () => {
  test('Approve tuition payment', async () => {
    const payment = {
      amount: 1000.00,
      vendor: 'Lincoln Elementary',
      category: 'tuition',
      mcc: '8211'
    };
    const result = await authorizeEducationExpense(payment);
    expect(result.approved).toBe(true);
  });

  test('Quarterly spending report', async () => {
    const report = await generateQuarterlyReport(studentId);
    expect(report).toHaveProperty('totalSpent');
    expect(report).toHaveProperty('categorizedExpenses');
    expect(report).toHaveProperty('remainingBalance');
  });
});
```

---

# Phase 2: GENIUS Act Full Compliance
**Duration**: Weeks 7-10
**Status**: 50% COMPLETED (Weeks 7-8 done)
**Deadline**: July 18, 2025

## Objectives
Achieve full GENIUS Act compliance for federal payment processing

## Implementation Tasks

### Week 7: Digital Identity Integration (COMPLETED)
- [x] **Federal Identity Providers** ✅ (Handled by Monay-ID Service)
  - [x] login.gov OAuth integration ✅ (Via Monay-ID)
  - [x] id.me SAML integration ✅ (Via Monay-ID)
  - [x] NIST 800-63 IAL2/AAL2 compliance ✅ (Via Monay-ID)
  - [x] Biometric authentication support ✅ (Via Monay-ID)

- [x] **Identity Verification Flow** ✅ (Handled by Monay-ID Service)
  - [x] Document verification ✅ (Via Monay-ID)
  - [x] Liveness detection ✅ (Via Monay-ID)
  - [x] Identity proofing ✅ (Via Monay-ID)
  - [x] Account linking ✅ (accountLinking.js implemented)

### Week 8: Emergency Disbursement System (COMPLETED)
- [x] **Disaster Response** ✅
  - [x] <4 hour processing SLA ✅ (emergencyDisbursement.js)
  - [x] Geo-targeted disbursements ✅
  - [x] Automated eligibility ✅
  - [x] Bulk processing capability ✅

- [x] **Multi-Channel Notifications** ✅
  - [x] SMS alerts ✅ (multiChannelNotifications.js)
  - [x] Email notifications ✅
  - [x] Push notifications ✅
  - [x] IVR system integration ✅

### Week 9: Instant Settlement Infrastructure ✅ COMPLETED
- [x] **Payment Rails**
  - [x] FedNow integration
  - [x] RTP network connection
  - [x] Same-day ACH setup
  - [x] Prepaid card fallback

- [x] **24/7/365 Availability**
  - [x] Redundant systems
  - [x] Automatic failover
  - [x] Load balancing
  - [x] Disaster recovery

### Week 10: Compliance Certification ✅ COMPLETED
- [x] **Testing & Validation**
  - [x] End-to-end testing
  - [x] Load testing (10,000 TPS)
  - [x] Security audit
  - [x] Compliance review

- [x] **Documentation**
  - [x] API documentation
  - [x] Compliance reports
  - [x] Audit trails
  - [x] Training materials

## Test Cases - Phase 2

### Emergency Disbursement Tests
```javascript
describe('Emergency Disbursement System', () => {
  test('Process disaster payment <4 hours', async () => {
    const start = Date.now();
    const disbursement = await processEmergencyPayment({
      disaster_id: 'FL-2025-001',
      beneficiary_count: 1000,
      amount: 1200
    });
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(4 * 60 * 60 * 1000); // 4 hours
  });

  test('Geo-targeting accuracy', async () => {
    const zone = { lat: 25.7617, lng: -80.1918, radius: 50 }; // Miami
    const eligible = await getEligibleBeneficiaries(zone);
    eligible.forEach(b => {
      expect(calculateDistance(b.location, zone)).toBeLessThan(50);
    });
  });
});
```

### Digital Identity Tests
```javascript
describe('Federal Identity Verification', () => {
  test('login.gov authentication', async () => {
    const result = await authenticateWithLoginGov(testCredentials);
    expect(result.identityAssuranceLevel).toBe('IAL2');
    expect(result.authenticationAssuranceLevel).toBe('AAL2');
  });

  test('Identity verification fallback', async () => {
    // Simulate login.gov failure
    const result = await verifyIdentity(testUser, {
      primaryProvider: 'login.gov',
      fallbackProvider: 'id.me'
    });
    expect(result.provider).toBe('id.me');
    expect(result.verified).toBe(true);
  });
});
```

---

# Phase 3: Payment Infrastructure Enhancement
**Duration**: Weeks 11-14

## Objectives
Complete payment infrastructure for all use cases

## Implementation Tasks

### Week 11: Invoice-First Wallet & Card System ✅ COMPLETED
- [x] **Invoice-First Wallet Architecture**
  - [x] Automatic wallet creation on invoice
  - [x] Ephemeral wallet for one-time payments
  - [x] Persistent wallet for recurring invoices
  - [x] Adaptive wallet with AI routing
  - [x] Wallet-card mandatory pairing
  - [x] Spending limit inheritance from invoice

- [x] **Automatic Card Issuance**
  - [x] Instant virtual card on wallet creation
  - [x] Single-use cards for ephemeral wallets
  - [x] Multi-use cards for persistent wallets
  - [x] Card hierarchy for enterprises
  - [x] Role-based card limits

- [x] **Virtual Card Platform**
  - [x] Instant virtual card issuance
  - [x] Dynamic spending controls
  - [x] Real-time authorization
  - [x] Card lifecycle management
  - [x] MCC-based restrictions

- [x] **Physical Card Program**
  - [x] Card production pipeline
  - [x] PIN management
  - [x] Card activation flow
  - [x] Replacement process
  - [x] Metal card tier for premium

### Week 12: Mobile Wallet Integration ✅ COMPLETED
- [x] **Digital Wallets**
  - [x] Apple Pay provisioning
  - [x] Google Pay provisioning
  - [x] Samsung Pay support
  - [x] QR code payments

- [x] **NFC/Contactless**
  - [x] NFC payment support
  - [x] Contactless ATM
  - [x] Transit payments
  - [x] Merchant acceptance

### Week 13: ATM Network ✅ COMPLETED
- [x] **Cardless ATM**
  - [x] QR code generation
  - [x] One-time PIN system
  - [x] Biometric authentication
  - [x] AllPoint network integration

- [x] **Cash Management**
  - [x] Daily withdrawal limits
  - [x] Balance inquiries
  - [x] Mini statements
  - [x] Fee management

### Week 14: Reconciliation System ✅ COMPLETED
- [x] **Transaction Reconciliation** ✅
  - [x] Real-time settlement ✅
  - [x] Batch reconciliation ✅
  - [x] Dispute management ✅
  - [x] Chargeback handling ✅

- [x] **Financial Reporting** ✅
  - [x] Daily settlement reports ✅
  - [x] Monthly statements ✅
  - [x] Tax reporting ✅
  - [x] Audit reports ✅

## Test Cases - Phase 3

### Card Issuance Tests
```javascript
describe('Card Issuance and Management', () => {
  test('Issue virtual card instantly', async () => {
    const start = Date.now();
    const card = await issueVirtualCard(walletId);
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(5000); // <5 seconds
    expect(card.status).toBe('ACTIVE');
    expect(card.number).toMatch(/^\d{16}$/);
  });

  test('Dynamic spending limit adjustment', async () => {
    await setSpendingLimit(cardId, 500);
    const purchase1 = await authorizeTransaction(cardId, 400);
    expect(purchase1.approved).toBe(true);

    const purchase2 = await authorizeTransaction(cardId, 200);
    expect(purchase2.approved).toBe(false);
    expect(purchase2.reason).toContain('limit exceeded');
  });
});
```

---

# Phase 4: Enterprise Integration
**Duration**: Weeks 15-18

## Objectives
Complete ERP integration with subledger design and B2B capabilities

## Implementation Tasks

### Week 15: Subledger Architecture & SAP Integration ✅ COMPLETED
- [x] **Subledger Design** ✅
  - [x] Create transaction subledger tables ✅
  - [x] Implement double-entry bookkeeping ✅
  - [x] Build journal entry generation ✅
  - [x] Setup chart of accounts mapping ✅
  - [x] Create reconciliation framework ✅
  - [x] Implement audit trail for GL entries ✅

- [x] **SAP Connector** ✅
  - [x] RFC connection setup ✅
  - [x] BAPI integration for GL posting ✅
  - [x] IDoc processing for journals ✅
  - [x] Master data sync ✅
  - [x] Cost center mapping ✅
  - [x] Profit center integration ✅

- [x] **Field Mapping** ✅
  - [x] Customer mapping (KUNNR) ✅
  - [x] Material mapping (MATNR) ✅
  - [x] GL account mapping ✅
  - [x] Cost element mapping ✅
  - [x] Payment terms sync ✅

### Week 16: Oracle/NetSuite with Subledger Sync ✅ COMPLETED
- [x] **Subledger to GL Integration** ✅
  - [x] Real-time journal entry creation ✅
  - [x] Batch GL posting process ✅
  - [x] Multi-currency support ✅
  - [x] Intercompany eliminations ✅
  - [x] Period-end closing entries ✅
  - [x] Deferred revenue recognition ✅

- [x] **Oracle ERP Cloud** ✅
  - [x] REST API integration ✅
  - [x] GL interface tables ✅
  - [x] Subledger accounting events ✅
  - [x] Journal import process ✅
  - [x] Batch imports ✅

- [x] **NetSuite** ✅
  - [x] SuiteTalk API ✅
  - [x] Journal entry creation ✅
  - [x] GL impact tracking ✅
  - [x] Custom fields mapping ✅
  - [x] Subsidiary consolidation ✅

### Week 17: QuickBooks/Xero SMB & Tenant Onboarding ✅ COMPLETED
- [x] **QuickBooks Integration** ✅
  - [x] OAuth 2.0 setup ✅
  - [x] Customer sync ✅
  - [x] Invoice import ✅
  - [x] Payment export ✅

- [x] **Xero Integration** ✅
  - [x] API connection ✅
  - [x] Contact management ✅
  - [x] Bill payments ✅
  - [x] Bank feed setup ✅

- [x] **Tenant Onboarding System** ✅
  - [x] Self-service onboarding portal ✅
  - [x] Organization discovery wizard ✅
  - [x] Automated KYB verification ✅
  - [x] Subscription tier selection ✅
  - [x] Initial configuration setup ✅
  - [x] User provisioning workflow ✅
  - [x] Training resource delivery ✅

### Week 18: Inter-Company Processing & Tenant Management ✅ COMPLETED
- [x] **Holding Company Features** ✅
  - [x] Consolidated reporting ✅
  - [x] Inter-company invoicing ✅
  - [x] Shared customer database ✅
  - [x] Multi-entity reconciliation ✅

- [x] **Tenant Lifecycle Management** ✅
  - [x] Tenant provisioning automation ✅
  - [x] Multi-step onboarding workflow ✅
  - [x] Progressive feature enablement ✅
  - [x] Compliance verification tracking ✅
  - [x] Billing account setup ✅
  - [x] API key generation ✅
  - [x] Sandbox environment creation ✅

## Test Cases - Phase 4

### Tenant Onboarding Tests
```javascript
describe('Tenant Onboarding Process', () => {
  test('Complete enterprise tenant onboarding', async () => {
    const tenantData = {
      companyName: 'ACME Holdings Group',
      type: 'enterprise_group',
      subsidiaries: [
        { name: 'ACME US', code: 'ACME-US-001' },
        { name: 'ACME UK', code: 'ACME-UK-001' }
      ]
    };

    // Step 1: Organization Discovery
    const orgDiscovery = await startOnboarding(tenantData);
    expect(orgDiscovery.status).toBe('organization_discovered');

    // Step 2: KYB Verification
    const kybResult = await performKYB(orgDiscovery.tenantId);
    expect(kybResult.verified).toBe(true);

    // Step 3: ERP Configuration
    const erpConfig = await configureERP({
      tenantId: orgDiscovery.tenantId,
      erpSystem: 'SAP',
      connectionDetails: sapConfig
    });
    expect(erpConfig.connectionTest).toBe('SUCCESS');

    // Step 4: Field Mapping
    const fieldMapping = await setupFieldMapping(orgDiscovery.tenantId);
    expect(fieldMapping.mappedFields).toBeGreaterThan(20);

    // Step 5: Initial Data Import
    const dataImport = await importInitialData(orgDiscovery.tenantId);
    expect(dataImport.customersImported).toBeGreaterThan(0);

    // Step 6: User Provisioning
    const users = await provisionUsers(orgDiscovery.tenantId);
    expect(users.adminUsers).toHaveLength(2);

    // Step 7: Feature Activation
    const features = await activateFeatures(orgDiscovery.tenantId);
    expect(features.governmentBenefits).toBe(true);
  });

  test('Progressive feature enablement', async () => {
    const tenantId = 'test_tenant';

    // Initial features
    const phase1 = await getEnabledFeatures(tenantId, 'phase_1');
    expect(phase1).toEqual(['basic_wallet', 'invoice_creation']);

    // After verification
    await completeVerification(tenantId);
    const phase2 = await getEnabledFeatures(tenantId, 'phase_2');
    expect(phase2).toContain('card_issuance');

    // After compliance
    await completeCompliance(tenantId);
    const phase3 = await getEnabledFeatures(tenantId, 'phase_3');
    expect(phase3).toContain('government_programs');
  });

  test('Multi-tenant data isolation during onboarding', async () => {
    const tenant1 = await createTenant({ name: 'Company A' });
    const tenant2 = await createTenant({ name: 'Company B' });

    // Create test data for tenant1
    await createCustomer({ tenantId: tenant1.id, name: 'Customer 1' });

    // Verify tenant2 cannot access tenant1 data
    const tenant2Customers = await getCustomers(tenant2.id);
    expect(tenant2Customers).toHaveLength(0);

    // Verify data isolation in onboarding steps
    const tenant1Config = await getTenantConfig(tenant1.id);
    const tenant2Config = await getTenantConfig(tenant2.id);
    expect(tenant1Config).not.toEqual(tenant2Config);
  });

  test('Subscription tier limits enforcement', async () => {
    const tenant = await createTenant({
      name: 'Limited Company',
      subscriptionTier: 'starter'
    });

    // Verify transaction limits
    const limits = await getTenantLimits(tenant.id);
    expect(limits.maxTransactionsPerMonth).toBe(1000);
    expect(limits.maxUsers).toBe(10);
    expect(limits.maxWallets).toBe(5);

    // Test limit enforcement
    await expect(createUsers(tenant.id, 15)).rejects.toThrow('User limit exceeded');
  });
});
```

### Subledger Integration Tests
```javascript
describe('Subledger to GL Integration', () => {
  test('Generate journal entries for transactions', async () => {
    // Process a payment transaction
    const transaction = await processPayment({
      amount: 1000,
      type: 'CARD_PURCHASE',
      merchant: 'Amazon',
      program: 'CORPORATE_CARD'
    });

    // Verify journal entry creation
    const journalEntries = await getJournalEntries(transaction.id);

    // Check double-entry bookkeeping
    expect(journalEntries).toHaveLength(2);
    expect(journalEntries[0].debit_amount).toBe(1000);
    expect(journalEntries[1].credit_amount).toBe(1000);

    // Verify GL account mapping
    expect(journalEntries[0].gl_account).toBe('6100'); // Expense
    expect(journalEntries[1].gl_account).toBe('2100'); // Liability

    // Check debits equal credits
    const totalDebits = journalEntries.reduce((sum, e) => sum + (e.debit_amount || 0), 0);
    const totalCredits = journalEntries.reduce((sum, e) => sum + (e.credit_amount || 0), 0);
    expect(totalDebits).toBe(totalCredits);
  });

  test('Batch GL posting to ERP', async () => {
    // Generate batch of journal entries
    const batch = await createJournalBatch({
      period: '2025-02',
      entries: 100
    });

    // Post to SAP
    const postingResult = await postToSAPGL(batch);

    expect(postingResult.status).toBe('SUCCESS');
    expect(postingResult.document_number).toMatch(/^\d{10}$/);
    expect(postingResult.posted_entries).toBe(100);
  });

  test('Multi-currency journal entries', async () => {
    const transaction = await processPayment({
      amount: 1000,
      currency: 'EUR',
      exchange_rate: 1.08,
      base_currency: 'USD'
    });

    const journalEntries = await getJournalEntries(transaction.id);

    // Check currency conversion
    expect(journalEntries[0].amount_currency).toBe(1000);
    expect(journalEntries[0].amount_base).toBe(1080);
    expect(journalEntries[0].currency).toBe('EUR');
    expect(journalEntries[0].exchange_rate).toBe(1.08);
  });

  test('Intercompany elimination entries', async () => {
    // Create intercompany transaction
    const icTransaction = await createIntercompanyInvoice({
      from_company: 'COMPANY_A',
      to_company: 'COMPANY_B',
      amount: 5000
    });

    const eliminations = await generateEliminationEntries(icTransaction);

    // Verify elimination entries balance
    expect(eliminations).toHaveLength(4); // 2 for each company
    expect(eliminations[0].company).toBe('COMPANY_A');
    expect(eliminations[2].company).toBe('COMPANY_B');

    // Check IC accounts used
    expect(eliminations[0].gl_account).toContain('IC'); // Intercompany account
  });

  test('Period-end closing reconciliation', async () => {
    const period = '2025-01';

    // Run period-end close
    const closeResult = await closePeriod(period);

    // Verify all transactions reconciled
    expect(closeResult.unreconciled_count).toBe(0);
    expect(closeResult.journal_entries_posted).toBeGreaterThan(0);

    // Check trial balance
    const trialBalance = await getTrialBalance(period);
    expect(trialBalance.debits_total).toBe(trialBalance.credits_total);

    // Verify GL posting
    expect(closeResult.gl_posting_status).toBe('COMPLETED');
  });
});
```

### ERP Integration Tests
```javascript
describe('SAP Integration', () => {
  test('Bidirectional customer sync', async () => {
    // Create customer in SAP
    const sapCustomer = await createSAPCustomer(testData);

    // Wait for sync
    await waitForSync();

    // Verify in Monay
    const monayCustomer = await findCustomerByERPId(sapCustomer.KUNNR);
    expect(monayCustomer.name).toBe(sapCustomer.NAME1);

    // Update in Monay
    await updateCustomer(monayCustomer.id, { email: 'new@test.com' });

    // Verify update in SAP
    await waitForSync();
    const updated = await getSAPCustomer(sapCustomer.KUNNR);
    expect(updated.EMAIL).toBe('new@test.com');
  });

  test('GL account determination', async () => {
    // Test account determination rules
    const transaction = {
      type: 'EXPENSE',
      category: 'TRAVEL',
      cost_center: 'CC100'
    };

    const glAccount = await determineGLAccount(transaction);

    expect(glAccount.account_number).toBe('6210'); // Travel expense
    expect(glAccount.cost_center).toBe('CC100');
    expect(glAccount.profit_center).toBe('PC001');
  });
});
```

---

# Phase 5: Advanced Features
**Duration**: Weeks 19-23

## Objectives
Implement advanced features and optimizations

## Implementation Tasks

### Week 19: Gig Economy Platform ✅ COMPLETED
- [x] **Driver/Contractor Management** ✅
  - [x] Profile management ✅
  - [x] Document verification ✅
  - [x] Earnings tracking ✅
  - [x] Tax reporting ✅

- [x] **Instant Payouts** ✅
  - [x] Real-time earnings ✅
  - [x] Instant transfer ✅
  - [x] Tip processing ✅
  - [x] Multi-app support ✅

### Week 20: Capital Markets & Securities Trading ✅ COMPLETED
- [x] **Capital Markets Database Schema** ✅
  ```sql
  -- Core rule set tables
  CREATE TABLE capital_markets_rule_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50), -- EQUITY, FIXED_INCOME, PRIVATE_SECURITIES, DERIVATIVES, HYBRID, COMMODITIES
    instrument_type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft', -- draft, validated, deployed, active, suspended
    metadata JSONB DEFAULT '{}',
    deployment_data JSONB DEFAULT '{}', -- contract addresses, gas costs, etc.
    validation_results JSONB,
    created_by UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    deployed_at TIMESTAMP,
    INDEX idx_cm_category (category),
    INDEX idx_cm_status (status)
  );

  -- Rule set items (many-to-many relationship)
  CREATE TABLE capital_markets_rule_set_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_set_id UUID REFERENCES capital_markets_rule_sets(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES business_rules(id),
    priority INTEGER DEFAULT 0,
    configuration JSONB DEFAULT '{}',
    is_required BOOLEAN DEFAULT false,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(rule_set_id, rule_id),
    INDEX idx_cm_rule_set (rule_set_id)
  );

  -- Rule dependencies
  CREATE TABLE capital_markets_rule_dependencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_id UUID REFERENCES business_rules(id),
    depends_on_rule_id UUID REFERENCES business_rules(id),
    dependency_type VARCHAR(50), -- prerequisite, corequisite, exclusive
    UNIQUE(rule_id, depends_on_rule_id)
  );

  -- Deployment records
  CREATE TABLE capital_markets_deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rule_set_id UUID REFERENCES capital_markets_rule_sets(id),
    chain VARCHAR(50), -- base, ethereum, polygon, solana
    network VARCHAR(50), -- mainnet, testnet
    contract_address VARCHAR(255),
    transaction_hash VARCHAR(255),
    block_number BIGINT,
    gas_used BIGINT,
    status VARCHAR(50), -- pending, deployed, verified, failed
    deployment_metadata JSONB,
    deployed_by UUID REFERENCES users(id),
    deployed_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_cm_deploy_chain (chain, network),
    INDEX idx_cm_deploy_status (status)
  );

  -- Trading accounts with capital markets features
  CREATE TABLE capital_markets_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    account_type VARCHAR(50), -- individual, institutional, qib

    -- Investor qualifications
    accredited_investor BOOLEAN DEFAULT false,
    qualified_purchaser BOOLEAN DEFAULT false,
    qib_status BOOLEAN DEFAULT false,
    pattern_day_trader BOOLEAN DEFAULT false,

    -- Trading levels
    options_level INTEGER DEFAULT 0, -- 0-5
    futures_approved BOOLEAN DEFAULT false,
    forex_approved BOOLEAN DEFAULT false,
    crypto_approved BOOLEAN DEFAULT false,

    -- Account balances
    cash_balance DECIMAL(20,2),
    margin_balance DECIMAL(20,2),

    -- Risk metrics
    daily_loss_limit DECIMAL(20,2),
    position_limit DECIMAL(20,2),
    leverage_ratio DECIMAL(5,2),

    -- Compliance
    kyc_status VARCHAR(50),
    aml_risk_score INTEGER,
    last_review_date DATE,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_cm_account_type (account_type),
    INDEX idx_cm_user (user_id)
  );

  -- Securities master data
  CREATE TABLE capital_markets_securities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(50) NOT NULL,
    name VARCHAR(255),
    security_type VARCHAR(50), -- equity, bond, option, future, forex, crypto
    exchange VARCHAR(50),

    -- Trading rules
    lot_size INTEGER DEFAULT 1,
    tick_size DECIMAL(10,4),
    min_price DECIMAL(20,4),
    max_price DECIMAL(20,4),

    -- Settlement
    settlement_days INTEGER, -- T+1, T+2, etc
    settlement_type VARCHAR(50), -- regular, cash, next_day

    -- Restrictions
    restricted BOOLEAN DEFAULT false,
    reg_sho_threshold BOOLEAN DEFAULT false,
    hard_to_borrow BOOLEAN DEFAULT false,

    -- Options specific
    underlying_symbol VARCHAR(50),
    strike_price DECIMAL(20,4),
    expiration_date DATE,
    option_type VARCHAR(10), -- call, put

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(symbol, exchange),
    INDEX idx_cm_security_type (security_type)
  );

  -- Trading orders
  CREATE TABLE capital_markets_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES capital_markets_accounts(id),
    security_id UUID REFERENCES capital_markets_securities(id),

    -- Order details
    order_type VARCHAR(50), -- market, limit, stop, stop_limit
    side VARCHAR(10), -- buy, sell, sell_short
    quantity DECIMAL(20,4),
    price DECIMAL(20,4),
    stop_price DECIMAL(20,4),

    -- Execution
    status VARCHAR(50), -- pending, partial, filled, cancelled, rejected
    filled_quantity DECIMAL(20,4) DEFAULT 0,
    average_price DECIMAL(20,4),

    -- Compliance
    compliance_checks JSONB DEFAULT '{}',
    rejection_reason TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    executed_at TIMESTAMP,
    cancelled_at TIMESTAMP,

    INDEX idx_cm_order_status (status),
    INDEX idx_cm_order_account (account_id),
    INDEX idx_cm_order_time (created_at DESC)
  );

  -- Positions
  CREATE TABLE capital_markets_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    account_id UUID REFERENCES capital_markets_accounts(id),
    security_id UUID REFERENCES capital_markets_securities(id),

    quantity DECIMAL(20,4),
    average_cost DECIMAL(20,4),
    market_value DECIMAL(20,2),
    unrealized_pnl DECIMAL(20,2),
    realized_pnl DECIMAL(20,2),

    -- Margin
    margin_requirement DECIMAL(20,2),
    maintenance_margin DECIMAL(20,2),

    -- Lock-up
    lock_up_until DATE,
    restriction_type VARCHAR(50),

    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(account_id, security_id),
    INDEX idx_cm_position_account (account_id)
  );

  -- Market data
  CREATE TABLE capital_markets_market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    security_id UUID REFERENCES capital_markets_securities(id),

    -- Pricing
    bid_price DECIMAL(20,4),
    ask_price DECIMAL(20,4),
    last_price DECIMAL(20,4),
    previous_close DECIMAL(20,4),

    -- Volume
    volume BIGINT,
    average_volume_30d BIGINT,

    -- Halts
    halted BOOLEAN DEFAULT false,
    halt_reason VARCHAR(100),
    halt_time TIMESTAMP,

    -- Circuit breakers
    circuit_breaker_level INTEGER,
    ssr_triggered BOOLEAN DEFAULT false,

    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_cm_market_security (security_id),
    INDEX idx_cm_market_time (updated_at DESC)
  );

  -- Audit trail
  CREATE TABLE capital_markets_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50), -- order, position, account, rule_set
    entity_id UUID,
    action VARCHAR(50), -- create, update, execute, cancel, deploy

    -- Changes
    old_value JSONB,
    new_value JSONB,

    -- Context
    user_id UUID REFERENCES users(id),
    ip_address INET,
    user_agent TEXT,

    -- Compliance
    compliance_flags JSONB,
    risk_score INTEGER,

    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_cm_audit_entity (entity_type, entity_id),
    INDEX idx_cm_audit_time (created_at DESC),
    INDEX idx_cm_audit_user (user_id)
  );
  ```

- [x] **Capital Markets Infrastructure** ✅
  - [x] Complete rule_sets database tables ✅
  - [x] Create rule_set_items table ✅
  - [x] Add rule_dependencies table ✅
  - [x] Implement rule dependency resolver ✅
  - [x] Build multi-rule deployment system ✅
  - [x] Add rule versioning system ✅

- [x] **BRE Capital Markets Rules Population** ✅
  - [x] Equity trading rules (accredited investor, trading hours) ✅
  - [x] Pattern day trader rules ($25K minimum) ✅
  - [x] Reg T margin requirements (50%) ✅
  - [x] Short sale restrictions (SSR) ✅
  - [x] Fixed income rules (QIB checks, T+1/T+2 settlement) ✅
  - [x] Private securities (Reg D 506b/506c compliance) ✅
  - [x] Lock-up period enforcement ✅
  - [x] Transfer restrictions ✅
  - [x] Derivatives rules (options, futures, swaps) ✅
  - [x] Position limits and margin requirements ✅

- [x] **Capital Markets Templates** ✅
  - [x] Complete equity trading template ✅
  - [x] Fixed income securities template ✅
  - [x] Private placement template (Reg D) ✅
  - [x] Derivatives trading template ✅
  - [x] Commodities trading template ✅
  - [x] Foreign exchange template ✅
  - [x] Crypto securities template ✅

- [x] **Regulatory Compliance Rules** ✅
  - [x] SEC Rule 144 (restricted securities) ✅
  - [x] Reg SHO (short selling) ✅
  - [x] FINRA rules integration ✅
  - [x] Know Your Customer (KYC) for securities ✅ (Via Monay-ID)
  - [x] Anti-money laundering (AML) for trading ✅ (Via Monay-ID)
  - [x] Market manipulation detection ✅
  - [x] Insider trading prevention ✅

- [ ] **Capital Markets API Endpoints**
  - [ ] POST /api/capital-markets/rule-sets - Create rule set
  - [ ] GET /api/capital-markets/rule-sets/:id - Get rule set
  - [ ] PUT /api/capital-markets/rule-sets/:id - Update rule set
  - [ ] POST /api/capital-markets/rule-sets/:id/validate - Validate rule set
  - [ ] POST /api/capital-markets/rule-sets/:id/deploy - Deploy to blockchain
  - [ ] GET /api/capital-markets/templates - List templates
  - [ ] POST /api/capital-markets/templates/:id/apply - Apply template
  - [ ] GET /api/capital-markets/deployments/:id/status - Check deployment status

- [ ] **Capital Markets UI Components**
  - [ ] Rule set creation wizard
  - [ ] Template selection interface
  - [ ] Rule dependency visualization
  - [ ] Validation results display
  - [ ] Deployment progress tracker
  - [ ] Multi-chain deployment selector
  - [ ] Gas estimation calculator
  - [ ] Contract verification status

- [ ] **Multi-Chain Integration**
  - [ ] Base L2 deployment contract
  - [ ] Ethereum mainnet integration
  - [ ] Polygon zkEVM adapter
  - [ ] Solana program deployment
  - [ ] Cross-chain rule synchronization
  - [ ] Gas optimization strategies
  - [ ] Contract verification automation

### Week 21: Invoice Financing & Trade Finance ✅ COMPLETED
- [x] **Invoice Factoring** ✅
  - [x] Credit assessment ✅
  - [x] Advance calculation ✅
  - [x] Collection management ✅
  - [x] Fee structure ✅

- [x] **Supply Chain Finance** ✅
  - [x] Early payment discounts ✅
  - [x] Dynamic discounting ✅
  - [x] Vendor financing ✅
  - [x] PO financing ✅

- [x] **Trade Finance Operations** ✅
  - [x] Letter of Credit issuance ✅
  - [x] Bank guarantees ✅
  - [x] Export financing ✅
  - [x] SWIFT message generation ✅
  - [x] Document verification ✅

- [x] **Invoice Verification System** ✅
  - [x] OCR document processing ✅
  - [x] Fraud detection ✅
  - [x] Duplicate checking ✅
  - [x] Risk scoring ✅

### Week 21: Analytics & Reporting
- [ ] **Real-time Analytics**
  - [ ] Transaction analytics
  - [ ] Program metrics
  - [ ] Fraud detection
  - [ ] Performance monitoring

- [ ] **Compliance Reporting**
  - [ ] Regulatory reports
  - [ ] Audit trails
  - [x] KYC/AML reports ✅ (Via Monay-ID integration)
  - [ ] Tax reporting

### Week 22: Loyalty Program ✅ COMPLETED
- [x] **Enterprise-to-Consumer Loyalty Program**
  - [x] Loyalty program creation wizard
  - [x] Points earning rules engine
  - [x] Multi-tier membership system
  - [x] Rewards catalog management
  - [x] Redemption processing
  - [x] Partner merchant network
  - [x] Cross-promotion campaigns
  - [x] Referral bonus system

- [x] **Loyalty Program Features**
  - [x] Automatic points accrual on transactions
  - [x] Tier-based earning multipliers
  - [x] Special event bonuses
  - [x] Points transfer between users
  - [x] Points-to-cash conversion
  - [x] Charity donation options
  - [x] Gamification elements
  - [x] Achievement badges

- [ ] **Enterprise Loyalty Management**
  - [ ] Campaign creation from enterprise wallet
  - [ ] Budget allocation and tracking
  - [ ] ROI analytics dashboard
  - [ ] Customer segmentation
  - [ ] Targeted offers
  - [ ] A/B testing framework
  - [ ] Performance metrics
  - [ ] Loyalty fraud prevention

### Week 23: AI/ML Features ✅ COMPLETED
- [x] **Fraud Detection System**
  - [x] Real-time anomaly detection
  - [x] Transaction pattern recognition
  - [x] Risk scoring engine
  - [x] Behavioral analysis
  - [x] Device fingerprinting
  - [x] Velocity checking
  - [x] Geographic anomaly detection
  - [x] Network analysis

- [x] **Machine Learning Models**
  - [x] Fraud prediction model
  - [x] Customer lifetime value
  - [x] Churn prediction
  - [x] Credit risk assessment
  - [x] Transaction categorization
  - [x] Merchant risk scoring

- [x] **Predictive Analytics**
  - [x] Spending predictions
  - [x] Eligibility forecasting
  - [x] Demand planning
  - [x] Cash flow forecasting
  - [x] Loyalty engagement scoring
  - [x] Benefit utilization prediction

- [x] **AI-Powered Features**
  - [x] Intelligent routing (best payment rail)
  - [x] Smart notifications
  - [x] Automated customer support
  - [x] Personalized recommendations
  - [x] Dynamic pricing
  - [x] Automated compliance monitoring

### Week 20: Capital Markets Test Cases

#### Equity Trading Tests
```javascript
describe('Equity Trading Rules', () => {
  test('Pattern Day Trader Rule - $25K minimum', async () => {
    const account = {
      balance: 20000,
      dayTrades: 4,
      period: '5 business days'
    };

    const result = await checkPatternDayTrader(account);
    expect(result.blocked).toBe(true);
    expect(result.reason).toContain('Minimum $25,000 required');
  });

  test('Trading hours restriction', async () => {
    const order = {
      type: 'market_order',
      symbol: 'AAPL',
      timestamp: '2025-01-21T20:00:00Z' // After hours
    };

    const result = await validateTradingHours(order);
    expect(result.allowed).toBe(false);
    expect(result.extendedHours).toBe(true);
  });

  test('Accredited investor verification', async () => {
    const investor = {
      income: 150000,
      netWorth: 500000,
      accreditedStatus: null
    };

    const result = await verifyAccreditedStatus(investor);
    expect(result.qualified).toBe(false);
    expect(result.requiresIncome).toBe(200000);
  });
});
```

#### Fixed Income Tests
```javascript
describe('Fixed Income Trading', () => {
  test('QIB (Qualified Institutional Buyer) verification', async () => {
    const buyer = {
      type: 'individual',
      investableAssets: 5000000
    };

    const result = await checkQIBStatus(buyer);
    expect(result.isQIB).toBe(false);
    expect(result.minimumRequired).toBe(100000000);
  });

  test('T+2 settlement calculation', async () => {
    const trade = {
      tradeDate: '2025-01-21',
      securityType: 'corporate_bond'
    };

    const settlement = await calculateSettlement(trade);
    expect(settlement.date).toBe('2025-01-23');
    expect(settlement.type).toBe('T+2');
  });

  test('144A private placement restriction', async () => {
    const transaction = {
      security: '144A_BOND',
      buyer: { type: 'retail', isQIB: false }
    };

    const result = await validate144ATransaction(transaction);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('144A securities restricted to QIBs');
  });
});
```

#### Derivatives Tests
```javascript
describe('Derivatives Trading', () => {
  test('Options level approval', async () => {
    const account = {
      experience: 'beginner',
      riskTolerance: 'conservative',
      requestedLevel: 4
    };

    const approval = await evaluateOptionsLevel(account);
    expect(approval.approvedLevel).toBe(1);
    expect(approval.restrictions).toContain('covered calls only');
  });

  test('Futures margin requirements', async () => {
    const position = {
      contract: 'ES', // E-mini S&P 500
      contracts: 10,
      accountBalance: 50000
    };

    const margin = await calculateFuturesMargin(position);
    expect(margin.initialMargin).toBe(143000);
    expect(margin.sufficient).toBe(false);
    expect(margin.shortfall).toBe(93000);
  });

  test('Position limits enforcement', async () => {
    const position = {
      symbol: 'CL', // Crude Oil
      currentContracts: 2000,
      additionalContracts: 1500
    };

    const result = await checkPositionLimits(position);
    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(3000);
    expect(result.wouldExceedBy).toBe(500);
  });
});
```

#### Private Securities Tests
```javascript
describe('Private Securities (Reg D)', () => {
  test('Lock-up period enforcement', async () => {
    const holding = {
      security: 'PRIVATE_EQUITY_A',
      purchaseDate: '2024-07-21',
      lockupPeriod: 365,
      sellRequest: '2025-01-21'
    };

    const result = await validateLockup(holding);
    expect(result.inLockup).toBe(true);
    expect(result.daysRemaining).toBe(180);
    expect(result.unlockDate).toBe('2025-07-21');
  });

  test('Transfer restriction validation', async () => {
    const transfer = {
      security: 'REG_D_506C',
      from: { accredited: true },
      to: { accredited: false }
    };

    const result = await validateTransfer(transfer);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Recipient must be accredited investor');
  });

  test('Maximum investors limit (506b)', async () => {
    const offering = {
      type: '506b',
      currentInvestors: { accredited: 30, nonAccredited: 35 },
      newInvestor: { accredited: false }
    };

    const result = await validateInvestorLimit(offering);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('Maximum 35 non-accredited investors');
  });
});
```

#### Market Manipulation Tests
```javascript
describe('Market Manipulation Detection', () => {
  test('Wash trading detection', async () => {
    const trades = [
      { symbol: 'XYZ', side: 'buy', quantity: 1000, time: '09:30:00' },
      { symbol: 'XYZ', side: 'sell', quantity: 1000, time: '09:30:15' },
      { symbol: 'XYZ', side: 'buy', quantity: 1000, time: '09:30:30' }
    ];

    const result = await detectWashTrading(trades);
    expect(result.suspicious).toBe(true);
    expect(result.pattern).toBe('rapid_buy_sell_cycle');
    expect(result.flagForReview).toBe(true);
  });

  test('Spoofing detection', async () => {
    const orders = [
      { side: 'sell', quantity: 10000, price: 100.10, cancelled: true },
      { side: 'sell', quantity: 15000, price: 100.15, cancelled: true },
      { side: 'buy', quantity: 100, price: 99.90, executed: true }
    ];

    const result = await detectSpoofing(orders);
    expect(result.suspicious).toBe(true);
    expect(result.pattern).toBe('large_cancelled_orders');
  });

  test('Insider trading alert', async () => {
    const trade = {
      trader: 'executive_officer',
      company: 'ABC_CORP',
      tradeDate: '2025-01-20',
      earningsDate: '2025-01-22'
    };

    const result = await checkInsiderTrading(trade);
    expect(result.blackoutPeriod).toBe(true);
    expect(result.requiresPreClearance).toBe(true);
    expect(result.blocked).toBe(true);
  });
});
```

#### Regulatory Compliance Tests
```javascript
describe('Regulatory Compliance', () => {
  test('SEC Rule 144 volume limits', async () => {
    const sale = {
      security: 'RESTRICTED_STOCK',
      shares: 50000,
      averageDailyVolume: 1000000,
      outstandingShares: 100000000
    };

    const result = await validateRule144(sale);
    expect(result.volumeLimit).toBe(10000); // 1% of ADV
    expect(result.allowed).toBe(false);
    expect(result.excessShares).toBe(40000);
  });

  test('Reg SHO short sale restrictions', async () => {
    const order = {
      type: 'short_sell',
      symbol: 'ABC',
      priceDecline: 0.12, // 12% decline triggers SSR
    };

    const result = await checkRegSHO(order);
    expect(result.ssrTriggered).toBe(true);
    expect(result.uptickRequired).toBe(true);
    expect(result.restrictionExpiry).toMatch(/T\+1/);
  });

  test('FINRA 4210 margin requirements', async () => {
    const account = {
      equity: 25000,
      marginDebt: 20000,
      positions: 50000
    };

    const result = await calculateMaintenanceMargin(account);
    expect(result.required).toBe(12500); // 25% of positions
    expect(result.excess).toBe(12500);
    expect(result.callRequired).toBe(false);
  });
});
```

#### Capital Markets BRE Integration Tests
```javascript
describe('BRE Capital Markets Integration', () => {
  test('Multi-rule evaluation for complex trade', async () => {
    const trade = {
      type: 'complex_option_spread',
      legs: 4,
      accountType: 'retail',
      experience: 'intermediate',
      balance: 75000
    };

    const rules = await breEngine.evaluateCapitalMarkets(trade);
    expect(rules.evaluated).toContain('options_level');
    expect(rules.evaluated).toContain('margin_requirements');
    expect(rules.evaluated).toContain('pattern_day_trader');
    expect(rules.passed).toBe(false);
    expect(rules.failedRules).toContain('insufficient_options_level');
  });

  test('Template-based rule application', async () => {
    const template = 'equity_trading';
    const account = { type: 'individual', balance: 30000 };

    const rules = await breEngine.applyTemplate(template, account);
    expect(rules.appliedRules.length).toBeGreaterThan(10);
    expect(rules.includes).toContain('pattern_day_trader');
    expect(rules.includes).toContain('reg_t_margin');
  });

  test('Real-time halt detection', async () => {
    const order = {
      symbol: 'XYZ',
      timestamp: new Date()
    };

    const status = await checkTradingHalt(order);
    if (status.halted) {
      expect(status.reason).toBeDefined();
      expect(status.resumeTime).toBeDefined();
      expect(status.code).toMatch(/T1|T2|T5|T6|T8|T12|H10|H11/);
    }
  });
});
```

## Test Cases - Phase 5

### AI/ML Features Tests
```javascript
describe('AI/ML Fraud Detection', () => {
  test('Real-time fraud detection on transaction', async () => {
    const suspiciousTransaction = {
      amount: 10000,
      location: 'Nigeria', // Different from user's usual location
      merchant: 'Unknown Merchant',
      time: '03:00 AM',
      device: 'new_device_id'
    };

    const riskScore = await evaluateFraudRisk(suspiciousTransaction);

    expect(riskScore.score).toBeGreaterThan(0.7); // High risk
    expect(riskScore.factors).toContain('unusual_location');
    expect(riskScore.factors).toContain('unusual_time');
    expect(riskScore.factors).toContain('new_device');
    expect(riskScore.recommendation).toBe('DECLINE');
  });

  test('Behavioral analysis pattern detection', async () => {
    const userHistory = await getUserTransactionHistory('user_123');
    const baseline = await buildBehavioralBaseline(userHistory);

    const newTransaction = {
      amount: 50,
      merchant: 'Starbucks',
      time: '08:00 AM'
    };

    const behaviorScore = await analyzeBehavior(newTransaction, baseline);

    expect(behaviorScore.isNormal).toBe(true);
    expect(behaviorScore.deviation).toBeLessThan(0.2);
  });

  test('Churn prediction model', async () => {
    const customer = await getCustomer('cust_456');
    const features = await extractCustomerFeatures(customer);

    const churnPrediction = await predictChurn(features);

    expect(churnPrediction.probability).toBeDefined();
    expect(churnPrediction.riskFactors).toBeInstanceOf(Array);

    if (churnPrediction.probability > 0.6) {
      const retention = await generateRetentionOffer(customer);
      expect(retention.offer).toBeDefined();
    }
  });

  test('Intelligent payment rail routing', async () => {
    const payment = {
      amount: 1000,
      urgency: 'high',
      destination: 'domestic',
      time: new Date()
    };

    const route = await intelligentRouting(payment);

    // Should choose FedNow for urgent domestic
    expect(route.rail).toBe('FedNow');
    expect(route.estimatedTime).toBeLessThan(30);
    expect(route.cost).toBeDefined();
    expect(route.successProbability).toBeGreaterThan(0.95);
  });
});
```

### Loyalty Program Tests
```javascript
describe('Enterprise Loyalty Program', () => {
  test('Create loyalty program from enterprise wallet', async () => {
    const enterprise = await getEnterpriseWallet('ACME_CORP');

    const loyaltyProgram = await createLoyaltyProgram({
      createdBy: enterprise.id,
      name: 'ACME Rewards',
      tiers: [
        { name: 'Bronze', threshold: 0, multiplier: 1.0 },
        { name: 'Silver', threshold: 1000, multiplier: 1.5 },
        { name: 'Gold', threshold: 5000, multiplier: 2.0 },
        { name: 'Platinum', threshold: 10000, multiplier: 3.0 }
      ],
      earningRules: {
        base: 1, // 1 point per dollar
        categories: {
          'electronics': 2,
          'travel': 3
        }
      }
    });

    expect(loyaltyProgram.status).toBe('active');
    expect(loyaltyProgram.tiers).toHaveLength(4);
  });

  test('Automatic points accrual on transaction', async () => {
    const consumer = await getConsumerWallet('user_123');
    const initialPoints = await getLoyaltyBalance(consumer.id);

    // Make purchase
    const transaction = await processPayment({
      wallet: consumer.id,
      amount: 100,
      merchant: 'ACME Store',
      category: 'electronics'
    });

    const newPoints = await getLoyaltyBalance(consumer.id);

    // Should earn 2x for electronics category
    expect(newPoints - initialPoints).toBe(200);

    // Check tier upgrade
    const account = await getLoyaltyAccount(consumer.id);
    if (newPoints >= 1000) {
      expect(account.tier).toBe('Silver');
    }
  });

  test('Points redemption for rewards', async () => {
    const consumer = await getConsumerWallet('user_123');
    await creditLoyaltyPoints(consumer.id, 500);

    const reward = await redeemReward({
      wallet: consumer.id,
      rewardId: 'reward_gift_card_50',
      pointsCost: 500
    });

    expect(reward.status).toBe('fulfilled');
    expect(reward.giftCard).toBeDefined();

    const balance = await getLoyaltyBalance(consumer.id);
    expect(balance).toBe(0);
  });

  test('Campaign ROI tracking', async () => {
    const campaign = await createLoyaltyCampaign({
      name: 'Double Points Weekend',
      multiplier: 2,
      budget: 10000,
      startDate: '2025-03-01',
      endDate: '2025-03-03'
    });

    // Simulate transactions during campaign
    await simulateCampaignActivity(campaign.id);

    const metrics = await getCampaignMetrics(campaign.id);

    expect(metrics.pointsIssued).toBeLessThanOrEqual(10000);
    expect(metrics.incrementalRevenue).toBeDefined();
    expect(metrics.roi).toBeGreaterThan(1.0); // Positive ROI
    expect(metrics.participationRate).toBeGreaterThan(0.1);
  });
});
```

---

# Phase 6: Testing, Security & Launch
**Duration**: Week 24

## Objectives
Complete testing, security audit, and production launch

## Implementation Tasks

### Week 24: Testing, Security & Production Launch
- [ ] **Comprehensive Testing**
  - [ ] End-to-end integration testing
  - [ ] Cross-system validation
  - [ ] Data integrity verification
  - [ ] Error handling scenarios
  - [ ] Load testing (10,000 TPS)
  - [ ] Stress testing
  - [ ] Security penetration testing
  - [ ] Vulnerability scanning

- [ ] **Security Audit**
  - [ ] Code security review
  - [ ] Compliance validation
  - [ ] GENIUS Act certification
  - [ ] PCI-DSS compliance check
  - [ ] SOC 2 readiness

- [ ] **Production Deployment**
- [ ] **Deployment**
  - [ ] Production setup
  - [ ] Data migration
  - [ ] DNS configuration
  - [ ] SSL certificates

- [ ] **Monitoring**
  - [ ] APM setup
  - [ ] Log aggregation
  - [ ] Alert configuration
  - [ ] Dashboard creation

- [ ] **Documentation**
  - [ ] User guides
  - [ ] API documentation
  - [ ] Admin manual
  - [ ] Troubleshooting guide

## Test Cases - Phase 6

### Load Testing Scenarios
```javascript
describe('System Load Testing', () => {
  test('Handle 10,000 TPS', async () => {
    const results = await loadTest({
      duration: 60, // seconds
      targetTPS: 10000,
      scenario: 'mixed_transactions'
    });

    expect(results.actualTPS).toBeGreaterThan(9500);
    expect(results.p95ResponseTime).toBeLessThan(200);
    expect(results.errorRate).toBeLessThan(0.01);
  });

  test('Sustain peak load 24 hours', async () => {
    const results = await enduranceTest({
      duration: 24 * 60 * 60, // 24 hours
      targetTPS: 5000
    });

    expect(results.memoryLeaks).toBe(false);
    expect(results.degradation).toBe(false);
    expect(results.uptime).toBe(100);
  });
});
```

### Security Tests
```javascript
describe('Security Validation', () => {
  test('SQL injection prevention', async () => {
    const attacks = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--"
    ];

    for (const attack of attacks) {
      const result = await attemptLogin(attack, 'password');
      expect(result.success).toBe(false);
      expect(result.error).not.toContain('SQL');
    }
  });

  test('PII encryption at rest', async () => {
    const customer = await createCustomer(testData);
    const rawData = await queryDatabase(
      `SELECT ssn FROM customers WHERE id = '${customer.id}'`
    );

    expect(rawData.ssn).not.toBe(testData.ssn);
    expect(rawData.ssn).toMatch(/^encrypted:/);
  });
});
```

---

## 📊 Success Metrics

### Technical Metrics
- [ ] 99.99% uptime achieved
- [ ] <30 second emergency settlements
- [ ] <2 second authorization response
- [ ] 10,000 TPS sustained load
- [ ] Zero data breaches
- [ ] 100% GENIUS Act compliance

### Business Metrics
- [ ] 1M+ government beneficiaries onboarded
- [ ] $1B+ monthly transaction volume
- [ ] 50+ enterprise customers
- [ ] 10+ state contracts
- [ ] 3+ federal agency partnerships

### Compliance Metrics
- [ ] GENIUS Act certification obtained
- [ ] PCI-DSS Level 1 certified
- [ ] SOC 2 Type II completed
- [ ] NIST 800-63 compliant
- [ ] State money transmission licenses obtained

---

## 🚨 Risk Mitigation

### High Risk Items
1. **GENIUS Act Deadline (July 18, 2025)**
   - Mitigation: Prioritize government features
   - Contingency: Phased rollout by agency

2. **Payment Rail Integration Complexity**
   - Mitigation: Early Monay-Fiat Rails testing
   - Contingency: Fallback to single rail initially

3. **Regulatory Compliance**
   - Mitigation: Early legal review
   - Contingency: State-by-state rollout

4. **Performance at Scale**
   - Mitigation: Continuous load testing
   - Contingency: Auto-scaling infrastructure

---

## 📚 Documentation Requirements

### Technical Documentation
- [ ] System architecture diagrams
- [ ] API reference documentation
- [ ] Database schema documentation
- [ ] Integration guides for each ERP
- [ ] Security implementation guide

### Operational Documentation
- [ ] Deployment procedures
- [ ] Monitoring and alerting guide
- [ ] Incident response playbook
- [ ] Disaster recovery plan
- [ ] Backup and restore procedures

### User Documentation
- [ ] Government agency onboarding guide
- [ ] Beneficiary user manual
- [ ] Enterprise integration guide
- [ ] Mobile app user guide
- [ ] FAQ and troubleshooting

---

## 🔄 Continuous Improvement

### Post-Launch Phases (After Week 24)

#### Phase 7: Optimization (Weeks 25-28)
- Performance tuning based on production metrics
- User experience improvements
- Cost optimization
- Feature refinements

#### Phase 8: Expansion (Weeks 29-32)
- International payment support
- Additional government programs
- More ERP integrations
- Advanced analytics features

#### Phase 9: Innovation (Weeks 33-36)
- Blockchain integration for transparency
- AI-powered fraud prevention
- Predictive benefit allocation
- Voice-enabled transactions

---

## 🪙 Phase 10: Stablecoin & Digital Currency Integration
**Duration**: Weeks 29-32
**Priority**: HIGH - Critical for modernizing government benefits

### Objectives
Enable government benefits disbursement and merchant payments via stablecoins and digital currencies while maintaining compliance and instant settlement capabilities.

### Implementation Tasks

#### Week 29: Stablecoin Infrastructure
- [ ] **Dual-Rail Blockchain Integration**
  - [ ] Implement EVM L2 (Base/Polygon zkEVM) for enterprise stablecoins
  - [ ] Deploy Solana integration for consumer payments
  - [ ] Create cross-rail bridge for seamless value movement
  - [ ] Implement treasury swap model for liquidity

- [ ] **Smart Contract Development**
  - [ ] Deploy ERC-3643 compliant stablecoin contracts
  - [ ] Implement Token-2022 extensions on Solana
  - [ ] Create multi-signature treasury contracts
  - [ ] Add programmable compliance rules in contracts

#### Week 30: Government Benefits Stablecoin Support
- [ ] **Benefit Disbursement in Stablecoins**
  - [ ] Modify benefit_disbursements table for crypto rails
  - [ ] Add wallet_address field to government_benefits
  - [ ] Implement USDC/USDT disbursement options
  - [ ] Create instant settlement via stablecoins
  - [ ] Add blockchain transaction tracking

- [ ] **Program-Specific Stablecoin Rules**
  - [ ] Implement SNAP stablecoin spending restrictions
  - [ ] Add WIC approved vendor smart contracts
  - [ ] Create TANF withdrawal limits in stablecoins
  - [ ] Implement School Choice ESA educational vendor whitelist

- [ ] **Merchant Stablecoin Acceptance**
  - [ ] Create merchant crypto wallet registration
  - [ ] Implement instant merchant settlement in USDC
  - [ ] Add QR code payment acceptance
  - [ ] Build NFC tap-to-pay with stablecoins

#### Week 31: Compliance & Security
- [ ] **KYC/AML for Crypto Transactions**
  - [ ] Implement blockchain address verification
  - [ ] Add travel rule compliance for transfers >$3000
  - [ ] Create sanctions screening for wallet addresses
  - [ ] Implement transaction monitoring for crypto

- [ ] **Smart Contract Compliance**
  - [ ] Add freeze/unfreeze capabilities for compliance
  - [ ] Implement clawback for fraudulent transactions
  - [ ] Create programmatic spending restrictions
  - [ ] Add real-time compliance checking on-chain

- [ ] **Security Infrastructure**
  - [ ] Implement HSM key management for wallets
  - [ ] Add multi-party computation for key generation
  - [ ] Create secure key recovery mechanisms
  - [ ] Implement threshold signatures for high-value transactions

#### Week 32: User Experience & Integration
- [ ] **Wallet Integration**
  - [ ] Add self-custody wallet support
  - [ ] Implement MetaMask/Phantom integration
  - [ ] Create in-app embedded wallets
  - [ ] Add social recovery for wallet access

- [ ] **Payment Experience**
  - [ ] Build seamless fiat-to-crypto conversion
  - [ ] Implement automatic stablecoin selection
  - [ ] Add gas fee abstraction for users
  - [ ] Create instant notification for blockchain transactions

- [ ] **Reporting & Analytics**
  - [ ] Add blockchain explorer integration
  - [ ] Create crypto transaction reports
  - [ ] Implement cost basis tracking
  - [ ] Add tax reporting for stablecoin transactions

### Technical Specifications
- **Supported Stablecoins**: USDC, USDT, PYUSD, BUSD
- **Blockchain Networks**: Ethereum L2 (Base), Solana, Polygon zkEVM
- **Settlement Time**: <3 seconds for stablecoin payments
- **Transaction Cost**: <$0.01 per transaction
- **Compliance**: Full KYC/AML, OFAC screening, Travel Rule

### Success Metrics
- Stablecoin payment adoption rate >20%
- Settlement time <3 seconds
- Transaction success rate >99.5%
- Merchant acceptance >1000 vendors
- Cost savings >30% vs traditional rails

### Dependencies
- Treasury partner for fiat-crypto liquidity
- Circle/Tether partnership for stablecoin issuance
- Blockchain RPC infrastructure
- Smart contract audits
- Regulatory approval for benefit disbursement

---

## 📋 Weekly Status Tracking Template

```markdown
### Week X Status Report

**Phase**: [Current Phase]
**Sprint Goal**: [Primary objective]

#### Completed This Week
- [ ] Task 1
- [ ] Task 2

#### In Progress
- [ ] Task 3 (75% complete)
- [ ] Task 4 (50% complete)

#### Blocked
- [ ] Task 5 - Reason: [Blocker description]

#### Metrics
- Story Points Completed: X/Y
- Test Coverage: X%
- Bug Count: Critical: X, Major: Y
- Performance: API p95: Xms

#### Next Week Plan
- [ ] Priority 1
- [ ] Priority 2

#### Risks
- Risk 1: [Description] - Mitigation: [Plan]
```

---

## 🎯 Definition of Done

### Feature Complete Checklist
- [ ] Code complete and reviewed
- [ ] Unit tests written (>80% coverage)
- [ ] Integration tests passed
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Accessibility compliance verified
- [ ] Deployed to staging
- [ ] QA sign-off received
- [ ] Product owner acceptance

---

*Document Version: 2.0*
*Created: January 21, 2025*
*Last Updated: January 21, 2025*
*Status: ACTIVE - Implementation Ready*
*Next Review: Weekly during implementation*