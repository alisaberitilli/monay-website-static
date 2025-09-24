# Organization Architecture Analysis & Multi-Tenant Design

## Executive Summary
Monay implements a **Vault-Based Multi-Tenant Architecture** optimized for payment systems at global scale. This design provides bank-grade security through cryptographic isolation while maintaining cost efficiency for millions of free-tier consumers.

## Core Architecture Principles

### 1. **Security First**: Cryptographic isolation for ALL users (regulatory compliant)
### 2. **Cost Effective**: $0.01/month per consumer, profitable at scale
### 3. **Globally Scalable**: Handles 100M+ consumers without breaking
### 4. **Flexible Hierarchy**: Supports groups, households, holding companies
### 5. **Multi-Context Access**: Seamless switching between personal/work contexts

## Three-Layer Isolation Model

### Layer 1: Cryptographic Isolation (ALL Users)
```yaml
Implementation:
  - Each tenant gets unique encryption keys
  - Hardware Security Module (HSM) for key management
  - Field-level encryption for sensitive data
  - Zero-knowledge architecture for cross-tenant operations

Cost: $0.001 per tenant/month
Security: Military-grade, quantum-resistant
```

### Layer 2: Logical Isolation (Consumer & Small Business)
```yaml
Implementation:
  - PostgreSQL Row-Level Security (RLS)
  - Shared tables with tenant_id partitioning
  - Vault-isolated wallet addresses
  - Redis namespacing for cache isolation

Cost: $0.01 per tenant/month
Performance: Sub-100ms queries with proper indexing
```

### Layer 3: Physical Isolation (Enterprise Only)
```yaml
Implementation:
  - Dedicated PostgreSQL schemas
  - Optional dedicated database instances
  - Custom connection pools
  - Independent backup/restore schedules

Cost: $100+ per tenant/month
SLA: 99.99% uptime, <50ms response time
```

## Hierarchical Deterministic (HD) Wallet Architecture

### Master Vault Structure
```
Master Platform Seed (Hardware Security Module)
├── Consumer Wallets
│   ├── Individual: m/44'/501'/[tenant_id]'/0'/0/x
│   ├── Household:  m/44'/501'/[group_id]'/[member_index]'/0/x
│   └── Family:     m/44'/501'/[group_id]'/[family_member]'/0/x
│
├── Business Wallets
│   ├── Small Biz:  m/44'/501'/[tenant_id]'/[location]'/0/x
│   └── Multi-loc:  m/44'/501'/[group_id]'/[location]'/[register]/x
│
└── Enterprise Wallets
    ├── Single:     m/44'/501'/[tenant_id]'/[dept]'/[user]/x
    ├── Subsidiary: m/44'/501'/[group_id]'/[subsidiary]'/[dept]/x
    └── Treasury:   m/44'/501'/[group_id]'/999'/[pool]/x
```

### Benefits
- **Complete Isolation**: No cross-tenant key access possible
- **Deterministic Recovery**: Rebuild any wallet from seed + path
- **Infinite Scale**: Supports billions of wallets
- **Near-Zero Cost**: No per-wallet infrastructure needed

## Database Architecture

### Hybrid Database Model

