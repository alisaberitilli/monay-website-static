# 🏢 ERP/CIS Data Storage Architecture for Multi-Tenant Enterprise
## Flexible Schema Design for Heterogeneous Enterprise Data

---

## 🎯 Challenge Overview

Different enterprises have:
- Unique customer data fields (e.g., customer codes, regions, departments)
- Custom invoice line item structures (e.g., project codes, cost centers, GL codes)
- Proprietary business rules and validation requirements
- Different ERP systems (SAP, Oracle, Microsoft Dynamics, NetSuite, custom)

---

## 🏗️ Recommended Hybrid Architecture with Subledger Support

### Best Practice: **Hierarchical Core + Extension Model with Account Management**
Support holding companies with multiple subsidiaries through hierarchical structure combined with flexible JSON extensions and comprehensive subledger/account architecture.

```sql
-- Organization hierarchy table
organizations (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES organizations(id), -- NULL for holding company
  org_type VARCHAR(50), -- 'holding', 'subsidiary', 'division', 'branch'
  org_code VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  legal_entity_name VARCHAR(255),
  tax_id VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',

  -- Hierarchical path for fast queries
  path_ids UUID[],  -- Array of parent IDs for hierarchy
  hierarchy_level INT DEFAULT 0,

  -- ERP Configuration
  erp_system VARCHAR(50),           -- SAP, Oracle, NetSuite, etc.
  uses_subledger BOOLEAN DEFAULT false,  -- Whether this org uses subledger architecture
  gl_configuration JSONB DEFAULT '{}',   -- GL account structure config

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_parent (parent_id),
  INDEX idx_path ON organizations USING GIN (path_ids)
)

-- Customer Accounts table (NEW - Supporting Subledger Architecture)
customer_accounts (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  customer_id UUID NOT NULL REFERENCES customers(id),
  account_number VARCHAR(100) NOT NULL,
  account_type VARCHAR(50), -- 'main_ledger', 'subledger', 'subsidiary_ledger'

  -- Account hierarchy
  parent_account_id UUID REFERENCES customer_accounts(id), -- For sub-accounts
  account_level INT DEFAULT 0,  -- 0=main, 1=sub-account, 2=sub-sub-account

  -- Ledger information
  ledger_type VARCHAR(50), -- 'AR', 'AP', 'GL', 'SL' (Subledger)
  gl_account_code VARCHAR(100), -- General Ledger mapping
  cost_center VARCHAR(100),
  profit_center VARCHAR(100),

  -- Account details
  account_name VARCHAR(255),
  currency VARCHAR(3) DEFAULT 'USD',
  credit_limit DECIMAL(15,2),
  payment_terms VARCHAR(50), -- 'NET30', 'NET60', etc.
  billing_cycle VARCHAR(50), -- 'monthly', 'quarterly', 'on_demand'

  -- Status and control
  status VARCHAR(20) DEFAULT 'active',
  is_billable BOOLEAN DEFAULT true,
  requires_approval BOOLEAN DEFAULT false,
  approval_threshold DECIMAL(15,2),

  -- ERP-specific account data
  erp_account_data JSONB DEFAULT '{}', -- ERP-specific account fields
  erp_account_code VARCHAR(100), -- Original ERP account identifier

  -- Mass billing configuration
  mass_billing_enabled BOOLEAN DEFAULT false,
  billing_group_id UUID,
  billing_template_id UUID,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(organization_id, account_number),
  INDEX idx_customer_accounts (customer_id),
  INDEX idx_org_accounts (organization_id),
  INDEX idx_parent_account (parent_account_id),
  INDEX idx_billing_group (billing_group_id)
)

-- Enhanced customers table with account support
customers (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,    -- Which company/subsidiary owns this customer
  holding_company_id UUID,           -- Top-level holding company for fast queries

  -- Core customer fields
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',

  -- Account management
  default_account_id UUID REFERENCES customer_accounts(id),
  has_multiple_accounts BOOLEAN DEFAULT false,
  account_structure VARCHAR(50), -- 'single', 'multi_account', 'hierarchical'

  -- Multi-company visibility
  shared_across_group BOOLEAN DEFAULT false,  -- Available to all subsidiaries
  visible_to_orgs UUID[] DEFAULT '{}',       -- Specific org visibility

  -- ERP integration fields
  erp_data JSONB DEFAULT '{}',              -- Enterprise-specific fields
  erp_mapping JSONB DEFAULT '{}',           -- Field mapping configuration
  erp_system VARCHAR(50),                   -- SAP, Oracle, etc.
  erp_sync_metadata JSONB DEFAULT '{}',     -- Sync timestamps, versions

  -- Indexes for performance
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_org (organization_id),
  INDEX idx_holding (holding_company_id),
  INDEX idx_visible_orgs ON customers USING GIN (visible_to_orgs)
)

-- Enhanced invoices with account linkage
invoices (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,    -- Issuing company/subsidiary
  holding_company_id UUID,          -- Top-level holding company

  -- Invoice core fields
  invoice_number VARCHAR(100),
  customer_id UUID REFERENCES customers(id),
  customer_account_id UUID REFERENCES customer_accounts(id), -- Specific account for billing

  -- Amounts and currency
  amount DECIMAL(15,2),
  currency VARCHAR(3),
  due_date DATE,
  status VARCHAR(20),

  -- Account/Ledger posting information
  posted_to_ledger BOOLEAN DEFAULT false,
  ledger_post_date TIMESTAMP,
  gl_posting_reference VARCHAR(100),
  subledger_reference VARCHAR(100),

  -- Inter-company fields
  is_intercompany BOOLEAN DEFAULT false,
  from_org_id UUID,                -- For inter-company invoices
  to_org_id UUID,                  -- For inter-company invoices
  from_account_id UUID,            -- Source account for inter-company
  to_account_id UUID,              -- Target account for inter-company
  consolidation_status VARCHAR(50), -- For group reporting

  -- Flexible fields
  erp_data JSONB DEFAULT '{}',     -- Enterprise-specific invoice data
  line_items JSONB DEFAULT '[]',   -- Flexible line item structure
  erp_metadata JSONB DEFAULT '{}', -- ERP-specific metadata

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_org_invoice (organization_id),
  INDEX idx_customer_account (customer_account_id),
  INDEX idx_holding_invoice (holding_company_id),
  INDEX idx_intercompany (is_intercompany)
)

-- Payments table with account tracking
payments (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  invoice_id UUID REFERENCES invoices(id),
  customer_id UUID REFERENCES customers(id),
  customer_account_id UUID REFERENCES customer_accounts(id),

  -- Payment details
  payment_number VARCHAR(100),
  amount DECIMAL(15,2),
  currency VARCHAR(3),
  payment_date DATE,
  payment_method VARCHAR(50), -- 'ACH', 'wire', 'card', 'crypto'

  -- Ledger posting
  posted_to_ledger BOOLEAN DEFAULT false,
  ledger_post_date TIMESTAMP,
  gl_account_code VARCHAR(100),
  subledger_entry_id VARCHAR(100),

  -- Bank reconciliation
  bank_reference VARCHAR(100),
  reconciliation_status VARCHAR(50),
  reconciled_date DATE,

  -- ERP sync
  erp_payment_data JSONB DEFAULT '{}',
  erp_sync_status VARCHAR(50),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_invoice_payments (invoice_id),
  INDEX idx_customer_payments (customer_id),
  INDEX idx_account_payments (customer_account_id)
)

-- Mass Billing Groups for batch processing
billing_groups (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  group_name VARCHAR(255),
  billing_cycle VARCHAR(50), -- 'monthly', 'quarterly'

  -- Group configuration
  billing_day INT, -- Day of month/quarter to bill
  template_id UUID, -- Invoice template for mass billing
  auto_generate BOOLEAN DEFAULT false,
  auto_send BOOLEAN DEFAULT false,

  -- Account selection criteria
  account_selection_criteria JSONB DEFAULT '{}',
  -- Example: {"account_type": "subledger", "billing_cycle": "monthly"}

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  INDEX idx_org_billing_groups (organization_id)
)

-- Account hierarchy view for easy navigation
CREATE VIEW account_hierarchy AS
WITH RECURSIVE account_tree AS (
  SELECT
    ca.*,
    c.name as customer_name,
    0 as level,
    ARRAY[ca.id] as path
  FROM customer_accounts ca
  JOIN customers c ON ca.customer_id = c.id
  WHERE ca.parent_account_id IS NULL

  UNION ALL

  SELECT
    ca.*,
    at.customer_name,
    at.level + 1,
    at.path || ca.id
  FROM customer_accounts ca
  JOIN account_tree at ON ca.parent_account_id = at.id
)
SELECT * FROM account_tree;
```

---

## 📝 Important Note: Account/Subledger Architecture is Optional

### When to Use Customer Accounts Table
The `customer_accounts` table and subledger architecture is **OPTIONAL** and should only be implemented when:

1. **ERP System Uses Subledgers**: SAP FI-AR, Oracle AR Subledger, etc.
2. **Mass Billing Requirements**: Organization needs batch invoice generation
3. **Complex Account Hierarchies**: Customer has multiple billing accounts/departments
4. **Separate Billing Entities**: Different accounts for different services/products

### Flexible Implementation Patterns

#### Pattern 1: Simple (No Accounts) - Most Common
```sql
-- For simple ERPs or small businesses
Customer → Invoice → Payment
```

#### Pattern 2: With Accounts (When ERP Requires)
```sql
-- For complex ERPs with subledger
Customer → Account(s) → Invoice → Payment
                ↓
          Subledger Entry → GL Posting
```

### Dynamic Schema Selection
```javascript
class CustomerService {
  async createCustomer(data, context) {
    const org = await Organization.findById(context.organizationId);

    // Check if organization uses account structure
    if (!org.uses_subledger) {
      // Simple flow - no accounts needed
      return await Customer.create({
        ...data,
        organization_id: context.organizationId,
        // No account references needed
      });
    } else {
      // Complex flow - create customer with default account
      const customer = await Customer.create({
        ...data,
        organization_id: context.organizationId,
        account_structure: 'multi_account'
      });

      // Create default account for ERP systems that require it
      const account = await CustomerAccount.create({
        customer_id: customer.id,
        organization_id: context.organizationId,
        account_number: await this.generateAccountNumber(),
        account_type: 'main_ledger',
        ledger_type: org.erp_system === 'SAP' ? 'AR' : 'CUSTOMER'
      });

      await customer.update({ default_account_id: account.id });
      return customer;
    }
  }
}
```

### Industry-Specific Data Models & Requirements

#### 🏦 Banks & Credit Unions
```javascript
// Core Banking Systems (Fiserv, FIS, Jack Henry, Temenos)
{
  uses_subledger: true,
  account_required: true,
  structure: "Customer (CIF) → Accounts → Transactions → GL",

  core_fields: {
    // Customer Information File (CIF)
    cif_number: "12345678",
    customer_since: "2015-01-01",
    relationship_type: "retail", // retail, commercial, private_banking
    kyc_level: "enhanced",
    risk_rating: "low",

    // Account specific
    account_types: ["DDA", "SAV", "CD", "LOAN", "LOC"],
    product_codes: ["CHK001", "SAV001", "MTG001"],
    branch_code: "0001",
    officer_code: "LO123",

    // Regulatory
    bsa_rating: "1",
    cra_code: "01",
    fdic_ownership: "single",
    beneficial_owner: true
  },

  erp_data_example: {
    // Core banking specific
    "CIF": "00012345",
    "ACCT_NBR": "1234567890",
    "PROD_CODE": "DDA001",
    "GL_CODE": "11010",
    "COST_CENTER": "BR001",
    "BSA_RISK": "LOW",
    "REG_E_STATUS": "Y",
    "SWEEP_ACCT": "9876543210"
  }
}
```

