# Billing Model Evaluation for Monay Platform

## Current Billing Structure (From Migrations)

### 1. Event-Based Billing (Current Implementation)
From `005_billing_infrastructure.sql`:

#### Event Types Tracked:
- `transaction` - Each blockchain transaction
- `invoice_sent` - Sending invoices
- `invoice_received` - Receiving invoices
- `withdrawal` - Money withdrawals
- `deposit` - Money deposits
- `card_payment` - Card transactions
- `ach_transfer` - ACH transfers
- `wire_transfer` - Wire transfers
- `api_call` - API usage
- `storage_usage` - Data storage
- `user_added` - Adding users to organization
- `card_issued` - Issuing new cards
- `kyc_verification` - KYC checks

#### Cost Structure:
```sql
-- From cost_configuration table
base_cost_cents + (quantity * per_unit_cost_cents) = total_cost
+ margin_percent (60-80%) = final_price
```

### 2. Tier-Based Pricing

#### Free Tier (Consumers):
- **Cost**: $0.01/month infrastructure
- **Margin**: 0% (no billing)
- **Free Services**: Receive invoices, payments, deposits, P2P
- **Charged**: Withdrawals ($0.50 each) - but not collected until upgrade

#### Small Business:
- **Base Cost**: ~$2.50/month
- **Margin**: 60%
- **Billed**: $10-500/month
- **Per Transaction Costs**:
  - Invoice sending: $0.10 cost → $0.16 billed
  - Transactions: $0.05 cost → $0.08 billed

#### Enterprise:
- **Base Cost**: ~$600/month
- **Margin**: 80%
- **Billed**: $5,000+/month
- **Per Transaction Costs**:
  - Transactions: $0.03 cost → $0.054 billed
  - API calls: $0.01 cost → $0.018 billed

## Key Questions to Address

### 1. What Should We Actually Bill For?

#### Option A: Transaction-Based (Current)
**Pros:**
- Simple to understand
- Direct correlation to usage
- Easy to track

**Cons:**
- Doesn't capture computational complexity
- Same price for simple vs complex transactions
- No differentiation for smart contract interactions

#### Option B: Computation-Based
**Components to Track:**
- **Gas Used** (for blockchain operations)
- **CPU Cycles** (for processing)
- **Memory Usage** (for temporary storage)
- **Network Bandwidth** (data transfer)
- **Storage** (persistent data)

**Pricing Model:**
```
Cost = (Gas * Gas_Price) +
       (CPU_Seconds * CPU_Rate) +
       (Memory_GB_Hours * Memory_Rate) +
       (Bandwidth_GB * Transfer_Rate) +
       (Storage_GB_Month * Storage_Rate)
```

#### Option C: Token-Based (Like AI Services)
**Components:**
- **Input Tokens**: Data sent to process
- **Output Tokens**: Results returned
- **Processing Tokens**: Computational units used

**Example Pricing:**
```
Simple Transfer: 100 tokens
Smart Contract Call: 500 tokens
Cross-Chain Transfer: 1,000 tokens
Complex DeFi Operation: 5,000 tokens

Price: $0.00001 per token (adjustable by tier)
```

### 2. How to Calculate Actual Costs?

#### Infrastructure Costs to Consider:

**Blockchain Costs:**
- Solana: ~$0.00025 per transaction
- Base L2: ~$0.01-0.05 per transaction
- Ethereum: ~$1-50 per transaction (varies widely)

**Cloud Infrastructure:**
- AWS EC2: ~$0.10/hour for compute
- RDS PostgreSQL: ~$0.20/hour for database
- S3 Storage: ~$0.023/GB/month
- CloudFront CDN: ~$0.085/GB transfer

**Third-Party Services:**
- KYC Verification: $0.50-3.00 per check
- SMS: $0.01-0.05 per message
- Email: $0.0001 per email
- Payment Processing: 2.9% + $0.30 (traditional)

### 3. Proposed Hybrid Billing Model

#### Base Components:

**1. Subscription Base Fee** (Monthly)
- Covers basic infrastructure and access
- Tiered by organization size
- Includes minimum quotas

**2. Usage-Based Charges**
```javascript
{
  "blockchain_operations": {
    "simple_transfer": {
      "base_cost": 0.001,  // $0.001
      "computation_units": 10,
      "includes": ["gas", "validation", "confirmation"]
    },
    "smart_contract_interaction": {
      "base_cost": 0.005,
      "computation_units": 50,
      "additional_per_kb": 0.001
    },
    "cross_chain_transfer": {
      "base_cost": 0.01,
      "computation_units": 100,
      "bridge_fee": 0.1  // 0.1% of amount
    }
  },

  "api_operations": {
    "read": {
      "cost_per_1000": 0.01,
      "rate_limit": 1000
    },
    "write": {
      "cost_per_1000": 0.05,
      "rate_limit": 100
    },
    "webhook": {
      "cost_per_1000": 0.02,
      "includes_retry": true
    }
  },

  "storage": {
    "active_gb_month": 0.10,
    "archive_gb_month": 0.01,
    "bandwidth_gb": 0.05
  },

  "compliance": {
    "kyc_basic": 0.50,
    "kyc_enhanced": 2.00,
    "aml_screening": 0.10,
    "transaction_monitoring": 0.001  // per transaction
  }
}
```