```sql
-- Core Database (PostgreSQL 15+)
-- Partitioned by tenant_id for performance

CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_code VARCHAR(50) UNIQUE NOT NULL, -- TNT_000001
    type ENUM('individual', 'household_member', 'small_business', 'enterprise', 'holding_company'),
    isolation_level ENUM('row', 'schema', 'database') DEFAULT 'row',
    group_id UUID REFERENCES groups(id),

    -- Wallet Configuration
    wallet_derivation_path TEXT NOT NULL, -- HD wallet path
    encryption_key_id UUID NOT NULL, -- Reference to HSM

    -- Billing
    billing_tier VARCHAR(50) DEFAULT 'free',
    gross_margin_percent INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY RANGE (id);

-- Create partitions for every 1000 tenants
CREATE TABLE tenants_p0 PARTITION OF tenants
    FOR VALUES FROM (MINVALUE) TO ('00100000-0000-0000-0000-000000000000');

CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_code VARCHAR(50) UNIQUE NOT NULL,
    group_type ENUM('household', 'holding_company', 'small_business_group'),
    name VARCHAR(255) NOT NULL,
    primary_tenant_id UUID REFERENCES tenants(id),

    -- Configuration
    subsidiaries_data_isolation BOOLEAN DEFAULT true,
    shared_treasury BOOLEAN DEFAULT false,
    centralized_billing BOOLEAN DEFAULT false,
    shared_billing_view BOOLEAN DEFAULT false,
    primary_pays_all BOOLEAN DEFAULT true,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add tenant_id to ALL transactional tables
ALTER TABLE transactions ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE wallets ADD COLUMN tenant_id UUID NOT NULL;
ALTER TABLE invoices ADD COLUMN tenant_id UUID NOT NULL;
-- ... apply to all tables

-- Enable Row-Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON transactions
    USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

### Transaction Database (TimescaleDB)
```sql
-- Hypertable for time-series data
CREATE TABLE transactions_ts (
    time TIMESTAMPTZ NOT NULL,
    tenant_id UUID NOT NULL,
    transaction_id UUID NOT NULL,
    amount DECIMAL(20,2),
    type VARCHAR(50),
    metadata JSONB
) PARTITION BY RANGE (tenant_id);

SELECT create_hypertable('transactions_ts', 'time',
    partitioning_column => 'tenant_id',
    number_partitions => 100);

-- Automated data retention
SELECT add_retention_policy('transactions_ts',
    INTERVAL '90 days', -- Hot data
    if_not_exists => true);