#### 💳 Payment Service Providers & Acquirers
```javascript
// Payment processors (Stripe, Adyen, Worldpay, Global Payments)
{
  uses_subledger: true,
  account_required: true,
  structure: "Merchant → MID → Settlements → Payouts",

  core_fields: {
    // Merchant identification
    merchant_id: "MER_123456",
    mid: "1234567890", // Merchant ID with acquirer
    mcc: "5411", // Merchant Category Code

    // Processing details
    processor_id: "CHASE_PAYMENTECH",
    gateway_id: "GW_123",
    terminal_ids: ["T001", "T002"],

    // Settlement
    settlement_account: "123456789",
    settlement_currency: "USD",
    payout_schedule: "daily", // daily, weekly, monthly
    reserve_percentage: 5,
    rolling_reserve_days: 90,

    // Risk & Compliance
    pci_level: "1",
    risk_tier: "standard",
    chargeback_ratio: 0.65,
    fraud_score: 85
  },

  erp_data_example: {
    "MERCHANT_ID": "M123456",
    "SETTLEMENT_ACCT": "00112233",
    "PROCESSOR_MID": "9876543210",
    "RISK_RESERVE": 10000,
    "CHARGEBACK_RESERVE": 5000,
    "MDR": 2.9, // Merchant Discount Rate
    "TXN_FEE": 0.30
  }
}
```

#### 🏢 Insurance Companies
```javascript
// Insurance systems (Guidewire, Duck Creek, Majesco)
{
  uses_subledger: true,
  account_required: true,
  structure: "Policyholder → Policies → Premiums/Claims → GL",

  core_fields: {
    // Policyholder
    policyholder_id: "PH123456",
    agent_code: "AG001",
    agency_code: "AGY100",

    // Policy details
    policy_numbers: ["AUTO-123", "HOME-456"],
    product_lines: ["personal_auto", "homeowners", "umbrella"],
    coverage_limits: { liability: 1000000, property: 500000 },

    // Premium & billing
    billing_method: "direct_bill", // agency_bill, direct_bill, payroll_deduct
    payment_plan: "monthly", // annual, semi_annual, quarterly, monthly
    premium_amount: 1500.00,

    // Claims
    claim_numbers: ["CLM-2024-001"],
    loss_ratio: 45.5,

    // Regulatory
    state_codes: ["CA", "NY", "TX"],
    naic_code: "12345",
    statutory_reserve: 100000
  },

  erp_data_example: {
    "POLICY_NUM": "POL-123456",
    "INSURED_ID": "INS-789",
    "PRODUCT_CODE": "AUTO-COMP",
    "COVERAGE_CODE": "FULL",
    "PREMIUM_AMT": 1500.00,
    "COMMISSION_AMT": 150.00,
    "PRODUCER_CODE": "P001",
    "CLAIM_RESERVE": 50000,
    "IBNR": 25000, // Incurred But Not Reported
    "LAE": 5000 // Loss Adjustment Expense
  }
}
```

#### 📱 Telecommunications
```javascript
// Telecom billing systems (Amdocs, Oracle BRM, Ericsson)
{
  uses_subledger: true,
  account_required: true,
  structure: "Subscriber → Services/Plans → Usage → Billing",

  core_fields: {
    // Subscriber
    subscriber_id: "SUB123456",
    account_number: "ACC789012",
    ban: "123456789", // Billing Account Number

    // Services
    service_types: ["mobile", "internet", "tv", "voip"],
    phone_numbers: ["+1-555-0100", "+1-555-0101"],
    sim_cards: ["SIM001", "SIM002"],
    device_ids: ["IMEI123", "IMEI456"],

    // Plans & billing
    rate_plans: ["UNLIMITED_5G", "FAMILY_SHARE"],
    billing_cycle: "15", // Day of month
    contract_end_date: "2025-12-31",

    // Usage tracking
    data_usage_gb: 45.7,
    voice_minutes: 1250,
    sms_count: 500,
    roaming_charges: 25.00,

    // Network
    home_network: "VERIZON",
    current_cell_tower: "TOWER_123",
    service_area: "NYC_METRO"
  },

  erp_data_example: {
    "BAN": "987654321",
    "MSISDN": "+15551234567",
    "IMSI": "310410123456789",
    "RATE_PLAN": "UNLTD_5G_FAM",
    "MRC": 150.00, // Monthly Recurring Charge
    "USAGE_CHARGES": 25.50,
    "EQUIPMENT_INSTALLMENT": 41.67,
    "TAXES_FEES": 18.75
  }
}
```

#### 🏛️ Public Sector & Government (GENIUS Act Compliant)
```javascript
// Government ERP with GENIUS Act Requirements (Effective July 18, 2025)
{
  uses_subledger: true,
  account_required: true,
  structure: "Citizen/Vendor → Digital Wallet/Account → Instant Disbursements → Fund Accounting",

  // GENIUS Act Specific Requirements
  genius_act_compliance: {
    // Digital Payment Infrastructure
    digital_payment_required: true,
    instant_payment_capable: true,
    max_settlement_time: "real_time", // Instant for emergencies, T+1 for regular

    // Digital Wallet Support (Required by GENIUS Act)
    digital_wallet_types: [
      "government_issued",    // Federal Digital Wallet
      "bank_connected",       // Traditional bank account
      "prepaid_card",        // Government prepaid cards
      "stablecoin_wallet"    // CBDC-ready infrastructure
    ],

    // Identity & Access
    digital_identity_required: true,
    authentication_methods: ["login.gov", "id.me", "biometric"],
    offline_capability: true, // Required for disaster scenarios

    // Financial Inclusion
    unbanked_support: true,
    no_bank_account_required: true,
    free_basic_tier: true,

    // Emergency Disbursement
    emergency_payment_sla: "4_hours",
    disaster_relief_mode: true,

    // Reporting & Transparency
    real_time_tracking: true,
    public_transparency_portal: true,
    recipient_notifications: ["sms", "email", "push", "mail"]
  },

  core_fields: {
    // Digital Identity (GENIUS Act Required)
    digital_id: "DID_123456789",
    login_gov_uuid: "550e8400-e29b-41d4-a716",
    identity_verification_level: "IAL2", // NIST standards
    identity_proofing_date: "2024-01-15",

    // Entity identification
    entity_type: "citizen", // citizen, vendor, employee, contractor, benefit_recipient
    entity_id: "CIT123456",
    ssn_tin: "XXX-XX-1234", // Masked

    // Digital Wallet Information (GENIUS Act)
    primary_wallet_id: "GOV_WALLET_123456",
    wallet_provider: "treasury_direct",
    wallet_status: "active",
    wallet_created: "2025-07-18",
    backup_payment_method: "paper_check", // Fallback option

    // Services & benefits
    service_codes: ["BENEFITS", "PERMITS", "LICENSES", "EMERGENCY_RELIEF"],
    benefit_programs: ["SNAP", "MEDICAID", "UNEMPLOYMENT", "STIMULUS", "DISASTER_RELIEF"],
    case_numbers: ["CASE-2024-001"],

    // Instant Payment Capability (GENIUS Act)
    instant_payment_eligible: true,
    payment_rail: "FedNow", // FedNow, RTP, ACH_Same_Day, Blockchain
    settlement_speed: "instant",

    // Enhanced Disbursement Methods (GENIUS Act)
    payment_methods: [
      "FedNow",           // Instant payments
      "RTP",              // Real-Time Payments network
      "Digital_Wallet",   // Government digital wallet
      "Stablecoin",       // Blockchain-based
      "ACH_Same_Day",     // Same-day ACH
      "Prepaid_Card",     // Instant-issue prepaid
      "CHECK",            // Legacy fallback
      "EBT"               // Electronic Benefits Transfer
    ],

    // Financial
    fund_codes: ["001", "002", "999"], // 999 for emergency funds
    department_codes: ["POLICE", "FIRE", "HEALTH", "FEMA"],
    grant_codes: ["FED001", "STATE002", "DISASTER001"],
    project_codes: ["INFRA-2024-01", "RELIEF-2025-01"],

    // Compliance & Audit (Enhanced for GENIUS Act)
    vendor_certifications: ["MBE", "WBE", "SBE"],
    davis_bacon_applicable: true,
    prevailing_wage_rate: 45.50,
    genius_act_compliant: true,
    payment_audit_trail: "immutable",

    // Disbursement Configuration
    disbursement_schedule: "on_demand", // instant, daily, bi_weekly, monthly
    recurring_payment: false,
    split_payment_enabled: true, // For multiple recipients

    // Emergency Response (GENIUS Act)
    emergency_override: false,
    disaster_zone: false,
    expedited_processing: false,
    bypass_normal_controls: false // For life-safety situations
  },

  erp_data_example: {
    // Standard Government ERP Fields
    "VENDOR_ID": "V123456",
    "FUND": "001",
    "DEPT": "1000",
    "UNIT": "1010",
    "OBJECT": "52100",
    "PROJECT": "CIP-2024-001",
    "GRANT": "ARPA-001",

    // GENIUS Act Specific Fields
    "DIGITAL_WALLET_ID": "DW_123456789",
    "PAYMENT_RAIL": "FEDNOW",
    "INSTANT_PAYMENT": true,
    "SETTLEMENT_TIME": "2025-07-18T10:30:00Z",
    "DISBURSEMENT_ID": "DIS_789012345",
    "GENIUS_TRACKING_ID": "GEN_2025_123456",

    // Digital Identity
    "DIGITAL_ID_PROVIDER": "LOGIN_GOV",
    "IDENTITY_SCORE": 95,
    "VERIFICATION_METHOD": "BIOMETRIC",

    // Transparency & Reporting
    "PUBLIC_TRACKING_ID": "PUB_123456",
    "RECIPIENT_NOTIFIED": true,
    "NOTIFICATION_METHODS": ["SMS", "EMAIL"],

    // Financial Details
    "ENCUMBRANCE": 50000,
    "APPROPRIATION": 100000,
    "DISBURSED_AMOUNT": 1200,
    "REMAINING_BALANCE": 48800
  }
}
```

#### 💰 FinTech & NeoBanks
```javascript
// Modern banking platforms (Mambu, Thought Machine, Temenos)
{
  uses_subledger: false, // Often use simplified structures
  account_required: true,
  structure: "User → Wallets → Transactions",

  core_fields: {
    // User identity
    user_id: "usr_123abc",
    kyc_status: "verified",
    kyc_provider: "jumio",

    // Wallets & accounts
    wallet_ids: ["wal_main", "wal_savings", "wal_crypto"],
    virtual_iban: "GB82WEST12345698765432",
    card_ids: ["card_physical_001", "card_virtual_002"],

    // Features
    features_enabled: ["instant_transfer", "crypto", "stocks", "savings_pots"],
    subscription_tier: "premium",

    // Limits & controls
    daily_spend_limit: 5000,
    atm_withdrawal_limit: 1000,
    international_enabled: true,

    // Banking as a Service
    baas_provider: "synapse",
    sponsor_bank: "evolve_bank",
    routing_number: "084106768",
    account_number: "123456789"
  },

  erp_data_example: {
    "USER_UUID": "550e8400-e29b-41d4-a716-446655440000",
    "LEDGER_BALANCE": 5000.00,
    "AVAILABLE_BALANCE": 4500.00,
    "PENDING_TRANSACTIONS": 500.00,
    "REWARDS_POINTS": 1250,
    "CASHBACK_EARNED": 125.50
  }
}
```