**3. Computation Units Model**
```javascript
// Each operation consumes units
const COMPUTATION_COSTS = {
  // Basic operations
  "wallet_creation": 100,
  "balance_check": 1,
  "transaction_history": 10,

  // Transactions
  "simple_payment": 50,
  "invoice_generation": 75,
  "batch_payment": 200,

  // Smart contracts
  "token_deployment": 5000,
  "defi_swap": 500,
  "nft_mint": 1000,

  // Complex operations
  "treasury_management": 300,
  "cross_chain_bridge": 1000,
  "multi_sig_transaction": 200
};

// Price per unit varies by tier
const UNIT_PRICING = {
  "free": 0,        // First 1000 units free
  "basic": 0.00001, // $0.00001 per unit
  "small_business": 0.000008, // 20% discount
  "enterprise": 0.000005  // 50% discount
};
```

### 4. Real Cost Examples

#### Individual Consumer (Free Tier):
```
Monthly Usage:
- 10 payments received: FREE
- 5 P2P transfers: FREE
- 1 withdrawal: $0.50 (tracked but not charged)
- Storage: 10MB: FREE
Total: $0 (until upgrade)
```

#### Small Business:
```
Monthly Usage:
- Base subscription: $10
- 500 transactions: 500 * $0.08 = $40
- 100 invoices sent: 100 * $0.16 = $16
- 10 user seats: Included in base
- API calls (5000): 5 * $0.05 = $0.25
- Storage (5GB): $0.50
Total: $66.75/month
```

#### Enterprise:
```
Monthly Usage:
- Base subscription: $500
- 10,000 transactions: 10,000 * $0.054 = $540
- Smart contract operations: 500 * $0.10 = $50
- API calls (1M): 1000 * $0.018 = $18
- Enhanced KYC (100): 100 * $3.60 = $360
- Storage (100GB): $10
- Cross-chain operations (50): 50 * $0.90 = $45
Total: $1,523/month
```

### 5. Margin Analysis

#### Cost Breakdown:
```
Infrastructure: 15-20% of revenue
Third-party services: 10-15%
Development/Maintenance: 30%
Support: 10%
----------------------
Total Cost: 65-75%
Gross Margin: 25-35% (before optimization)

With USDXM payments: +5% margin (no payment processing fees)
At scale (>10K customers): +10-15% margin (economies of scale)
Target Margin: 40-50%
```

### 6. Recommendations

#### 1. **Implement Hybrid Model**
- Base subscription + usage-based pricing
- Computation units for complex operations
- Simple per-transaction for basic operations

#### 2. **Cost Tracking Requirements**
```javascript
// For each operation, track:
{
  "operation_id": "uuid",
  "tenant_id": "uuid",
  "operation_type": "smart_contract_call",
  "timestamp": "2025-01-23T10:00:00Z",
  "resources_used": {
    "computation_units": 500,
    "gas_used": 150000,
    "storage_bytes": 1024,
    "api_calls": 3,
    "bandwidth_bytes": 5120
  },
  "third_party_costs": {
    "blockchain_fee": 0.001,
    "kyc_check": 0,
    "sms_sent": 0
  },
  "total_cost": 0.0075,
  "margin_applied": 60,
  "billed_amount": 0.012
}
```

#### 3. **Billing Transparency**
- Show cost breakdown in invoices
- Real-time usage dashboard
- Cost estimation before operations
- Usage alerts and limits

#### 4. **Optimization Incentives**
- Batch operation discounts
- Off-peak pricing
- Commitment discounts
- USDXM payment benefits

### 7. Implementation Priority

1. **Phase 1**: Track basic metrics
   - Transaction counts
   - API calls
   - Storage usage

2. **Phase 2**: Add computation tracking
   - Gas usage
   - Processing time
   - Memory consumption

3. **Phase 3**: Advanced billing
   - Real-time pricing
   - Dynamic margins
   - Predictive billing

### 8. Critical Decisions Needed

1. **Billing Granularity**: Per-transaction vs hourly vs daily aggregation?
2. **Margin Strategy**: Fixed percentage vs dynamic based on volume?
3. **Free Tier Limits**: What's sustainable at scale?
4. **Prepaid vs Postpaid**: Credit system or monthly billing?
5. **Overage Handling**: Hard limits or automatic scaling with alerts?

## Conclusion

The current event-based billing is a good start but needs enhancement to:
1. Better reflect actual resource consumption
2. Incentivize efficient usage
3. Maintain profitability at scale
4. Provide transparency to customers

Recommended approach: **Hybrid model** with base subscription + computation units + specific charges for expensive operations (KYC, cross-chain, etc.)