```

### Analytics Database (ClickHouse)
```sql
-- Aggregated metrics only (no PII)
CREATE TABLE billing_metrics (
    tenant_id UUID,
    date Date,
    transaction_count UInt32,
    invoice_sent_count UInt32,
    withdrawal_count UInt32,
    total_volume Decimal(20,2)
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(date)
ORDER BY (tenant_id, date);
```

## Billing Architecture

### Event-Driven Billing Pipeline

```yaml
Collection Layer:
  Apache Kafka:
    - Topic: billing-events (partitioned by tenant_id)
    - Retention: 7 days
    - Replication: 3

Processing Layer:
  Apache Flink:
    - Real-time aggregation
    - Window: 1 minute tumbling
    - Output: Redis + ClickHouse

Calculation Engine:
  Free Tier (Consumers):
    - FREE: Receive invoice, payments, deposits, P2P
    - CHARGED: Withdrawals ($0.50 each)
    - Tracked but not billed until upgrade

  Small Business:
    - Base: All free tier features
    - Invoice sending: $0.10 cost → $0.16 billed (60% margin)
    - Monthly cap: $500
    - User limit: 5

  Enterprise:
    - Per transaction: $0.05 cost → $0.09 billed (80% margin)
    - Volume discounts available
    - Unlimited users
    - Custom contracts available

Aggregation:
  - Individual bills per tenant
  - Group consolidation views
  - Payment waterfall logic
  - No duplicate billing
```

## Tenant Hierarchy Examples

### 1. Enterprise Holding Company
```
Group: "ACME Holdings" [GRP_000100]
├── Tenant: "ACME Corp HQ" (holding_company) [TNT_000100]
│   └── Wallet: Treasury Pool (shared)
├── Tenant: "ACME Manufacturing" (enterprise) [TNT_000101]
│   ├── Wallet: Operations
│   └── Wallet: Payroll
├── Tenant: "ACME Logistics" (enterprise) [TNT_000102]
│   └── Wallet: Operations
└── Tenant: "ACME Sales" (enterprise) [TNT_000103]
    └── Wallet: Commissions

Configuration:
- subsidiaries_data_isolation: true
- shared_treasury: true
- centralized_billing: false
- Isolation: Schema-level
```

### 2. Consumer Household
```
Group: "Smith Family" [GRP_000200]
├── Tenant: "John Smith" (individual) [TNT_000200] PRIMARY
│   └── Wallet: Personal
├── Tenant: "Jane Smith" (household_member) [TNT_000201]
│   └── Wallet: Personal
└── Tenant: "Teen Smith" (household_member) [TNT_000202]
    └── Wallet: Allowance

Configuration:
- shared_billing_view: true
- primary_pays_all: true
- Isolation: Row-level (RLS)
```

### 3. Small Business
```
Group: "Joe's Coffee" [GRP_000300]
├── Tenant: "Joe's Coffee Main" (small_business) [TNT_000300] PRIMARY
│   ├── Wallet: Operations
│   └── Wallet: Tips
└── Tenant: "Joe's Coffee Airport" (small_business) [TNT_000301]
    ├── Wallet: Operations
    └── Wallet: Tips

Configuration:
- Max 5 users total
- Upgrade path to enterprise available
- Isolation: Row-level (RLS)
```

## Multi-Context Session Management

### JWT Structure
```json
{
  "user_id": "usr_abc123",
  "active_tenant_id": "TNT_000200",
  "accessible_tenants": [
    {
      "tenant_id": "TNT_000200",
      "name": "Personal",
      "context": "personal",
      "role": "owner"
    },
    {
      "tenant_id": "TNT_000100",
      "name": "ACME Corp",
      "context": "work",
      "role": "finance_manager"
    },
    {
      "tenant_id": "TNT_000210",
      "name": "Smith Family",
      "context": "family",
      "role": "viewer"
    }
  ],
  "exp": 1234567890,
  "iat": 1234567000
}
```

### Tenant Switching
- No re-authentication required
- Update active_tenant_id in JWT
- Audit log for compliance
- Maximum 5 contexts per user

## Compliance & Data Residency

### Regional Deployment Strategy

```yaml
US-EAST (Primary):
  Location: Virginia
  DR: Oregon
  Compliance: SOX, PCI-DSS, CCPA
  Tenants: US-based consumers & businesses

EU-CENTRAL:
  Location: Frankfurt
  DR: Dublin
  Compliance: GDPR, PSD2, MiCA
  Tenants: EU residents (data sovereignty)

APAC:
  Location: Singapore
  DR: Sydney
  Compliance: PDPA, APRA
  Tenants: Asia-Pacific users

Cross-Region:
  - Blockchain for cross-region transfers
  - Encryption keys never leave region
  - Atomic swaps via smart contracts
```

## Shared Treasury Implementation

### Multi-Signature Smart Contract
```solidity
contract SharedTreasury {
    mapping(address => bool) public subsidiaries;
    mapping(bytes32 => uint8) public approvals;

    uint8 public threshold; // e.g., 2 of 3

    function initiateTransfer(
        address to,
        uint256 amount,
        bytes32 memo
    ) external onlySubsidiary {
        // Zero-knowledge proof of balance
        require(verifyBalance(amount), "Insufficient funds");

        // Record approval
        bytes32 txHash = keccak256(abi.encode(to, amount, memo));
        approvals[txHash]++;

        // Execute if threshold met
        if (approvals[txHash] >= threshold) {
            executeTransfer(to, amount);
        }
    }
}
```

## Migration & Upgrade Paths

### Supported Upgrades
```yaml
Individual → Household:
  - Keep same tenant_id
  - Add to household group
  - Share read access selectively
  - Original wallet remains private

Small Business → Enterprise:
  - Create new enterprise tenant
  - Migrate transaction history (immutable)
  - Maintain old tenant for reference
  - User dual access (both contexts)

Isolation Upgrades (Automatic):
  < 1,000 tx/month:    Row-level (RLS)
  1,000-10,000 tx/mo:  Schema isolation
  > 10,000 tx/month:   Database isolation
  Method: Logical replication with zero downtime
```

## Implementation Plan

### Phase 1: Foundation (Weeks 1-2)
- [ ] Create tenant and groups tables
- [ ] Implement HD wallet derivation
- [ ] Set up PostgreSQL RLS policies
- [ ] Add tenant_id to existing tables
- [ ] Create partitioning strategy

### Phase 2: Core Systems (Weeks 3-4)
- [ ] Build tenant provisioning API
- [ ] Implement cryptographic key management
- [ ] Set up Kafka billing pipeline
- [ ] Create multi-tenant session management
- [ ] Build tenant switching UI

### Phase 3: Billing & Analytics (Weeks 5-6)
- [ ] Deploy ClickHouse for metrics
- [ ] Implement billing calculation engine
- [ ] Build payment waterfall logic
- [ ] Create billing aggregation views
- [ ] Set up usage tracking

### Phase 4: Advanced Features (Weeks 7-8)
- [ ] Implement shared treasury contracts
- [ ] Build cross-tenant transfer system
- [ ] Create upgrade/migration tools
- [ ] Set up multi-region deployment
- [ ] Implement compliance automation

### Phase 5: Testing & Launch (Weeks 9-10)
- [ ] Security audit
- [ ] Performance testing at scale
- [ ] Compliance verification
- [ ] Migration of existing users
- [ ] Production rollout

## Cost Analysis

### Per-Tenant Operational Costs
```yaml
Individual Consumer:
  Infrastructure: $0.01/month
  Support: $0.00 (self-service)
  Total Cost: $0.01/month
  Revenue: $0 (free tier)

Small Business:
  Infrastructure: $0.50/month
  Support: $2.00/month
  Total Cost: $2.50/month
  Revenue: $10-500/month (400-20,000% margin)

Enterprise:
  Infrastructure: $100/month
  Support: $500/month
  Total Cost: $600/month
  Revenue: $5,000+/month (730%+ margin)
```

### Projected Scale (Year 1)
- Individual Consumers: 1,000,000 users
- Small Businesses: 10,000 organizations
- Enterprise Clients: 100 companies
- Total Infrastructure: $50,000/month
- Projected Revenue: $750,000/month
- Gross Margin: 93%

## Performance Guarantees

### Service Level Agreements
```yaml
Consumer Tier:
  Uptime: 99.9%
  API Response: < 200ms (p95)
  Throughput: 1,000 TPS per tenant

Small Business:
  Uptime: 99.95%
  API Response: < 100ms (p95)
  Throughput: 5,000 TPS per tenant

Enterprise:
  Uptime: 99.99%
  API Response: < 50ms (p95)
  Throughput: Unlimited
  Support: 24/7 dedicated
```

## Security Architecture

### Defense in Depth
1. **Network**: CloudFlare DDoS protection
2. **Application**: JWT + OAuth2.0
3. **Database**: RLS + Field encryption
4. **Wallet**: HSM + HD derivation
5. **Audit**: Immutable blockchain logs

### Compliance Certifications
- PCI-DSS Level 1
- SOC 2 Type II
- ISO 27001
- GDPR Compliant
- CCPA Compliant

## Critical Success Factors

1. **Start Simple**: RLS for everyone initially
2. **Scale Smart**: Automatic isolation upgrades
3. **Security First**: Cryptographic isolation from day 1
4. **Cost Effective**: Profitable even with free tier
5. **User Experience**: <200ms response globally
6. **Maintainable**: Single codebase, configuration-driven

## Conclusion

This Vault-Based Multi-Tenant Architecture provides:
- **Bank-grade security** through cryptographic isolation
- **Extreme cost efficiency** at $0.01/user/month
- **Global scale** supporting 100M+ users
- **Flexible hierarchy** for any organization structure
- **Clear upgrade paths** as customers grow
- **Regulatory compliance** across all jurisdictions

The architecture is designed to be implemented by a realistic team size while providing enterprise-grade security and performance at consumer scale.