#### 💸 International Remittance Providers
```javascript
// Remittance systems (Western Union, MoneyGram, Wise platforms)
{
  uses_subledger: true,
  account_required: false,
  structure: "Sender → Transfer → Recipient → Settlement",

  core_fields: {
    // Sender
    sender_id: "SND123456",
    sender_kyc_level: "full",
    source_country: "US",

    // Recipient
    recipient_id: "RCP789012",
    recipient_country: "MX",
    payout_method: "cash", // bank, cash, mobile_wallet

    // Transfer details
    transfer_id: "TXF123456789",
    corridor: "US-MX",
    amount_sent: 1000,
    amount_received: 19500,
    fx_rate: 19.50,
    fees: 15.00,

    // Compliance
    purpose_code: "family_support",
    ofac_check: "passed",
    aml_score: 85,
    sanctions_check: "clear",

    // Settlement
    settlement_network: "SWIFT",
    correspondent_bank: "BBVA",
    nostro_account: "123456",
    vostro_account: "789012"
  },

  erp_data_example: {
    "MTCN": "1234567890", // Money Transfer Control Number
    "CORRIDOR": "USA-MEX",
    "SEND_AMT": 1000.00,
    "SEND_CCY": "USD",
    "RECV_AMT": 19500.00,
    "RECV_CCY": "MXN",
    "FX_RATE": 19.50,
    "COMMISSION": 15.00,
    "SETTLEMENT_DATE": "2024-01-20"
  }
}
```

#### 🏭 Large Enterprises with Complex Disbursements
```javascript
// Enterprise ERP (SAP, Oracle, Microsoft Dynamics)
{
  uses_subledger: true,
  account_required: true,
  structure: "Entity → Accounts → Disbursements → GL",

  core_fields: {
    // Entity types
    entity_type: "vendor", // employee, vendor, contractor, beneficiary
    entity_id: "ENT123456",

    // Disbursement types
    disbursement_types: ["payroll", "vendor_payment", "expense_reimbursement", "commission"],

    // Payroll specific
    employee_id: "EMP001",
    pay_group: "BIWEEKLY",
    cost_center: "CC100",

    // Vendor specific
    vendor_number: "V123456",
    payment_terms: "NET30",
    early_payment_discount: "2/10",

    // Mass payment
    batch_id: "BATCH-2024-001",
    payment_run_date: "2024-01-15",
    total_payments: 500,
    total_amount: 2500000,

    // Approval workflow
    approval_levels: ["manager", "director", "cfo"],
    approval_limit: 100000
  },

  erp_data_example: {
    "VENDOR_ID": "0000123456",
    "COMPANY_CODE": "1000",
    "PAYMENT_METHOD": "T", // ACH
    "PAYMENT_BLOCK": "",
    "WITHHOLDING_TAX": "W9",
    "BANK_KEY": "121000248",
    "BANK_ACCOUNT": "123456789",
    "PAYMENT_REFERENCE": "INV-2024-001"
  }
}
```

#### 🔒 Regulated Custodians & Trust Companies
```javascript
// Trust accounting systems (SEI, FIS, SS&C)
{
  uses_subledger: true,
  account_required: true,
  structure: "Client → Trust/Custody Accounts → Assets → Transactions",

  core_fields: {
    // Client & account
    client_id: "CLI123456",
    account_type: "trust", // trust, custody, escrow, estate
    trust_type: "revocable", // revocable, irrevocable, charitable

    // Fiduciary
    trustee_id: "TRU001",
    beneficiaries: ["BEN001", "BEN002"],
    grantor_id: "GRA001",

    // Assets under custody
    auc: 50000000, // Assets Under Custody
    asset_types: ["cash", "securities", "real_estate", "alternatives"],

    // Regulatory
    erisa_account: false,
    '40_act_account': true,
    qualified_custodian: true,

    // Tax & reporting
    tin: "12-3456789",
    tax_status: "grantor_trust",
    form_5500_required: false,

    // Transactions
    transaction_types: ["contribution", "distribution", "income", "fee"]
  },

  erp_data_example: {
    "ACCOUNT_NUMBER": "TRUST-123456",
    "CUSTODY_ACCOUNT": "C123456789",
    "TAX_ID": "12-3456789",
    "PRINCIPAL_BALANCE": 25000000,
    "INCOME_BALANCE": 500000,
    "UNREALIZED_GAINS": 2500000,
    "CUSTODY_FEE": 12500,
    "DISTRIBUTION_AMOUNT": 100000
  }
}
```

### ERP System Mappings by Industry

#### Traditional ERP Systems
```javascript
// SAP (Cross-industry)
{
  industries: ["manufacturing", "retail", "utilities", "public_sector"],
  uses_subledger: true,
  account_required: true,
  structure: "BUKRS (Company Code) → KUNNR (Customer) → Account"
}

// Oracle EBS (Cross-industry)
{
  industries: ["telecom", "utilities", "government", "healthcare"],
  uses_subledger: true, // Configurable
  account_required: false,
  structure: "Customer → Site → (Optional) Account"
}

// Microsoft Dynamics (Mid-market)
{
  industries: ["retail", "distribution", "professional_services"],
  uses_subledger: false,
  account_required: false,
  structure: "Customer → Invoice"
}
```

#### Industry-Specific Platforms
```javascript
// Banking Core Systems
{
  fiserv: { industries: ["banks", "credit_unions"] },
  fis: { industries: ["banks", "capital_markets"] },
  jack_henry: { industries: ["community_banks", "credit_unions"] },
  temenos: { industries: ["retail_banking", "wealth_management"] }
}

// Insurance Platforms
{
  guidewire: { industries: ["p&c_insurance"] },
  duck_creek: { industries: ["p&c_insurance", "life_insurance"] },
  majesco: { industries: ["insurance", "reinsurance"] }
}

// Telecom Billing
{
  amdocs: { industries: ["telecom", "media"] },
  oracle_brm: { industries: ["telecom", "utilities"] },
  ericsson: { industries: ["mobile_operators"] }
}
```

#### 💼 Small & Medium Business (SMB) ERP Systems

##### QuickBooks (Intuit)
```javascript
// QuickBooks Online & Desktop - Most popular SMB accounting
{
  uses_subledger: false,  // Simple structure
  account_required: false,
  structure: "Customer → Invoice → Payment",

  core_fields: {
    // Customer fields
    customer_id: "CUST-001",
    display_name: "Acme Corp",
    company_name: "Acme Corporation",

    // Contact info
    primary_email: "billing@acme.com",
    primary_phone: "555-0100",

    // Billing
    billing_address: {
      line1: "123 Main St",
      city: "San Francisco",
      state: "CA",
      postal_code: "94105"
    },

    // Payment terms
    terms: "Net 30",
    credit_limit: 10000,
    tax_exempt: false,
    tax_id: "12-3456789",

    // QuickBooks specific
    qb_customer_id: "80000001-1234567890",
    sync_token: "1",  // For version control
    active: true
  },

  erp_data_example: {
    "Id": "80000001-1234567890",
    "DisplayName": "Acme Corp",
    "Balance": 1500.00,
    "CompanyName": "Acme Corporation",
    "GivenName": "John",
    "FamilyName": "Doe",
    "PrimaryEmailAddr": { "Address": "john@acme.com" },
    "PrimaryPhone": { "FreeFormNumber": "(555) 555-0100" },
    "TermRef": { "value": "3" },  // Net 30 terms
    "SalesTermRef": { "value": "3" },
    "PreferredDeliveryMethod": "Email",
    "Active": true
  }
}
```

##### Xero
```javascript
// Xero - Cloud-based SMB accounting (Popular in UK/AU/NZ)
{
  uses_subledger: false,
  account_required: false,
  structure: "Contact → Invoice → Payment",

  core_fields: {
    // Contact (Customer/Supplier)
    contact_id: "con_123abc",
    contact_number: "CUST001",
    name: "Acme Corp",

    // Contact type
    is_customer: true,
    is_supplier: false,

    // Financial
    account_number: "ACC001",
    tax_number: "GB123456789",
    default_currency: "GBP",

    // Credit control
    credit_limit: 5000,
    discount: 10,  // Percentage

    // Xero specific
    xero_contact_id: "bd2270c3-8706-4c11-9322-6f4a6f476c1f",
    status: "ACTIVE",
    has_attachments: false
  },

  erp_data_example: {
    "ContactID": "bd2270c3-8706-4c11-9322-6f4a6f476c1f",
    "ContactNumber": "CUST001",
    "AccountNumber": "ACC001",
    "ContactStatus": "ACTIVE",
    "Name": "Acme Corp",
    "TaxNumber": "GB123456789",
    "BankAccountDetails": "12-3456-7890123-00",
    "Balances": {
      "AccountsReceivable": {
        "Outstanding": 1234.00,
        "Overdue": 0.00
      }
    }
  }
}
```

##### FreshBooks
```javascript
// FreshBooks - Service business focused
{
  uses_subledger: false,
  account_required: false,
  structure: "Client → Invoice → Payment",

  core_fields: {
    // Client fields
    client_id: 12345,
    organization: "Acme Services",

    // Contact
    first_name: "Jane",
    last_name: "Smith",
    email: "jane@acmeservices.com",

    // Billing
    billing_street: "456 Service Ave",
    currency_code: "USD",

    // FreshBooks specific
    accounting_systemid: "ACM123",
    userid: 92374,  // FreshBooks user ID
    vis_state: 0,  // 0=active, 1=deleted, 2=archived

    // Project tracking
    allow_late_fees: true,
    allow_late_notifications: true
  },

  erp_data_example: {
    "id": 12345,
    "accounting_systemid": "ACM123",
    "organization": "Acme Services",
    "email": "client@example.com",
    "fname": "Jane",
    "lname": "Smith",
    "outstanding": { "amount": "1500.00", "code": "USD" },
    "credit": { "amount": "0.00", "code": "USD" }
  }
}
```

##### Zoho Books
```javascript
// Zoho Books - Part of Zoho suite
{
  uses_subledger: false,
  account_required: false,
  structure: "Customer → Invoice → Payment",

  core_fields: {
    // Customer
    customer_id: "cust_123456789",
    customer_name: "Acme Industries",
    contact_type: "customer",

    // Contact persons
    contact_persons: [
      {
        first_name: "Bob",
        last_name: "Johnson",
        email: "bob@acme.com",
        is_primary: true
      }
    ],

    // Zoho specific
    currency_code: "USD",
    payment_terms: 30,
    credit_limit: 10000,

    // Integration
    zoho_crm_contact_id: "crm_987654",
    gst_treatment: "business_gst",
    place_of_supply: "California"
  },

  erp_data_example: {
    "contact_id": "460000000026049",
    "contact_name": "Acme Industries",
    "company_name": "Acme Industries Inc",
    "contact_type": "customer",
    "customer_sub_type": "business",
    "credit_limit": 10000,
    "outstanding_receivable_amount": 2500.00,
    "currency_code": "USD",
    "payment_terms": 30,
    "gst_no": "22AAAAA0000A1Z5"
  }
}
```

##### Wave Accounting
```javascript
// Wave - Free accounting for small businesses
{
  uses_subledger: false,
  account_required: false,
  structure: "Customer → Invoice → Payment",

  core_fields: {
    // Customer
    id: "QnVzaW5lc3M6NGI2ZDU5",
    name: "Local Coffee Shop",
    email: "owner@localcoffee.com",

    // Simple structure
    address: {
      addressLine1: "789 Brew Street",
      city: "Portland",
      provinceOrState: "OR",
      postalCode: "97201"
    },

    // Wave specific
    internal_id: "12345",
    currency: "USD",
    is_archived: false
  },

  erp_data_example: {
    "id": "QnVzaW5lc3M6NGI2ZDU5",
    "name": "Local Coffee Shop",
    "email": "owner@localcoffee.com",
    "address": {
      "addressLine1": "789 Brew Street",
      "city": "Portland",
      "postalOrZipCode": "97201"
    },
    "currency": { "code": "USD" }
  }
}
```

