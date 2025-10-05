# 🏢 Enterprise Wallet Architecture & On/Off-Ramp Guide

**Last Updated**: January 2025
**Status**: Production Architecture

---

## 📋 Table of Contents

1. [Why Single Wallet for Enterprises?](#why-single-wallet-for-enterprises)
2. [Enterprise vs Consumer Wallet Comparison](#enterprise-vs-consumer-wallet-comparison)
3. [Enterprise On-Ramp Methods](#enterprise-on-ramp-methods)
4. [Enterprise Off-Ramp Methods](#enterprise-off-ramp-methods)
5. [Complete On/Off-Ramp Flows](#complete-onoff-ramp-flows)
6. [Treasury Management](#treasury-management)

---

## 🎯 Why Single Wallet for Enterprises?

### **Design Decision: Unified Multi-Asset Wallet**

Enterprises use a **SINGLE unified wallet** that can hold multiple asset types, unlike consumers who have separate Monay and Circle wallets.

```
CONSUMER APPROACH (Dual-Wallet):
┌─────────────────────────────────────────────────┐
│  Consumer: "John Doe"                           │
├─────────────────────────────────────────────────┤
│                                                 │
│  Wallet 1: Monay Wallet (Fiat)                 │
│  • Balance: $5,000 USD                          │
│  • Use: Daily spending, bills, rewards          │
│                                                 │
│  Wallet 2: Circle Wallet (Crypto)              │
│  • Balance: 2,000 USDC                          │
│  • Use: Instant payments, global transfers      │
│                                                 │
│  WHY SEPARATE?                                  │
│  ✓ Clear mental model (fiat vs crypto)         │
│  ✓ Different use cases                          │
│  ✓ Simplified UX for consumers                  │
│                                                 │
└─────────────────────────────────────────────────┘

ENTERPRISE APPROACH (Unified Wallet):
┌─────────────────────────────────────────────────┐
│  Enterprise: "TechCorp Inc"                     │
├─────────────────────────────────────────────────┤
│                                                 │
│  Single Enterprise Treasury Wallet              │
│  ┌───────────────────────────────────────────┐ │
│  │ MULTI-ASSET HOLDINGS:                     │ │
│  │                                            │ │
│  │ Fiat:                                      │ │
│  │ • USD: $425,850.00                         │ │
│  │ • EUR: €50,000.00                          │ │
│  │                                            │ │
│  │ Stablecoins:                               │ │
│  │ • USDC: 100,000                            │ │
│  │ • USDT: 50,000                             │ │
│  │ • PYUSD: 25,000                            │ │
│  │ • EURC: 30,000                             │ │
│  │                                            │ │
│  │ Custom Tokens:                             │ │
│  │ • TECH Token: 1,000,000                    │ │
│  │ • Reward Points: 50,000                    │ │
│  │                                            │ │
│  │ Blockchain Addresses:                      │ │
│  │ • Base L2: 0x742d35Cc6634C0532925a3b...   │ │
│  │ • Solana: [Solana address]                 │ │
│  │                                            │ │
│  │ TOTAL VALUE: $680,350 USD equivalent       │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  WHY UNIFIED?                                   │
│  ✓ Complex treasury operations                 │
│  ✓ Multi-currency management                   │
│  ✓ Professional accounting                     │
│  ✓ Institutional-grade features                │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 🔍 Enterprise vs Consumer Wallet Comparison

| Feature | Enterprise Wallet | Consumer Dual-Wallet |
|---------|------------------|----------------------|
| **Structure** | Single unified wallet | Two separate wallets (Monay + Circle) |
| **Database** | `wallets` table (one record) | `wallets` + `user_circle_wallets` (two records linked) |
| **Assets Held** | Multiple (USD, EUR, USDC, USDT, PYUSD, EURC, custom tokens) | USD (fiat) in one, USDC in the other |
| **Use Case** | Treasury management, B2B, payroll, multi-currency | Personal spending, P2P, simple payments |
| **Compliance** | KYB (Know Your Business), institutional AML | KYC (Know Your Customer), consumer AML |
| **Multi-Sig** | ✅ Supported (required for large transfers) | ❌ Not needed |
| **Token Issuance** | ✅ Can create custom tokens (ERC-3643) | ❌ No token creation |
| **Accounting** | Full double-entry bookkeeping | Simple transaction history |
| **Limits** | $10M+ daily (configurable) | $250K daily (Premium tier) |
| **On-Ramp** | Bank wire, ACH, Circle mint, TilliPay | ACH, debit card, Circle wallet |
| **Off-Ramp** | Bank wire, ACH, Circle burn, TilliPay | ACH, bank transfer |
| **Smart Routing** | Treasury-optimized (minimize fees) | Consumer-optimized (speed + convenience) |
| **Reporting** | Advanced (tax, compliance, audit) | Basic (personal finance) |

---

## 💵 Enterprise On-Ramp Methods

### **What is On-Ramping?**
**On-ramping** = Getting funds INTO your enterprise wallet (Traditional money → Digital assets)

### **Method 1: Bank Wire Transfer → Fiat Balance**

```
┌────────────────────────────────────────────────────────────┐
│  METHOD 1: Traditional Bank Wire                           │
│  Timeline: 1-3 business days                               │
│  Fees: $25-45 (bank fees)                                  │
│  Best For: Large amounts ($50K+)                           │
└────────────────────────────────────────────────────────────┘

FLOW:
1. Enterprise initiates wire transfer from their bank
   ┌─────────────────────────────────┐
   │  TechCorp's Bank Account        │
   │  Balance: $1,000,000            │
   └─────────────────────────────────┘
                  ↓ Wire $100,000
   ┌─────────────────────────────────┐
   │  Monay Platform Bank Account    │
   │  (Banking Partner)              │
   └─────────────────────────────────┘

2. Banking partner receives wire
   • Verify sender identity (AML/KYC check)
   • Confirm amount matches
   • Clear funds (T+1 to T+3 days)

3. Monay backend receives notification
   POST /webhooks/bank/wire-received
   {
     "type": "wire_transfer",
     "from_account": "TechCorp Inc - Bank #4567",
     "amount": 100000,
     "reference": "TechCorp-Deposit-20250115",
     "status": "cleared"
   }

4. Credit enterprise wallet
   BEGIN TRANSACTION;

   UPDATE wallets
   SET balance = balance + 100000,
       updated_at = CURRENT_TIMESTAMP
   WHERE organization_id = 'tenant-techcorp'
     AND wallet_type = 'enterprise';

   INSERT INTO transactions (
     type, organization_id, amount, currency,
     source, status, reference
   ) VALUES (
     'deposit', 'tenant-techcorp', 100000, 'USD',
     'bank_wire', 'completed', 'TechCorp-Deposit-20250115'
   );

   COMMIT;

5. Enterprise sees updated balance
   Dashboard: "Deposit Confirmed: +$100,000"
   New Balance: $525,850

RESULT:
✅ Enterprise wallet funded with fiat USD
✅ Can now use for payments, invoices, etc.
```

---

### **Method 2: ACH Transfer → Fiat Balance**

```
┌────────────────────────────────────────────────────────────┐
│  METHOD 2: ACH Transfer (Automated Clearing House)         │
│  Timeline: 3-5 business days                               │
│  Fees: $0-5                                                │
│  Best For: Regular deposits ($1K-$100K)                    │
└────────────────────────────────────────────────────────────┘

FLOW:
1. Enterprise initiates ACH via Monay dashboard
   [TechCorp Enterprise Dashboard - Port 3007]

   Screen: "Add Funds via ACH"

   POST /api/wallets/enterprise/deposit/ach
   {
     "bank_account_id": "bank-techcorp-checking",
     "amount": 50000,
     "description": "Monthly operating capital"
   }

2. TilliPay/Plaid processes ACH
   • Verify bank account ownership
   • Initiate ACH debit
   • Wait for clearing (3-5 business days)

3. Funds cleared → Credit wallet
   (Same database update as wire transfer)

4. Notification sent
   Email: "ACH deposit of $50,000 processed successfully"

RESULT:
✅ Lower fees than wire transfer
⏱️ Slower (3-5 days vs 1-3 days)
```

---

### **Method 3: Circle Mint (USD → USDC)**

```
┌────────────────────────────────────────────────────────────┐
│  METHOD 3: Circle Mint - USD to USDC On-Ramp              │
│  Timeline: 30-60 minutes                                   │
│  Fees: ~1% (Circle fee)                                    │
│  Best For: Converting USD to USDC for blockchain ops      │
└────────────────────────────────────────────────────────────┘

PURPOSE: Convert traditional USD → USDC stablecoin for blockchain operations

FLOW:
1. Enterprise has fiat USD in wallet
   Current Balance: $100,000 USD

2. Enterprise requests USDC mint
   [TechCorp Enterprise Dashboard - Port 3007]

   Screen: "Convert USD to USDC"

   POST /api/enterprise-treasury/mint-usdc
   {
     "amount": 50000,
     "source": "enterprise_wallet",
     "blockchain": "base"  // Base L2
   }

3. Backend calls Circle Mint API

   const result = await circleService.mintUSDC(
     50000,
     sourceBankAccount,  // TechCorp's linked bank
     enterpriseCircleWallet,
     'tenant-techcorp'
   );

   Circle Processing:
   • Debit TechCorp's bank account: $50,000
   • Issue 50,000 USDC tokens
   • Send to TechCorp's blockchain address on Base L2
   • Transaction hash: 0xabc123def456...

4. Update enterprise wallet balances
   BEGIN TRANSACTION;

   -- Debit USD
   UPDATE wallets
   SET balance = balance - 50000
   WHERE organization_id = 'tenant-techcorp';

   -- Credit USDC (as metadata in same wallet)
   UPDATE wallets
   SET metadata = jsonb_set(
     metadata,
     '{stablecoin_balances,USDC}',
     to_jsonb((metadata->'stablecoin_balances'->>'USDC')::numeric + 50000)
   )
   WHERE organization_id = 'tenant-techcorp';

   -- Record mint transaction
   INSERT INTO blockchain_transactions (
     organization_id, type, chain,
     transaction_hash, value, token_symbol,
     status, source
   ) VALUES (
     'tenant-techcorp', 'mint', 'base',
     '0xabc123def456...', 50000, 'USDC',
     'confirmed', 'circle_mint'
   );

   COMMIT;

5. Enterprise sees updated holdings
   Dashboard:
   ┌────────────────────────────────┐
   │ Enterprise Treasury            │
   ├────────────────────────────────┤
   │ Fiat USD: $50,000             │
   │ USDC: 50,000 (on Base L2)     │
   │ Total Value: $100,000          │
   └────────────────────────────────┘

6. USDC now available for blockchain operations
   ✅ Instant cross-border transfers
   ✅ Smart contract interactions
   ✅ DeFi operations
   ✅ Low-fee stablecoin payments

WHEN TO USE:
• Need to pay international vendors in crypto
• Want instant settlement vs ACH delays
• Participating in DeFi yield strategies
• Issuing stablecoin salaries/bonuses
```

---

### **Method 4: Direct USDC Deposit (Blockchain)**

```
┌────────────────────────────────────────────────────────────┐
│  METHOD 4: Direct USDC Blockchain Deposit                  │
│  Timeline: < 1 second (blockchain confirmation)            │
│  Fees: Network gas fee (~$0.0001 on Base L2)              │
│  Best For: Receiving crypto payments from external parties │
└────────────────────────────────────────────────────────────┘

SCENARIO: External company pays TechCorp in USDC

FLOW:
1. TechCorp shares their blockchain address
   "Send USDC to: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"
   "Network: Base L2"

2. External party sends USDC on blockchain
   (Happens outside Monay platform)

   Transaction on Base L2:
   • From: 0xExternalCompany123...
   • To: 0x742d35Cc... (TechCorp)
   • Amount: 25,000 USDC
   • Tx Hash: 0xdef789ghi012...

3. Circle webhook → Monay backend
   POST /api/webhooks/circle/transfer
   {
     "type": "transfer.incoming",
     "walletId": "circle-techcorp-wallet",
     "amount": "25000",
     "currency": "USDC",
     "blockchain": "base",
     "transactionHash": "0xdef789ghi012...",
     "fromAddress": "0xExternalCompany123...",
     "status": "confirmed"
   }

4. Auto-credit enterprise wallet
   UPDATE wallets
   SET metadata = jsonb_set(
     metadata,
     '{stablecoin_balances,USDC}',
     to_jsonb((metadata->'stablecoin_balances'->>'USDC')::numeric + 25000)
   )
   WHERE organization_id = 'tenant-techcorp';

   INSERT INTO blockchain_transactions (
     organization_id, type, chain,
     transaction_hash, from_address, to_address,
     value, token_symbol, status, source
   ) VALUES (
     'tenant-techcorp', 'incoming', 'base',
     '0xdef789ghi012...', '0xExternalCompany123...',
     '0x742d35Cc...', 25000, 'USDC',
     'confirmed', 'external'
   );

5. Real-time notification
   Dashboard alert: "💰 25,000 USDC received from external wallet"
   Email: "USDC deposit confirmed"

RESULT:
✅ Instant settlement
✅ Global accessibility
✅ Minimal fees
✅ Full blockchain transparency
```

---

## 💳 Enterprise Off-Ramp Methods

### **What is Off-Ramping?**
**Off-ramping** = Getting funds OUT of your enterprise wallet (Digital assets → Traditional money)

### **Method 1: Circle Burn (USDC → USD)**

```
┌────────────────────────────────────────────────────────────┐
│  METHOD 1: Circle Burn - USDC to USD Off-Ramp             │
│  Timeline: 1-2 business days                               │
│  Fees: ~1% (Circle fee)                                    │
│  Best For: Converting USDC back to fiat USD                │
└────────────────────────────────────────────────────────────┘

SCENARIO: TechCorp has 50,000 USDC, wants fiat USD in bank

FLOW:
1. Enterprise requests USDC burn
   [TechCorp Enterprise Dashboard - Port 3007]

   Screen: "Convert USDC to USD"

   POST /api/enterprise-treasury/burn-usdc
   {
     "amount": 50000,
     "destination_bank": "bank-techcorp-checking",
     "blockchain": "base"
   }

2. Backend validation
   • Check USDC balance >= 50,000 ✅
   • Verify bank account linked ✅
   • Compliance checks ✅

3. Circle Burn API call
   const result = await circleService.burnUSDC(
     50000,
     enterpriseCircleWallet,
     {
       type: 'ach',
       id: 'bank-techcorp-checking'
     },
     'tenant-techcorp'
   );

   Circle Processing:
   • Burn 50,000 USDC tokens (destroyed on blockchain)
   • Initiate ACH transfer to TechCorp's bank
   • Amount: $50,000 USD
   • ETA: 1-2 business days

4. Update wallet balances
   BEGIN TRANSACTION;

   -- Debit USDC
   UPDATE wallets
   SET metadata = jsonb_set(
     metadata,
     '{stablecoin_balances,USDC}',
     to_jsonb((metadata->'stablecoin_balances'->>'USDC')::numeric - 50000)
   )
   WHERE organization_id = 'tenant-techcorp';

   -- Record pending fiat credit
   INSERT INTO transactions (
     organization_id, type, amount, currency,
     status, provider, reference
   ) VALUES (
     'tenant-techcorp', 'withdrawal', 50000, 'USD',
     'pending', 'circle_burn', result.payoutId
   );

   COMMIT;

5. Bank receives ACH (1-2 days later)
   TechCorp's Bank Account:
   • Incoming ACH: +$50,000
   • Reference: "Circle Payout - [payoutId]"

6. Final wallet update (on confirmation)
   UPDATE transactions
   SET status = 'completed',
       completed_at = CURRENT_TIMESTAMP
   WHERE reference = result.payoutId;

   -- Credit fiat balance
   UPDATE wallets
   SET balance = balance + 50000
   WHERE organization_id = 'tenant-techcorp';

RESULT:
✅ USDC converted to fiat USD
✅ Deposited in bank account
⏱️ 1-2 business days settlement
💰 ~1% fee
```

---

### **Method 2: Bank Wire Withdrawal**

```
┌────────────────────────────────────────────────────────────┐
│  METHOD 2: Direct Bank Wire Withdrawal                     │
│  Timeline: 1-3 business days                               │
│  Fees: $25-45                                              │
│  Best For: Large withdrawals ($50K+)                       │
└────────────────────────────────────────────────────────────┘

FLOW:
1. Enterprise requests wire withdrawal
   POST /api/wallets/enterprise/withdraw/wire
   {
     "amount": 100000,
     "destination_bank": "bank-techcorp-checking",
     "purpose": "Operating expenses"
   }

2. Approval workflow (for large amounts)
   • Requires multi-sig approval (2-of-3 executives)
   • Compliance team review
   • Final authorization

3. Wire initiated via banking partner
   • Debit Monay platform account
   • Wire to TechCorp's bank
   • Reference: Wire request ID

4. Settlement (1-3 days)
   TechCorp receives wire in bank account

RESULT:
✅ Large amount support
✅ Secure (multi-sig)
💰 Higher fees
```

---

### **Method 3: ACH Withdrawal**

```
┌────────────────────────────────────────────────────────────┐
│  METHOD 3: ACH Withdrawal to Bank                          │
│  Timeline: 3-5 business days                               │
│  Fees: $0-5                                                │
│  Best For: Regular withdrawals ($1K-$50K)                  │
└────────────────────────────────────────────────────────────┘

FLOW:
Similar to wire, but via ACH:
• Lower fees ($0-5 vs $25-45)
• Slower (3-5 days vs 1-3 days)
• Lower limits ($50K max typically)
```

---

### **Method 4: Direct USDC Blockchain Transfer**

```
┌────────────────────────────────────────────────────────────┐
│  METHOD 4: Send USDC to External Wallet/Exchange           │
│  Timeline: < 1 second                                      │
│  Fees: Network gas (~$0.0001 on Base L2)                  │
│  Best For: Crypto-native off-ramping                       │
└────────────────────────────────────────────────────────────┘

SCENARIO: TechCorp sends USDC to Coinbase to cash out

FLOW:
1. TechCorp initiates blockchain transfer
   POST /api/wallets/enterprise/transfer/blockchain
   {
     "amount": 100000,
     "currency": "USDC",
     "to_address": "0xCoinbaseWallet...",
     "network": "base"
   }

2. Via Tempo/Circle infrastructure
   Transaction on Base L2:
   • From: 0x742d35Cc... (TechCorp)
   • To: 0xCoinbaseWallet...
   • Amount: 100,000 USDC
   • Fee: $0.0001 (Tempo)

3. Coinbase receives USDC
   TechCorp can then:
   • Sell USDC for USD on Coinbase
   • Withdraw to bank account
   • Or keep as crypto

RESULT:
✅ Instant USDC transfer
✅ Minimal fees
✅ Flexible (use any exchange)
```

---

## 🔄 Complete On/Off-Ramp Flows

### **Flow Diagram: Enterprise Funding Cycle**

```
┌────────────────────────────────────────────────────────────┐
│               ENTERPRISE FUNDING LIFECYCLE                  │
└────────────────────────────────────────────────────────────┘

PHASE 1: ON-RAMP (Get Money In)
════════════════════════════════

Traditional Banking:
┌──────────────┐  Wire/ACH   ┌────────────────────┐
│ TechCorp's   │ ──────────> │ Monay Enterprise   │
│ Bank Account │ $100,000    │ Wallet (Fiat USD)  │
│ $1,000,000   │             │ Balance: $100,000  │
└──────────────┘             └────────────────────┘
                                      │
                                      │ Optional: Convert
                                      │ to USDC
                                      ↓
Crypto On-Ramp:              ┌────────────────────┐
┌──────────────┐  Mint USDC  │ Monay Enterprise   │
│ Circle API   │ ──────────> │ Wallet (USDC)      │
│ USD → USDC   │ 50,000 USDC │ Balance: 50,000    │
└──────────────┘             └────────────────────┘

External Crypto:
┌──────────────┐  Blockchain ┌────────────────────┐
│ External     │ ──────────> │ Monay Enterprise   │
│ Wallet/Party │ 25,000 USDC │ Wallet (USDC)      │
│              │             │ Balance: 75,000    │
└──────────────┘             └────────────────────┘

PHASE 2: OPERATIONS (Use Money)
════════════════════════════════

┌────────────────────────────────────────────┐
│ Enterprise Treasury Wallet                 │
│                                            │
│ Total Holdings:                            │
│ • Fiat USD: $50,000                        │
│ • USDC: 75,000                             │
│ • Total Value: $125,000                    │
└────────────────────────────────────────────┘
         │
         ├─> Pay invoices to consumers
         ├─> B2B payments to other enterprises
         ├─> Employee payroll
         ├─> Vendor payments
         ├─> Cross-border transfers
         └─> Token creation (if CaaS customer)

PHASE 3: OFF-RAMP (Get Money Out)
══════════════════════════════════

Crypto → Fiat:
┌──────────────┐  Burn USDC  ┌────────────────────┐
│ Circle API   │ <────────── │ Enterprise Wallet  │
│ USDC → USD   │ 50,000 USDC │ USDC: 50,000       │
│              │             │                    │
│      ↓ ACH (1-2 days)      │                    │
│                            │                    │
│ ┌──────────────┐           │                    │
│ │ TechCorp's   │ <─────────┤                    │
│ │ Bank Account │ $50,000   │                    │
│ │ +$50,000     │           │                    │
│ └──────────────┘           └────────────────────┘

Direct Bank Withdrawal:
┌──────────────┐  Wire/ACH   ┌────────────────────┐
│ TechCorp's   │ <────────── │ Enterprise Wallet  │
│ Bank Account │ $100,000    │ Fiat: $100,000     │
│ +$100,000    │             │ New: $0            │
└──────────────┘             └────────────────────┘

Crypto Transfer:
┌──────────────┐  Blockchain ┌────────────────────┐
│ Coinbase     │ <────────── │ Enterprise Wallet  │
│ Exchange     │ 25,000 USDC │ USDC: 25,000       │
│              │             │ New: 0             │
└──────────────┘             └────────────────────┘
       │
       └─> Sell on exchange → Withdraw to bank
```

---

## 💼 Treasury Management

### **Multi-Currency Treasury Dashboard**

```typescript
// What enterprises see at http://localhost:3007/dashboard

interface EnterpriseTreasuryDashboard {
  totalValue: number;  // $680,350 USD equivalent

  fiatBalances: {
    USD: 425850.00,
    EUR: 50000.00,
    GBP: 0
  };

  stablecoinBalances: {
    USDC: 100000,
    USDT: 50000,
    PYUSD: 25000,
    EURC: 30000
  };

  blockchainAddresses: {
    base: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
    solana: '[Solana address]'
  };

  quickActions: [
    'Add Funds (Wire/ACH)',
    'Convert USD → USDC',
    'Convert USDC → USD',
    'Send Payment',
    'Create Invoice',
    'Withdraw to Bank'
  ];
}
```

---

## 📊 Comparison: Consumer vs Enterprise On/Off-Ramp

| Feature | Consumer | Enterprise |
|---------|----------|------------|
| **On-Ramp Methods** | • Debit card<br>• ACH (small amounts)<br>• Circle wallet deposit | • Bank wire<br>• ACH (large amounts)<br>• Circle mint<br>• Direct USDC deposits |
| **On-Ramp Limits** | $1K-$10K per transaction | $1M+ per transaction |
| **Off-Ramp Methods** | • ACH to bank<br>• Circle burn | • Bank wire<br>• ACH<br>• Circle burn<br>• Direct USDC transfers |
| **Off-Ramp Limits** | $250K daily (Premium) | $10M+ daily |
| **Multi-Sig Required** | ❌ No | ✅ Yes (for large amounts) |
| **Approval Workflow** | None | Multi-level approval for withdrawals |
| **Speed Priority** | Instant preferred | Security > Speed |
| **Fees** | Consumer-friendly | Volume discounts |

---

## 🎓 Summary

### **Why Single Wallet for Enterprises?**

1. **Complexity**: Enterprises deal with multiple currencies, tokens, and asset types
2. **Treasury Operations**: Need unified view of all holdings
3. **Accounting**: Professional-grade financial reporting
4. **Compliance**: Institutional KYB requirements
5. **Multi-Sig**: Security for large transactions
6. **Custom Tokens**: Can issue their own tokens (ERC-3643)

### **Consumer Dual-Wallet is Simpler**

Consumers don't need this complexity:
- Just USD (fiat) and USDC (crypto)
- Simple use cases (spending, P2P, bills)
- No token creation
- Lower limits
- Easier mental model

### **Enterprise On/Off-Ramp Arsenal**

**On-Ramp (4 Methods):**
1. ✅ Bank Wire → Fiat USD
2. ✅ ACH → Fiat USD
3. ✅ Circle Mint → USD to USDC
4. ✅ Direct Blockchain → Receive USDC

**Off-Ramp (4 Methods):**
1. ✅ Circle Burn → USDC to USD
2. ✅ Bank Wire → Fiat to Bank
3. ✅ ACH → Fiat to Bank
4. ✅ Blockchain Transfer → Send USDC

---

**The enterprise wallet is a professional treasury system, not a personal wallet.** It's designed for institutional-grade operations with the flexibility to hold and manage multiple asset types in a single unified interface.