##### Sage Business Cloud Accounting
```javascript
// Sage - Popular in UK and Europe
{
  uses_subledger: false,
  account_required: false,
  structure: "Contact → Sales Invoice → Receipt",

  core_fields: {
    // Contact
    id: "con_GB_12345",
    reference: "CUST001",
    name: "British Widgets Ltd",
    contact_type: "CUSTOMER",

    // UK specific
    tax_number: "GB123456789",
    tax_scheme: "VAT",

    // Credit control
    credit_limit: 5000,
    credit_days: 30,

    // Sage specific
    sage_id: "a1b2c3d4e5f6",
    ledger_account_id: "1100",  // Accounts Receivable
    nominal_code: "4000",  // Sales

    // Multi-currency
    currency_id: "GBP",
    exchange_rate: 1.0
  },

  erp_data_example: {
    "id": "a1b2c3d4e5f6",
    "displayed_as": "British Widgets Ltd (CUST001)",
    "reference": "CUST001",
    "name": "British Widgets Ltd",
    "contact_types": [{ "id": "CUSTOMER" }],
    "tax_number": "GB123456789",
    "credit_limit": 5000,
    "balance": 1250.00,
    "main_address": {
      "address_line_1": "10 Downing Street",
      "city": "London",
      "postal_code": "SW1A 2AA",
      "country": { "id": "GB" }
    }
  }
}
```

##### Square (for Retail/Restaurant)
```javascript
// Square - POS and payment focused
{
  uses_subledger: false,
  account_required: false,
  structure: "Customer → Transaction → Settlement",

  core_fields: {
    // Customer
    id: "sq_cust_ABC123",
    given_name: "Sarah",
    family_name: "Connor",
    email: "sarah@resistance.com",

    // Loyalty
    loyalty_account_id: "loy_123456",
    points_balance: 1500,
    lifetime_points: 5000,

    // Square specific
    merchant_id: "MERCHANT_123",
    location_ids: ["LOC_001", "LOC_002"],

    // Payment methods on file
    cards: [
      {
        id: "card_123",
        last_4: "4242",
        brand: "VISA"
      }
    ],

    // Marketing
    preferences: {
      email_unsubscribed: false,
      sms_subscribed: true
    }
  },

  erp_data_example: {
    "id": "JDKYHBWT1D4F8MFH63DBMEN8Y4",
    "created_at": "2024-01-15T10:00:00Z",
    "given_name": "Sarah",
    "family_name": "Connor",
    "email_address": "sarah@resistance.com",
    "phone_number": "+1-555-0150",
    "reference_id": "CUST_REF_123",
    "group_ids": ["loyal_customers", "vip"],
    "segment_ids": ["high_value"],
    "cards": [
      {
        "id": "ccof:uIbfJXhXETSP197M3GB",
        "card_brand": "VISA",
        "last_4": "4242"
      }
    ]
  }
}
```

#### SMB ERP Adapter Configuration
```javascript
class SMBERPAdapter {
  // Unified adapter for all SMB systems
  async connectToSMB(type, credentials) {
    switch(type) {
      case 'quickbooks':
        return new QuickBooksClient({
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
          redirectUri: credentials.redirectUri,
          environment: credentials.sandbox ? 'sandbox' : 'production'
        });

      case 'xero':
        return new XeroClient({
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
          scope: 'accounting.contacts accounting.transactions'
        });

      case 'freshbooks':
        return new FreshBooksClient({
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
          redirectUri: credentials.redirectUri
        });

      case 'zoho':
        return new ZohoClient({
          orgId: credentials.orgId,
          authToken: credentials.authToken
        });

      case 'wave':
        return new WaveClient({
          apiKey: credentials.apiKey,
          businessId: credentials.businessId
        });

      case 'sage':
        return new SageClient({
          clientId: credentials.clientId,
          clientSecret: credentials.clientSecret,
          countryCode: credentials.countryCode
        });

      case 'square':
        return new SquareClient({
          accessToken: credentials.accessToken,
          environment: credentials.environment
        });
    }
  }

  // Common field mapping for SMB systems
  getCommonFieldMapping(system) {
    return {
      quickbooks: {
        customer_name: 'DisplayName',
        email: 'PrimaryEmailAddr.Address',
        phone: 'PrimaryPhone.FreeFormNumber',
        balance: 'Balance'
      },
      xero: {
        customer_name: 'Name',
        email: 'EmailAddress',
        phone: 'Phones[0].PhoneNumber',
        balance: 'Balances.AccountsReceivable.Outstanding'
      },
      freshbooks: {
        customer_name: 'organization',
        email: 'email',
        phone: 'phone',
        balance: 'outstanding.amount'
      }
    }[system];
  }
}
```

---

## 💹 Capital Markets & Secondary Trading Platforms

### Overview
Supporting secondary markets, asset managers, hedge funds, and trading firms with real-time settlement and complex portfolio management requirements.

#### Bloomberg AIM (Asset & Investment Manager)
```javascript
// Bloomberg AIM - Leading buy-side OMS/EMS
{
  uses_subledger: true,  // Complex portfolio accounting
  account_required: true, // Multiple trading accounts per client
  structure: "Client → Portfolio → Account → Position",

  core_fields: {
    // Client entity
    client_id: "CLI_HF_001",
    client_name: "Apex Capital Partners",
    client_type: "HEDGE_FUND",

    // Portfolio structure
    portfolio_id: "PORT_001",
    portfolio_name: "Multi-Strategy Fund I",
    base_currency: "USD",

    // Trading account
    account_id: "ACC_PRIME_001",
    account_type: "PRIME_BROKERAGE",
    prime_broker: "Goldman Sachs",

    // Bloomberg specific
    aim_entity_id: "AIM_12345",
    bloomberg_ticker: "APEX:HF",

    // Risk & compliance
    risk_rating: "HIGH",
    leverage_limit: 5.0,
    var_limit: 1000000,  // Value at Risk

    // Settlement
    settlement_instructions: {
      method: "DTC",
      dtc_number: "0901",
      custody_account: "CUST_GS_001"
    }
  },

  erp_data_example: {
    "entity_id": "AIM_12345",
    "entity_type": "FUND",
    "legal_name": "Apex Capital Partners LP",
    "portfolios": [
      {
        "portfolio_id": "PORT_001",
        "aum": 5000000000,
        "strategy": "MULTI_STRATEGY",
        "positions": 1250,
        "nav": 5234567890.50
      }
    ],
    "trading_accounts": [
      {
        "account": "PRIME_001",
        "broker": "GS",
        "balance": 250000000,
        "margin_used": 125000000
      }
    ]
  }
}
```

#### Charles River IMS
```javascript
// Charles River - Investment management platform
{
  uses_subledger: true,
  account_required: true,
  structure: "Investor → Fund → Account → Holdings",

  core_fields: {
    // Investor
    investor_id: "INV_PE_001",
    investor_type: "PENSION_FUND",
    investor_name: "State Teachers Retirement",

    // Fund allocation
    fund_id: "FUND_001",
    commitment: 100000000,
    called_capital: 75000000,

    // CR specific
    cr_entity_id: "CR_98765",
    workspace_id: "WS_001",

    // Performance
    irr: 0.15,  // Internal Rate of Return
    multiple: 1.8,

    // Compliance
    investment_guidelines: {
      max_single_position: 0.05,  // 5% max
      restricted_sectors: ["tobacco", "weapons"],
      esg_score_min: 70
    }
  }
}
```

#### Murex MX.3
```javascript
// Murex - Capital markets and treasury
{
  uses_subledger: true,
  account_required: true,
  structure: "Counterparty → Book → Deal → Cashflow",

  core_fields: {
    // Counterparty
    counterparty_id: "CP_BANK_001",
    lei: "549300VBXYEUTIUP4S72",  // Legal Entity Identifier

    // Trading book
    book_id: "BOOK_FX_001",
    book_type: "TRADING",
    desk: "FX_SPOT",

    // Deal/Trade
    deal_id: "FX_2025_001234",
    product_type: "FX_FORWARD",
    notional: 10000000,

    // Murex specific
    murex_id: "MRX_567890",
    workflow_status: "CONFIRMED",

    // Settlement
    ssi_id: "SSI_001",  // Standard Settlement Instructions
    nostro_account: "NOST_USD_001"
  }
}
```

#### SimCorp Dimension
```javascript
// SimCorp - Investment management for asset managers
{
  uses_subledger: true,
  account_required: true,
  structure: "Client → Mandate → Portfolio → Instrument",

  core_fields: {
    client_id: "CL_INSURANCE_001",
    client_type: "INSURANCE_COMPANY",

    mandate_id: "MAND_001",
    mandate_type: "DISCRETIONARY",

    portfolio_id: "PF_FIXED_INCOME",
    benchmark: "Bloomberg_Barclays_Agg",

    // SimCorp specific
    dimension_id: "DIM_123456",
    accounting_basis: "FAIR_VALUE",

    // Regulatory
    mifid_classification: "PROFESSIONAL",
    aifmd_reporting: true
  }
}
```

---

## 🚗 Gig Economy & Payout Platforms

### Overview
Supporting on-demand economy platforms, contractor payouts, and instant earnings access with high-volume, small-value transactions.

#### Uber/Lyft Driver Platform
```javascript
// Rideshare & Delivery Platforms
{
  uses_subledger: false,  // Simple driver accounts
  account_required: false,
  structure: "Driver → Earnings → Payout",

  core_fields: {
    // Driver/Contractor
    driver_id: "DRV_123456",
    driver_uuid: "uuid_abc123",
    driver_status: "ACTIVE",

    // Identity
    first_name: "John",
    last_name: "Smith",
    phone: "+15551234567",
    email: "john.driver@email.com",

    // Tax info
    tax_id: "123-45-6789",
    tax_classification: "1099_CONTRACTOR",

    // Earnings
    lifetime_earnings: 125000,
    current_balance: 523.45,
    pending_earnings: 87.23,

    // Instant pay settings
    instant_pay_enabled: true,
    instant_pay_method: "DEBIT_CARD",
    instant_pay_limit_daily: 500,

    // Platform specific
    city: "San Francisco",
    vehicle_type: "UberX",
    rating: 4.92
  },

  erp_data_example: {
    "partner_uuid": "uuid_abc123",
    "first_name": "John",
    "last_name": "Smith",
    "city_id": "sf_bay",
    "earnings": {
      "lifetime_trips": 15234,
      "lifetime_gross": 125000,
      "available_balance": 523.45,
      "next_payout": "2025-01-22"
    },
    "instant_pay": {
      "enabled": true,
      "card_last_four": "4567",
      "daily_cashouts": 2
    }
  }
}
```

#### Stripe Connect / Hyperwallet
```javascript
// Payout Infrastructure Providers
{
  uses_subledger: false,
  account_required: false,
  structure: "Payee → Wallet → Payout Method",

  core_fields: {
    // Payee
    payee_id: "payee_123abc",
    account_type: "EXPRESS",  // Express, Custom, Standard

    // Verification
    kyc_status: "VERIFIED",
    identity_verified: true,

    // Payout settings
    payout_schedule: "DAILY",
    payout_minimum: 10.00,

    // Multi-method support
    payout_methods: [
      {
        type: "BANK_ACCOUNT",
        routing: "121000358",
        account: "****4567",
        default: true
      },
      {
        type: "DEBIT_CARD",
        last_four: "8901",
        instant: true
      },
      {
        type: "PAYPAL",
        email: "user@email.com"
      }
    ],

    // Platform specific
    stripe_account_id: "acct_1234567890",
    hyperwallet_token: "usr-token-123"
  }
}
```

#### DoorDash/Instacart Shopper
```javascript
// Food & Grocery Delivery
{
  uses_subledger: false,
  account_required: false,
  structure: "Dasher → Shift → Earnings → Payout",

  core_fields: {
    dasher_id: "DSH_789012",
    dasher_type: "INDEPENDENT_CONTRACTOR",

    // Shift tracking
    active_time_hours: 2543,
    dash_time_hours: 2890,

    // Earnings breakdown
    base_pay_total: 45000,
    tips_total: 23000,
    peak_pay_total: 5000,

    // Fast Pay (Instant)
    fast_pay_enabled: true,
    fast_pay_fee: 1.99,
    daily_fast_pay_limit: 500,

    // Red Card (for purchases)
    red_card_number: "****5678",
    red_card_status: "ACTIVE"
  }
}
```

#### TaskRabbit/Handy Pro
```javascript
// Service marketplace platforms
{
  uses_subledger: false,
  account_required: false,
  structure: "Tasker → Job → Payment",

  core_fields: {
    tasker_id: "TSK_345678",
    specialty: ["plumbing", "electrical", "handyman"],

    // Profile
    hourly_rate: 75,
    jobs_completed: 523,
    rating: 4.8,

    // Payments
    pending_payments: 450.00,
    available_balance: 1235.00,

    // Instant payout
    instant_transfer_enabled: true,
    transfer_method: "ACH_SAME_DAY",

    // Insurance & bonding
    liability_insurance: true,
    background_check: "PASSED",
    bonded: true
  }
}
```

---

## 🏭 Supplier & Distributor Platforms

### Overview
B2B procurement, supply chain finance, and vendor management systems with complex approval workflows and payment terms.

#### SAP Ariba
```javascript
// Leading procurement platform
{
  uses_subledger: true,
  account_required: true,
  structure: "Supplier → Catalog → PO → Invoice → Payment",

  core_fields: {
    // Supplier
    supplier_id: "SUPP_001234",
    anid: "AN01234567890",  // Ariba Network ID
    duns: "123456789",

    // Company info
    legal_name: "Global Parts Supplier Inc",
    doing_business_as: "GPS Inc",

    // Classification
    supplier_type: "STRATEGIC",
    category_codes: ["MRO", "IT_HARDWARE"],

    // Financials
    payment_terms: "2/10_NET_30",
    currency: "USD",
    credit_limit: 500000,

    // Performance
    on_time_delivery: 0.95,
    quality_rating: 4.7,

    // Compliance
    diversity_certified: ["MBE", "SBE"],
    insurance_expiry: "2025-12-31",
    w9_on_file: true,

    // Early payment
    dynamic_discounting: true,
    supply_chain_finance: true,
    preferred_scf_rate: 0.015  // 1.5% for 30-day early
  },

  erp_data_example: {
    "ANID": "AN01234567890",
    "SystemID": "SUPP_001234",
    "Name": "Global Parts Supplier Inc",
    "PaymentTerms": {
      "TermsCode": "Z210N30",
      "Description": "2% 10 days, Net 30"
    },
    "RemitTo": {
      "AddressID": "ADDR_001",
      "BankAccount": "****4567"
    },
    "Certificates": [
      {
        "Type": "MINORITY_OWNED",
        "ExpiryDate": "2025-12-31"
      }
    ]
  }
}
```

#### Coupa
```javascript
// Spend management platform
{
  uses_subledger: true,
  account_required: true,
  structure: "Vendor → Contract → Requisition → PO → Invoice",

  core_fields: {
    // Vendor
    vendor_id: "VND_456789",
    coupa_id: "COUP_123456",

    // Vendor details
    vendor_name: "Tech Solutions Provider",
    vendor_number: "V-2025-001",

    // Contract management
    contract_id: "CTR_2025_001",
    contract_value: 1000000,
    contract_spent: 450000,

    // Approval chain
    approval_chain: [
      { level: 1, approver: "manager", limit: 10000 },
      { level: 2, approver: "director", limit: 50000 },
      { level: 3, approver: "vp", limit: 250000 }
    ],

    // Coupa Pay
    coupa_pay_enabled: true,
    virtual_card_program: true,

    // Savings tracking
    negotiated_savings: 125000,
    realized_savings: 98000
  }
}
```

#### Oracle Procurement Cloud
```javascript
// Oracle's procurement solution
{
  uses_subledger: true,
  account_required: true,
  structure: "Supplier → Site → Purchase Order → Receipt → Payment",

  core_fields: {
    // Supplier
    supplier_id: "SUP_ORA_001",
    supplier_number: "SUP-2025-001",
    registry_id: "ORACLE_REG_123",

    // Sites (locations)
    supplier_site_id: "SITE_001",
    site_code: "HQ_USA",

    // Procurement
    sourcing_rule: "LOWEST_COST",
    lead_time_days: 14,

    // Oracle specific
    party_id: "PARTY_123456",
    vendor_type: "STANDARD",

    // Payment
    payment_method: "EFT",
    payment_priority: 99,

    // Holds
    hold_status: "NONE",
    hold_reason: null
  }
}
```

#### Jaggaer
```javascript
// Source-to-pay platform
{
  uses_subledger: false,
  account_required: false,
  structure: "Supplier → RFx → Contract → Order",

  core_fields: {
    supplier_id: "JAG_SUP_001",
    supplier_name: "Industrial Supplies Co",

    // Sourcing
    rfq_participation: true,
    auction_enabled: true,

    // Performance scorecard
    kpi_score: 85,
    sustainability_rating: "A",

    // Risk management
    risk_score: "LOW",
    financial_health: "STRONG",

    // Network
    jaggaer_network_id: "JN_123456",
    catalog_enabled: true
  }
}
```

---

## 🏢 Equipment Leasing & Asset Finance

### Overview
Supporting equipment financing, lease management, and asset-backed lending with complex amortization schedules and residual value tracking.

#### DLL Group / De Lage Landen
```javascript
// Equipment finance specialist
{
  uses_subledger: true,
  account_required: true,
  structure: "Lessee → Contract → Asset → Payment Schedule",

  core_fields: {
    // Lessee
    lessee_id: "LES_001234",
    company_name: "Construction Corp",
    credit_rating: "A",

    // Lease contract
    contract_id: "LEASE_2025_001",
    lease_type: "FINANCE_LEASE",
    term_months: 60,

    // Asset details
    asset_type: "CONSTRUCTION_EQUIPMENT",
    asset_description: "CAT 320 Excavator",
    asset_value: 250000,
    residual_value: 50000,

    // Payment structure
    monthly_payment: 4500,
    payment_frequency: "MONTHLY",

    // Early buyout
    buyout_option: true,
    buyout_amount_formula: "RV + remaining_interest",

    // Insurance
    insurance_required: true,
    insurance_provider: "Zurich",
    insurance_policy: "POL_123456"
  }
}
```

#### Lease Management Platforms
```javascript
// Generic lease management systems
{
  uses_subledger: true,
  account_required: true,
  structure: "Customer → Portfolio → Lease → Asset",

  core_fields: {
    customer_id: "CUST_LEASE_001",
    portfolio_id: "PORT_001",

    // Lease details
    lease_number: "L-2025-001",
    commencement_date: "2025-01-01",
    maturity_date: "2030-01-01",

    // Financial
    total_financed: 500000,
    interest_rate: 0.065,
    payment_amount: 9500,

    // Asset tracking
    assets: [
      {
        asset_id: "ASSET_001",
        serial_number: "SN123456",
        location: "Site A",
        condition: "GOOD",
        last_inspection: "2024-12-01"
      }
    ],

    // Accounting
    accounting_standard: "ASC_842",  // or IFRS_16
    right_of_use_asset: 450000,
    lease_liability: 445000
  }
}
```

---

## 🏛️ Government Benefits Program Integration

### Overview
Supporting SNAP, TANF, Medicaid, School Choice, and other subsidiary programs with eligibility tracking, restricted spending controls, and real-time authorization.

#### Enhanced Customer Model for Benefits
```sql
-- Extended customer table for benefit recipients
CREATE TABLE customers (
  -- Existing fields...
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  organization_id UUID NOT NULL,

  -- Core customer fields
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),

  -- Enhanced for benefits
  customer_type VARCHAR(50), -- INDIVIDUAL, BUSINESS, BENEFICIARY

  -- Benefit-specific fields (when customer_type = BENEFICIARY)
  ssn_hash VARCHAR(255),
  household_id UUID,

  -- Eligibility tracking
  benefit_eligibility JSONB, -- Multi-program eligibility
  /* Example structure:
  {
    "SNAP": {
      "eligible": true,
      "determination_date": "2025-01-01",
      "expiry_date": "2025-12-31",
      "monthly_amount": 535.00,
      "household_size": 3
    },
    "TANF": {
      "eligible": true,
      "months_used": 12,
      "months_remaining": 48
    },
    "SCHOOL_CHOICE": {
      "eligible": true,
      "student_id": "STU123",
      "annual_amount": 7500.00
    }
  }
  */

  -- Multi-program balances
  benefit_balances JSONB,
  /* Example:
  {
    "SNAP": { "current": 235.50, "pending": 535.00 },
    "TANF": { "current": 450.00, "cash_available": 100.00 },
    "SCHOOL_CHOICE": { "current": 5250.00, "ytd_spent": 2250.00 }
  }
  */

  -- Spend restrictions
  spending_restrictions JSONB,
  /* Example:
  {
    "prohibited_mcc": ["5813", "5921", "7995"],
    "allowed_mcc": ["5411", "5422", "5451"],
    "daily_limits": { "ATM": 200, "cash_back": 100 },
    "requires_item_validation": true
  }
  */

  erp_data JSONB, -- Existing field for enterprise data

  INDEX idx_household (household_id),
  INDEX idx_customer_type (customer_type),
  INDEX idx_benefit_eligible (customer_type, (benefit_eligibility IS NOT NULL))
);

-- Benefit-specific accounts (extends customer_accounts)
CREATE TABLE benefit_accounts (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL,
  program_type VARCHAR(50), -- SNAP, TANF, MEDICAID, SCHOOL_CHOICE

  -- Account details
  account_number VARCHAR(100) UNIQUE,
  card_number_masked VARCHAR(20),

  -- Balance tracking
  current_balance DECIMAL(10,2),
  pending_loads DECIMAL(10,2),

  -- Monthly tracking
  benefit_month DATE,
  monthly_allotment DECIMAL(10,2),
  month_to_date_spent DECIMAL(10,2),

  -- Program-specific limits
  transaction_limits JSONB,
  /* Example:
  {
    "max_per_transaction": null,
    "max_daily": 1000,
    "max_atm_daily": 200,
    "allow_cash_back": false,
    "allow_online": true
  }
  */

  -- Status
  status VARCHAR(50), -- ACTIVE, SUSPENDED, CLOSED
  last_load_date TIMESTAMP,
  next_load_date DATE,

  FOREIGN KEY (customer_id) REFERENCES customers(id),
  UNIQUE(customer_id, program_type),
  INDEX idx_program_accounts (program_type, status)
);
```

#### Government Benefits Business Rules
```javascript
// Enhanced Business Rule Engine for Benefits
class GovernmentBenefitRules {
  // SNAP MCC Restrictions
  static SNAP_ALLOWED_MCC = [
    '5411', // Grocery Stores
    '5422', // Meat Markets
    '5441', // Candy Stores
    '5451', // Dairy Stores
    '5499'  // Misc Food Stores
  ];

  // TANF Prohibited MCCs
  static TANF_PROHIBITED_MCC = [
    '5813', // Bars
    '5921', // Liquor Stores
    '7995', // Gambling
    '7273', // Dating Services
    '7297'  // Massage Parlors
  ];

  // School Choice Allowed MCCs
  static SCHOOL_ALLOWED_MCC = [
    '8211', // Schools
    '8220', // Colleges
    '8299', // Educational Services
    '5942', // Book Stores
    '5943'  // Office Supplies
  ];

  // Medicaid Healthcare MCCs
  static MEDICAID_MCC = [
    '8011', // Doctors
    '8021', // Dentists
    '8062', // Hospitals
    '5912'  // Pharmacies
  ];

  async evaluateTransaction(transaction, context) {
    const rules = [];

    // Program-specific rules
    switch(context.program_type) {
      case 'SNAP':
        rules.push(this.evaluateSNAPRules(transaction));
        break;
      case 'TANF':
        rules.push(this.evaluateTANFRules(transaction));
        break;
      case 'SCHOOL_CHOICE':
        rules.push(this.evaluateSchoolChoiceRules(transaction));
        break;
      case 'MEDICAID':
        rules.push(this.evaluateMedicaidRules(transaction));
        break;
    }

    // Common rules
    rules.push(this.checkBalance(transaction, context));
    rules.push(this.checkEligibility(context));
    rules.push(this.checkTimeRestrictions(transaction));

    return this.consolidateResults(rules);
  }

  evaluateSNAPRules(transaction) {
    return {
      name: 'SNAP_MCC_CHECK',
      passed: this.SNAP_ALLOWED_MCC.includes(transaction.mcc_code),
      reason: `MCC ${transaction.mcc_code} ${
        this.SNAP_ALLOWED_MCC.includes(transaction.mcc_code)
        ? 'allowed' : 'not allowed'
      } for SNAP`
    };
  }
}
```

#### Integration with Monay-Fiat Rails for Benefits
```javascript
class BenefitPaymentService {
  constructor() {
    this.fiatRails = new MonayFiatRailsClient({
      baseURL: process.env.FIAT_RAILS_URL
    });

    this.benefitRules = new GovernmentBenefitRules();
  }

  async authorizeBenefitTransaction(transaction) {
    // 1. Load customer benefit data
    const customer = await this.getCustomer(transaction.customer_id);

    if (customer.customer_type !== 'BENEFICIARY') {
      return { approved: false, reason: 'Not a benefit recipient' };
    }

    // 2. Determine program from card/account
    const program = await this.getProgramFromCard(transaction.card_token);

    // 3. Apply business rules
    const ruleResult = await this.benefitRules.evaluateTransaction(
      transaction,
      {
        program_type: program,
        customer_id: customer.id,
        current_balance: customer.benefit_balances[program].current
      }
    );

    if (!ruleResult.approved) {
      return ruleResult;
    }

    // 4. Process via Monay-Fiat Rails
    const authorization = await this.fiatRails.authorizeCard({
      amount: transaction.amount,
      merchant: transaction.merchant,
      mcc: transaction.mcc_code,
      card_token: transaction.card_token,
      metadata: {
        program: program,
        beneficiary_id: customer.id,
        rules_applied: ruleResult.rules_passed
      }
    });

    // 5. Update balance if approved
    if (authorization.approved) {
      await this.updateBenefitBalance(
        customer.id,
        program,
        transaction.amount
      );
    }

    return authorization;
  }

  // Monthly benefit loading via ACH
  async loadMonthlyBenefits() {
    const beneficiaries = await this.getEligibleBeneficiaries();

    for (const beneficiary of beneficiaries) {
      for (const program in beneficiary.benefit_eligibility) {
        const eligibility = beneficiary.benefit_eligibility[program];

        if (!eligibility.eligible) continue;

        // Calculate benefit amount
        const amount = this.calculateBenefitAmount(
          beneficiary,
          program,
          eligibility
        );

        // Load via Monay-Fiat Rails ACH
        const result = await this.fiatRails.processDisbursement({
          recipient_id: beneficiary.id,
          amount: amount,
          method: 'ACH',
          type: 'BENEFIT_LOAD',
          reference: `${program}_${new Date().toISOString().slice(0,7)}`,
          metadata: {
            program: program,
            household_size: eligibility.household_size,
            benefit_month: new Date().toISOString().slice(0,7)
          }
        });

        // Update balances
        if (result.success) {
          await this.creditBenefitAccount(
            beneficiary.id,
            program,
            amount
          );
        }
      }
    }
  }
}
```

---

## 📜 GENIUS Act Compliance Architecture (Effective July 18, 2025)

### Overview
The Generating Economic Stability through Efficient Digital Payments (GENIUS) Act mandates that all federal benefit payments and disbursements must be available through digital payment methods, with specific requirements for instant payments, financial inclusion, and emergency response capabilities.

### Key Architectural Requirements

#### 1. Instant Payment Infrastructure
```javascript
class GENIUSPaymentService {
  // Required settlement times
  static SETTLEMENT_REQUIREMENTS = {
    emergency_relief: "instant",      // < 30 seconds
    disaster_payment: "4_hours",      // Within 4 hours
    regular_benefit: "same_day",      // Same business day
    vendor_payment: "T+1"            // Next business day
  };

  async processGENIUSPayment(payment) {
    // Determine payment rail based on urgency
    const rail = this.selectPaymentRail(payment.urgency);

    // Options in priority order (GENIUS Act compliant)
    const paymentRails = [
      'FedNow',           // Instant 24/7/365
      'RTP',              // Real-Time Payments
      'Blockchain',       // Stablecoin/CBDC ready
      'ACH_Same_Day',     // Fallback same-day
      'Digital_Wallet'    // Government wallet
    ];

    // Process with automatic failover
    return await this.processWithFailover(payment, paymentRails);
  }
}
```

#### 2. Digital Identity & Wallet Management
```sql
-- GENIUS Act compliant digital identity table
CREATE TABLE genius_digital_identities (
  id UUID PRIMARY KEY,
  citizen_id UUID NOT NULL,

  -- Digital Identity Providers
  login_gov_id VARCHAR(255),
  id_me_uuid VARCHAR(255),
  digital_id_token TEXT, -- JWT token

  -- Verification Levels (NIST 800-63)
  identity_assurance_level VARCHAR(10), -- IAL1, IAL2, IAL3
  authentication_assurance_level VARCHAR(10), -- AAL1, AAL2, AAL3

  -- Biometric Data (encrypted)
  biometric_hash TEXT,
  biometric_type VARCHAR(50), -- fingerprint, face, iris

  -- Digital Wallet
  primary_wallet_id UUID,
  wallet_provider VARCHAR(100),
  wallet_public_key TEXT, -- For blockchain wallets

  -- Backup Methods
  backup_payment_method VARCHAR(50),
  paper_check_address JSONB,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_verified TIMESTAMP,

  INDEX idx_login_gov (login_gov_id),
  INDEX idx_wallet (primary_wallet_id)
);
```

#### 3. Emergency Disbursement System
```javascript
class EmergencyDisbursementService {
  async initiateDisasterRelief(disaster) {
    const config = {
      // GENIUS Act Requirements
      max_processing_time: "4_hours",
      bypass_normal_approvals: true,
      auto_identity_verification: true,

      // Payment configuration
      payment_rails: ["FedNow", "Blockchain"],
      fallback_method: "prepaid_card",

      // Notification (required by GENIUS Act)
      notify_channels: ["SMS", "Email", "Push", "Mail"],
      tracking_enabled: true,
      public_transparency: true
    };

    // Batch process affected citizens
    const affected = await this.getAffectedCitizens(disaster.zip_codes);

    // Create disbursement batch
    return await this.createBatchDisbursement({
      recipients: affected,
      amount: disaster.relief_amount,
      urgency: "IMMEDIATE",
      genius_act_override: true
    });
  }
}
```

#### 4. Financial Inclusion Features
```javascript
// Support for unbanked/underbanked populations
const financialInclusionFeatures = {
  // No bank account required
  wallet_options: [
    {
      type: "government_digital_wallet",
      requirements: "none",
      cost: "free",
      features: ["instant_payments", "bill_pay", "savings"]
    },
    {
      type: "prepaid_card",
      requirements: "address_only",
      cost: "free",
      features: ["atm_access", "point_of_sale", "online"]
    }
  ],

  // Alternative authentication for those without traditional IDs
  alternative_auth: [
    "community_vouching",  // Trusted community member verification
    "provisional_account",  // Temporary account with limits
    "in_person_verification" // At post office or government office
  ],

  // Offline capability
  offline_features: {
    qr_code_payments: true,
    nfc_tap_payments: true,
    ussd_payments: true, // For basic phones
    paper_backup: true
  }
};
```

#### 5. Transparency & Reporting Requirements
```javascript
class GENIUSTransparencyPortal {
  // Public tracking interface (required by Act)
  async getPublicDisbursementData() {
    return {
      total_disbursed: await this.getTotalDisbursed(),
      recipients_count: await this.getRecipientCount(),
      average_processing_time: await this.getAvgProcessingTime(),
      payment_methods: await this.getPaymentMethodBreakdown(),

      // Real-time tracking
      tracking_url: "https://track.pay.gov/",

      // Anonymized data for public consumption
      demographic_breakdown: await this.getAnonymizedDemographics(),
      geographic_distribution: await this.getGeographicData()
    };
  }

  // Recipient notification system
  async notifyRecipient(payment) {
    const notifications = [];

    // Multi-channel notification (GENIUS Act requirement)
    if (payment.recipient.sms) {
      notifications.push(this.sendSMS(payment));
    }
    if (payment.recipient.email) {
      notifications.push(this.sendEmail(payment));
    }
    if (payment.recipient.app_enabled) {
      notifications.push(this.sendPushNotification(payment));
    }

    // Always send paper notification as backup
    notifications.push(this.sendMailNotification(payment));

    return Promise.all(notifications);
  }
}
```

### Implementation Checklist for GENIUS Act Compliance

#### Phase 1: Infrastructure (Before January 2025)
- [ ] Implement FedNow integration
- [ ] Set up RTP (Real-Time Payments) capability
- [ ] Create digital wallet infrastructure
- [ ] Integrate with login.gov and id.me
- [ ] Build emergency override systems

#### Phase 2: Digital Identity (Before April 2025)
- [ ] Implement NIST IAL2/AAL2 authentication
- [ ] Create biometric authentication options
- [ ] Build offline verification capability
- [ ] Set up community vouching system
- [ ] Create provisional account workflow

#### Phase 3: Payment Rails (Before July 2025)
- [ ] Complete instant payment testing
- [ ] Implement automatic failover systems
- [ ] Create disaster relief payment flows
- [ ] Build batch disbursement engine
- [ ] Test 4-hour emergency SLA

#### Phase 4: Compliance & Reporting (By July 18, 2025)
- [ ] Launch public transparency portal
- [ ] Implement real-time tracking
- [ ] Create audit trail system
- [ ] Build reporting dashboards
- [ ] Complete compliance certification

### Database Schema Extensions for GENIUS Act
```sql
-- Payment tracking for GENIUS compliance
CREATE TABLE genius_payment_tracking (
  id UUID PRIMARY KEY,
  payment_id UUID NOT NULL,
  genius_tracking_id VARCHAR(100) UNIQUE,

  -- Timing requirements
  initiated_at TIMESTAMP NOT NULL,
  settled_at TIMESTAMP,
  sla_category VARCHAR(50), -- emergency, disaster, regular
  sla_met BOOLEAN,

  -- Payment details
  payment_rail VARCHAR(50),
  amount DECIMAL(15,2),
  recipient_type VARCHAR(50), -- citizen, vendor, employee

  -- Transparency
  public_tracking_id VARCHAR(100),
  anonymized_for_public BOOLEAN DEFAULT true,

  -- Notifications
  notifications_sent JSONB,
  recipient_confirmed BOOLEAN DEFAULT false,
  confirmation_method VARCHAR(50),

  INDEX idx_tracking (genius_tracking_id),
  INDEX idx_public (public_tracking_id),
  INDEX idx_timing (initiated_at, settled_at)
);

-- Emergency disbursement queue
CREATE TABLE genius_emergency_queue (
  id UUID PRIMARY KEY,
  disaster_event_id VARCHAR(100),
  recipient_id UUID,
  amount DECIMAL(15,2),

  -- Priority and timing
  priority INTEGER DEFAULT 1, -- 1=highest
  queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  target_settlement TIMESTAMP, -- Must meet 4-hour SLA

  -- Processing status
  status VARCHAR(50) DEFAULT 'queued',
  payment_rail VARCHAR(50),
  attempts INTEGER DEFAULT 0,
  last_error TEXT,

  INDEX idx_priority_queue (priority, queued_at),
  INDEX idx_status (status, target_settlement)
);
```

---

## 🏢 Holding Company Architecture Patterns

### Hierarchical Organization Models

#### 1. **Simple Holding Structure**
```
Acme Holdings (Holding Company)
├── Acme Manufacturing LLC (Subsidiary)
├── Acme Logistics Inc (Subsidiary)
└── Acme Technology Corp (Subsidiary)
```

#### 2. **Complex Multi-Level Structure**
```
Global Corp (Ultimate Parent)
├── Americas Holdings (Regional Holding)
│   ├── US Operations LLC
│   │   ├── US East Division
│   │   └── US West Division
│   └── Canada Operations Ltd
└── EMEA Holdings (Regional Holding)
    ├── UK Operations Ltd
    └── Germany GmbH
```

### Implementation Examples

#### Organization Setup
```javascript
// Creating organization hierarchy
const organizations = [
  {
    id: 'org_001',
    parent_id: null,
    org_type: 'holding',
    org_code: 'ACME-HOLD',
    name: 'Acme Holdings LLC',
    path_ids: [],
    hierarchy_level: 0,
    metadata: {
      consolidated_reporting: true,
      fiscal_year_end: '12-31',
      reporting_currency: 'USD'
    }
  },
  {
    id: 'org_002',
    parent_id: 'org_001',
    org_type: 'subsidiary',
    org_code: 'ACME-MFG',
    name: 'Acme Manufacturing',
    path_ids: ['org_001'],
    hierarchy_level: 1,
    metadata: {
      industry: 'manufacturing',
      erp_system: 'SAP',
      company_code: '1000'
    }
  },
  {
    id: 'org_003',
    parent_id: 'org_001',
    org_type: 'subsidiary',
    org_code: 'ACME-LOG',
    name: 'Acme Logistics',
    path_ids: ['org_001'],
    hierarchy_level: 1,
    metadata: {
      industry: 'logistics',
      erp_system: 'Oracle',
      company_code: '2000'
    }
  }
];
```

### Data Access Patterns

#### 1. **Customer Sharing Across Group**
```sql
-- Customers visible to all subsidiaries under holding company
SELECT c.*
FROM customers c
WHERE c.holding_company_id = 'org_001'
  AND (
    c.shared_across_group = true
    OR c.organization_id = 'current_org_id'
    OR 'current_org_id' = ANY(c.visible_to_orgs)
  );
```

#### 2. **Consolidated Reporting**
```sql
-- Group-level invoice summary
SELECT
  o.name as company_name,
  o.org_type,
  COUNT(i.id) as invoice_count,
  SUM(i.amount) as total_amount,
  i.currency
FROM invoices i
JOIN organizations o ON i.organization_id = o.id
WHERE i.holding_company_id = 'org_001'
  AND i.status = 'paid'
  AND i.created_at >= '2025-01-01'
GROUP BY o.name, o.org_type, i.currency
ORDER BY o.hierarchy_level, o.name;
```

#### 3. **Inter-Company Transactions**
```sql
-- Track inter-company invoices
SELECT
  o1.name as from_company,
  o2.name as to_company,
  i.invoice_number,
  i.amount,
  i.consolidation_status
FROM invoices i
JOIN organizations o1 ON i.from_org_id = o1.id
JOIN organizations o2 ON i.to_org_id = o2.id
WHERE i.is_intercompany = true
  AND i.holding_company_id = 'org_001';
```

### Service Layer Implementation

```javascript
class OrganizationService {
  // Get complete org hierarchy
  async getOrganizationTree(holdingCompanyId) {
    const orgs = await db.organizations.findAll({
      where: {
        [Op.or]: [
          { id: holdingCompanyId },
          { path_ids: { [Op.contains]: [holdingCompanyId] } }
        ]
      },
      order: [['hierarchy_level', 'ASC'], ['name', 'ASC']]
    });

    return this.buildTree(orgs);
  }

  // Check if user can access customer across subsidiaries
  async canAccessCustomer(userId, customerId, currentOrgId) {
    const customer = await db.customers.findById(customerId);

    // Check access rules
    if (customer.shared_across_group) return true;
    if (customer.organization_id === currentOrgId) return true;
    if (customer.visible_to_orgs.includes(currentOrgId)) return true;

    // Check if same holding company
    const userOrg = await db.organizations.findById(currentOrgId);
    return userOrg.holding_company_id === customer.holding_company_id;
  }

  // Create inter-company invoice
  async createInterCompanyInvoice(fromOrgId, toOrgId, invoiceData) {
    // Verify both orgs are in same group
    const [fromOrg, toOrg] = await Promise.all([
      db.organizations.findById(fromOrgId),
      db.organizations.findById(toOrgId)
    ]);

    const holdingId = this.getCommonHoldingCompany(fromOrg, toOrg);
    if (!holdingId) {
      throw new Error('Organizations not in same group');
    }

    return await db.invoices.create({
      ...invoiceData,
      organization_id: fromOrgId,
      holding_company_id: holdingId,
      is_intercompany: true,
      from_org_id: fromOrgId,
      to_org_id: toOrgId,
      consolidation_status: 'pending'
    });
  }
}
```

### Multi-Company Configuration Management

```javascript
// Per-organization ERP configuration
const orgConfigurations = {
  'org_002': {  // Manufacturing subsidiary
    erp_system: 'SAP',
    customer_fields: {
      'KUNNR': 'customer_code',
      'BUKRS': 'company_code',
      'VKORG': 'sales_org'
    },
    invoice_fields: {
      'BELNR': 'document_number',
      'KOSTL': 'cost_center'
    }
  },
  'org_003': {  // Logistics subsidiary
    erp_system: 'Oracle',
    customer_fields: {
      'CUSTOMER_NUMBER': 'customer_id',
      'ORG_ID': 'organization_id',
      'SITE_USE_ID': 'site_id'
    }
  }
};
```

---

## 📊 Data Storage Strategies

### 1. **Core + JSONB Pattern** (RECOMMENDED) ✅
**Best for**: PostgreSQL environments, moderate customization needs

#### Advantages:
- Native JSON query support with indexes
- Schema validation at application layer
- Easy to query with PostgreSQL JSON operators
- Good performance with proper indexing
- Maintains relational integrity for core fields

#### Implementation:
```sql
-- Example customer table
CREATE TABLE customers (
  -- Core fields (same for all enterprises)
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enterprise_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',

  -- Enterprise-specific data
  erp_data JSONB DEFAULT '{}',

  -- Indexing for performance
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes on JSONB fields
CREATE INDEX idx_customers_erp_data ON customers USING GIN (erp_data);
CREATE INDEX idx_customers_enterprise ON customers(enterprise_id);

-- Example queries
-- Find customers with specific ERP field
SELECT * FROM customers
WHERE enterprise_id = 'enterprise_123'
AND erp_data->>'customer_code' = 'CUST001';

-- Search nested JSON
SELECT * FROM customers
WHERE erp_data->'address'->>'region' = 'EMEA';
```

### 2. **EAV (Entity-Attribute-Value) Pattern**
**Best for**: Extreme flexibility, unlimited custom fields

#### Structure:
```sql
customer_attributes (
  id,
  customer_id,
  enterprise_id,
  attribute_key,
  attribute_value,
  attribute_type,
  INDEX (customer_id, attribute_key)
)
```

#### Pros:
- Ultimate flexibility
- Easy to add new attributes

#### Cons:
- Complex queries
- Poor performance at scale
- Difficult reporting

### 3. **Schema-per-Tenant**
**Best for**: Large enterprises with complex requirements

#### Pros:
- Complete isolation
- Custom indexes per tenant
- Optimal performance

#### Cons:
- Complex deployment
- Higher maintenance
- Difficult cross-tenant operations

---

## 🔄 Enterprise Configuration Management

### Schema Mapping Configuration
Store per-enterprise field mappings and validation rules:

```javascript
// Enterprise configuration document
{
  "enterprise_id": "ent_123",
  "erp_system": "SAP",
  "customer_mapping": {
    "fields": [
      {
        "erp_field": "KUNNR",
        "monay_field": "customer_code",
        "type": "string",
        "required": true,
        "max_length": 10
      },
      {
        "erp_field": "KTOKD",
        "monay_field": "account_group",
        "type": "string",
        "validation": "^[A-Z]{4}$"
      },
      {
        "erp_field": "BUKRS",
        "monay_field": "company_code",
        "type": "string",
        "required": true
      }
    ],
    "custom_fields": [
      {
        "name": "cost_center",
        "type": "string",
        "required": false,
        "ui_label": "Cost Center"
      },
      {
        "name": "profit_center",
        "type": "string",
        "validation": "^PC[0-9]{6}$"
      }
    ]
  },
  "invoice_mapping": {
    "header_fields": [...],
    "line_item_fields": [
      {
        "erp_field": "MATNR",
        "monay_field": "material_number",
        "type": "string"
      },
      {
        "erp_field": "KOSTL",
        "monay_field": "cost_center",
        "type": "string"
      }
    ]
  }
}
```

---

## 💾 Implementation Examples

### 1. Customer Storage with Enterprise-Specific Fields

```javascript
// Service layer implementation
class CustomerService {
  async createCustomer(enterpriseId, customerData) {
    // Get enterprise configuration
    const config = await this.getEnterpriseConfig(enterpriseId);

    // Separate core and custom fields
    const coreFields = this.extractCoreFields(customerData);
    const customFields = this.extractCustomFields(customerData, config);

    // Validate against enterprise schema
    this.validateCustomFields(customFields, config.customer_mapping);

    // Store in database
    const customer = await db.customers.create({
      ...coreFields,
      enterprise_id: enterpriseId,
      erp_data: customFields,
      erp_system: config.erp_system
    });

    return customer;
  }

  async syncFromERP(enterpriseId, erpCustomerData) {
    const config = await this.getEnterpriseConfig(enterpriseId);

    // Transform ERP data based on mapping
    const transformedData = this.transformERPData(
      erpCustomerData,
      config.customer_mapping
    );

    // Upsert customer
    return await this.upsertCustomer(enterpriseId, transformedData);
  }
}
```

### 2. Invoice Storage with Flexible Line Items

```javascript
// Invoice with variable line items
const invoiceData = {
  // Core fields
  invoice_number: "INV-2025-001",
  customer_id: "cust_123",
  amount: 10000.00,
  due_date: "2025-02-28",

  // Enterprise-specific header fields
  erp_data: {
    purchase_order: "PO-456789",
    contract_number: "CTR-2025-100",
    billing_period: "2025-Q1",
    department_code: "DEPT-IT"
  },

  // Flexible line items structure
  line_items: [
    {
      description: "Professional Services",
      quantity: 10,
      unit_price: 1000.00,
      // Enterprise-specific line item fields
      cost_center: "CC-1234",
      gl_account: "6100-000",
      project_code: "PROJ-2025-050",
      tax_code: "VAT-20"
    }
  ]
};
```

---

## 🔍 Querying Strategies

### 1. PostgreSQL JSONB Queries

```sql
-- Find all invoices with specific cost center
SELECT * FROM invoices
WHERE enterprise_id = 'ent_123'
AND line_items @> '[{"cost_center": "CC-1234"}]';

-- Aggregate by custom field
SELECT
  erp_data->>'department_code' as department,
  SUM(amount) as total
FROM invoices
WHERE enterprise_id = 'ent_123'
GROUP BY erp_data->>'department_code';

-- Complex nested query
SELECT c.*, i.*
FROM customers c
JOIN invoices i ON i.customer_id = c.id
WHERE c.enterprise_id = 'ent_123'
AND c.erp_data->>'region' = 'APAC'
AND i.erp_data->>'project_code' LIKE 'PROJ-2025%';
```

### 2. Application-Level Querying

```javascript
// Repository pattern with JSON filtering
class CustomerRepository {
  async findByERPField(enterpriseId, field, value) {
    return await db.customers.findAll({
      where: {
        enterprise_id: enterpriseId,
        [`erp_data.${field}`]: value
      }
    });
  }

  async searchCustomFields(enterpriseId, criteria) {
    const query = {
      enterprise_id: enterpriseId
    };

    // Build dynamic JSONB query
    Object.keys(criteria).forEach(key => {
      query[`erp_data.${key}`] = criteria[key];
    });

    return await db.customers.findAll({ where: query });
  }
}
```

---

## 🎛️ Performance Optimization

### 1. Indexing Strategies

```sql
-- Functional indexes for frequently queried fields
CREATE INDEX idx_customer_code ON customers
  ((erp_data->>'customer_code'))
  WHERE enterprise_id = 'frequently_used_enterprise';

-- GIN index for full JSONB search
CREATE INDEX idx_erp_data_gin ON customers
  USING GIN (erp_data);

-- Composite index for common queries
CREATE INDEX idx_enterprise_status ON customers
  (enterprise_id, status);
```

### 2. Materialized Views for Reporting

```sql
-- Create materialized view for enterprise-specific reporting
CREATE MATERIALIZED VIEW enterprise_customer_summary AS
SELECT
  enterprise_id,
  erp_data->>'region' as region,
  erp_data->>'customer_type' as customer_type,
  COUNT(*) as customer_count,
  SUM((erp_data->>'credit_limit')::numeric) as total_credit
FROM customers
GROUP BY enterprise_id,
         erp_data->>'region',
         erp_data->>'customer_type';

-- Refresh periodically
REFRESH MATERIALIZED VIEW enterprise_customer_summary;
```

---

## 🔐 Data Validation & Integrity

### 1. Schema Validation Service

```javascript
class SchemaValidationService {
  validateERPData(data, schema) {
    const errors = [];

    // Check required fields
    schema.required_fields.forEach(field => {
      if (!data[field]) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Validate field types and patterns
    Object.keys(data).forEach(key => {
      const fieldSchema = schema.fields[key];
      if (fieldSchema) {
        if (fieldSchema.type && typeof data[key] !== fieldSchema.type) {
          errors.push(`Invalid type for ${key}`);
        }
        if (fieldSchema.pattern && !fieldSchema.pattern.test(data[key])) {
          errors.push(`Invalid format for ${key}`);
        }
      }
    });

    return errors;
  }
}
```

### 2. Database Constraints

```sql
-- Check constraints for JSONB data
ALTER TABLE customers ADD CONSTRAINT check_erp_data_structure
  CHECK (
    jsonb_typeof(erp_data) = 'object'
  );

-- Trigger for validation
CREATE OR REPLACE FUNCTION validate_erp_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate based on enterprise configuration
  IF NEW.erp_system = 'SAP' THEN
    IF NOT NEW.erp_data ? 'customer_code' THEN
      RAISE EXCEPTION 'SAP customers require customer_code';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_erp_data_trigger
  BEFORE INSERT OR UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION validate_erp_data();
```

---

## 📋 Migration Strategy

### From Existing ERP Systems

```javascript
class ERPMigrationService {
  async migrateEnterprise(enterpriseId, erpConnection) {
    // 1. Fetch ERP schema
    const erpSchema = await this.fetchERPSchema(erpConnection);

    // 2. Generate mapping configuration
    const mapping = await this.generateMapping(erpSchema);

    // 3. Store configuration
    await this.saveEnterpriseConfig(enterpriseId, mapping);

    // 4. Migrate data in batches
    await this.batchMigrate(enterpriseId, erpConnection, mapping);
  }

  async batchMigrate(enterpriseId, erpConnection, mapping) {
    const batchSize = 1000;
    let offset = 0;

    while (true) {
      const erpData = await erpConnection.query(
        `SELECT * FROM customers LIMIT ${batchSize} OFFSET ${offset}`
      );

      if (erpData.length === 0) break;

      const transformedData = erpData.map(row =>
        this.transformRow(row, mapping)
      );

      await this.bulkInsert(enterpriseId, transformedData);
      offset += batchSize;
    }
  }
}
```

---

## 🏭 Holding Company Features

### 1. **Multi-Company Wallet Management**
```javascript
// Wallet hierarchy matching organization hierarchy
const walletStructure = {
  holding_wallet: {
    id: 'wallet_holding_001',
    organization_id: 'org_001',
    type: 'treasury',
    balance: 10000000,

    subsidiary_wallets: [
      {
        id: 'wallet_sub_001',
        organization_id: 'org_002',
        type: 'operational',
        balance: 2000000,
        spending_limit: 500000
      },
      {
        id: 'wallet_sub_002',
        organization_id: 'org_003',
        type: 'operational',
        balance: 1500000,
        spending_limit: 300000
      }
    ]
  }
};
```

### 2. **Cross-Company Customer Management**
```sql
-- View for group-wide customer visibility
CREATE VIEW group_customers AS
SELECT DISTINCT
  c.*,
  o.name as owning_company,
  ho.name as holding_company_name,
  CASE
    WHEN c.shared_across_group THEN 'Group Shared'
    WHEN array_length(c.visible_to_orgs, 1) > 1 THEN 'Limited Sharing'
    ELSE 'Company Private'
  END as visibility_level
FROM customers c
JOIN organizations o ON c.organization_id = o.id
LEFT JOIN organizations ho ON c.holding_company_id = ho.id;
```

### 3. **Consolidated Financial Reporting**
```javascript
class ConsolidationService {
  async generateGroupFinancials(holdingCompanyId, period) {
    // Get all subsidiaries
    const subsidiaries = await this.getSubsidiaries(holdingCompanyId);

    // Collect financial data
    const financials = await Promise.all(
      subsidiaries.map(sub => this.getSubsidiaryFinancials(sub.id, period))
    );

    // Eliminate inter-company transactions
    const consolidated = this.eliminateInterCompany(financials);

    // Apply consolidation rules
    return this.applyConsolidationRules(consolidated, holdingCompanyId);
  }

  async eliminateInterCompany(financials) {
    // Remove inter-company invoices from consolidation
    const interCompanyInvoices = await db.invoices.findAll({
      where: { is_intercompany: true }
    });

    // Adjust totals
    return financials.map(f => {
      f.revenue -= f.intercompanyRevenue;
      f.expenses -= f.intercompanyExpenses;
      return f;
    });
  }
}
```

### 4. **Access Control & Permissions**
```javascript
// Role-based access for holding company structure
const rolePermissions = {
  'holding_admin': {
    view: ['all_companies', 'all_customers', 'all_invoices'],
    edit: ['all_companies', 'shared_customers'],
    create: ['subsidiaries', 'group_policies'],
    financial: ['consolidation', 'inter_company']
  },
  'subsidiary_admin': {
    view: ['own_company', 'shared_customers'],
    edit: ['own_customers', 'own_invoices'],
    create: ['customers', 'invoices'],
    financial: ['own_reports']
  },
  'subsidiary_user': {
    view: ['own_customers', 'own_invoices'],
    edit: ['assigned_customers'],
    create: ['invoices']
  }
};
```

### 5. **API Endpoints for Multi-Company Operations**
```javascript
// Group-level APIs
router.get('/api/holdings/:holdingId/subsidiaries');
router.get('/api/holdings/:holdingId/customers'); // All group customers
router.get('/api/holdings/:holdingId/consolidated-report');
router.post('/api/holdings/:holdingId/inter-company-invoice');

// Subsidiary-specific with group context
router.get('/api/organizations/:orgId/customers?includeShared=true');
router.get('/api/organizations/:orgId/accessible-customers');
router.post('/api/organizations/:orgId/share-customer');
```

---

## 🎯 Recommendations

### For Monay CaaS Platform:

1. **Use Core + JSONB Pattern** ✅
   - Best balance of flexibility and performance
   - Native PostgreSQL support
   - Easy to query and index

2. **Store Enterprise Configuration Separately**
   - Maintain mapping configurations in dedicated tables
   - Version control for schema changes
   - API-driven configuration updates

3. **Implement Validation Layer**
   - Application-level schema validation
   - Database triggers for critical constraints
   - API validation before storage

4. **Create Enterprise-Specific APIs**
   ```javascript
   // Dynamic API based on configuration
   GET /api/enterprises/{id}/customers?custom_field=value
   POST /api/enterprises/{id}/customers/validate
   GET /api/enterprises/{id}/schema
   ```

5. **Monitoring & Optimization**
   - Monitor JSONB query performance
   - Create indexes for frequently accessed fields
   - Use materialized views for reporting

---

## 📊 Example Enterprise Configurations

### SAP Integration
```json
{
  "customer_fields": {
    "KUNNR": "customer_code",
    "NAME1": "name",
    "STRAS": "street_address",
    "KTOKD": "account_group",
    "BUKRS": "company_code"
  }
}
```

### Oracle EBS Integration
```json
{
  "customer_fields": {
    "CUSTOMER_NUMBER": "customer_id",
    "CUSTOMER_NAME": "name",
    "CUSTOMER_CLASS_CODE": "classification",
    "CREDIT_LIMIT": "credit_limit"
  }
}
```

### NetSuite Integration
```json
{
  "customer_fields": {
    "entityid": "customer_code",
    "companyname": "company_name",
    "custentity_region": "region",
    "creditlimit": "credit_limit"
  }
}
```

---

## 🚀 Implementation Timeline

1. **Week 1**: Design enterprise configuration schema
2. **Week 2**: Implement Core + JSONB tables
3. **Week 3**: Build validation and mapping services
4. **Week 4**: Create sync APIs and webhooks
5. **Week 5**: Testing with sample enterprise data
6. **Week 6**: Performance optimization and indexing

---

*Last Updated: 2025-01-21*
*Version: 1.0*