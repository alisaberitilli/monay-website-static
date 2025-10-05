# 🏗️ Monay Blockchain Architecture - Complete Reference Guide

**Last Updated**: January 2025
**Version**: 2.0
**Status**: Production Architecture

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Wallet Architecture Explained](#wallet-architecture-explained)
3. [Provider vs Wallet: Understanding the Difference](#provider-vs-wallet-understanding-the-difference)
4. [Complete Transaction Flows](#complete-transaction-flows)
5. [Database Architecture](#database-architecture)
6. [API Integration Guide](#api-integration-guide)

---

## 🎯 Executive Summary

### **The Three-Layer Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                    LAYER 1: USER WALLETS                        │
│         (What users see and interact with)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  👔 ENTERPRISE USERS                  👤 CONSUMER USERS         │
│  ┌─────────────────────┐             ┌──────────────────────┐  │
│  │  Monay Enterprise   │             │  DUAL-WALLET SYSTEM  │  │
│  │  Wallet             │             │                      │  │
│  │  • Base L2          │             │  1️⃣ Monay Wallet    │  │
│  │  • ERC-3643 tokens  │             │     💵 Fiat USD      │  │
│  │  • Compliance       │             │     $5,000           │  │
│  │  • Multi-sig        │             │                      │  │
│  └─────────────────────┘             │  2️⃣ Circle Wallet   │  │
│                                      │     🪙 USDC          │  │
│                                      │     2,000 USDC       │  │
│                                      └──────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                 LAYER 2: BLOCKCHAIN RAILS                       │
│         (Where transactions actually happen)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🔷 BASE L2 (EVM)                     ⚡ SOLANA               │
│  • Enterprise operations               • Consumer payments     │
│  • ERC-3643 compliance                 • High-speed TPS        │
│  • Institutional features              • Token-2022            │
│  • Address: 0x742d35Cc...              • Address: [Solana]    │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│              LAYER 3: STABLECOIN PROVIDERS                      │
│         (Infrastructure that powers the rails)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🥇 TEMPO (Primary)                   🥈 CIRCLE (Fallback)     │
│  • 100,000+ TPS                        • 1,000 TPS             │
│  • $0.0001 fees                        • $0.05 fees            │
│  • 5 stablecoins                       • USDC only             │
│  • Operates ON Base L2 & Solana       • Operates ON Base L2   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🏦 Wallet Architecture Explained

### **Question: How Do We Support Two Wallets?**

**Answer**: We use a **DUAL-WALLET SYSTEM for consumers** and **SINGLE-WALLET for enterprises**.

### **1. Enterprise Wallet (Port 3007)**

```
┌────────────────────────────────────────────────────────┐
│         Enterprise Wallet (Monay-CaaS)                 │
├────────────────────────────────────────────────────────┤
│                                                        │
│  Single Wallet Structure:                             │
│  ┌──────────────────────────────────────────────┐    │
│  │  Monay Enterprise Wallet                     │    │
│  │                                              │    │
│  │  Database: `wallets` table                   │    │
│  │  Type: wallet_type = 'enterprise'            │    │
│  │  Blockchain: Base L2 (EVM)                   │    │
│  │  Address: 0x742d35Cc6634C0532925a3b844...    │    │
│  │                                              │    │
│  │  Supported Operations:                       │    │
│  │  ✅ Token creation (ERC-3643)                │    │
│  │  ✅ Multi-signature transactions             │    │
│  │  ✅ Compliance controls                      │    │
│  │  ✅ Invoice generation                       │    │
│  │  ✅ Treasury management                      │    │
│  │                                              │    │
│  │  Stablecoin Provider:                        │    │
│  │  🥇 Tempo (Primary) - 5 currencies           │    │
│  │  🥈 Circle (Fallback) - USDC only            │    │
│  └──────────────────────────────────────────────┘    │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Database Tables**:
- `wallets` - Main enterprise wallet
- `blockchain_wallets` - Blockchain-specific addresses
- `multi_sig_wallets` - Multi-signature configuration

---

### **2. Consumer Dual-Wallet System (Port 3003)**

```
┌──────────────────────────────────────────────────────────────┐
│         Consumer Wallet (Monay Consumer Web/Mobile)          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  DUAL-WALLET STRUCTURE:                                     │
│                                                              │
│  ┌─────────────────────┐      ┌──────────────────────┐     │
│  │  WALLET 1:          │      │  WALLET 2:           │     │
│  │  Monay Wallet       │  ⟷  │  Circle Wallet       │     │
│  │  (Traditional)      │      │  (Crypto)            │     │
│  ├─────────────────────┤      ├──────────────────────┤     │
│  │                     │      │                      │     │
│  │  Database Table:    │      │  Database Table:     │     │
│  │  `wallets`          │      │  `user_circle_       │     │
│  │                     │      │   wallets`           │     │
│  │                     │      │                      │     │
│  │  Currency:          │      │  Currency:           │     │
│  │  💵 USD (Fiat)      │      │  🪙 USDC (Stablecoin)│     │
│  │                     │      │                      │     │
│  │  Balance:           │      │  Balance:            │     │
│  │  $5,000.00          │      │  2,000 USDC          │     │
│  │                     │      │                      │     │
│  │  Features:          │      │  Features:           │     │
│  │  • ACH/Wire         │      │  • Instant transfers │     │
│  │  • Bill pay         │      │  • Global payments   │     │
│  │  • Cards            │      │  • Low fees          │     │
│  │  • Rewards          │      │  • DeFi access       │     │
│  │  • P2P              │      │  • Crypto-native     │     │
│  │                     │      │                      │     │
│  │  Settlement:        │      │  Settlement:         │     │
│  │  1-3 days           │      │  Instant (<2 sec)    │     │
│  │                     │      │                      │     │
│  │  Rails:             │      │  Rails:              │     │
│  │  Traditional        │      │  Base L2 + Solana    │     │
│  │  Banking            │      │  Blockchains         │     │
│  │                     │      │                      │     │
│  └─────────────────────┘      └──────────────────────┘     │
│           ↓                            ↓                    │
│  ┌──────────────────────────────────────────────────┐      │
│  │     WALLET LINK (wallet_links table)             │      │
│  │     • user_id: user-123                          │      │
│  │     • monay_wallet_id: wallet-abc                │      │
│  │     • circle_wallet_id: circle-xyz               │      │
│  │     • link_status: 'active'                      │      │
│  │     • auto_bridge_enabled: true                  │      │
│  │     • preferred_wallet: 'smart'                  │      │
│  └──────────────────────────────────────────────────┘      │
│                                                              │
│  SMART ROUTING ENGINE:                                      │
│  • Analyzes each transaction                                │
│  • Selects optimal wallet based on:                         │
│    - Fees (30% weight)                                      │
│    - Speed (30% weight)                                     │
│    - Balance (20% weight)                                   │
│    - Payment type (20% weight)                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Database Tables**:
- `wallets` - Monay fiat wallet
- `user_circle_wallets` - Circle USDC wallet
- `wallet_links` - Links both wallets for a user
- `bridge_transfers` - Transfers between wallets
- `routing_decisions` - Smart routing audit trail

---

## 🔌 Provider vs Wallet: Understanding the Difference

### **Critical Concept: Tempo and Circle are NOT Wallets**

```
❌ WRONG THINKING:
"User has 3 wallets: Monay wallet, Circle wallet, and Tempo wallet"

✅ CORRECT THINKING:
"User has 2 wallets (Monay + Circle). Both wallets use Tempo OR Circle
 as infrastructure providers to move money on the blockchain."
```

### **Detailed Breakdown**

#### **What IS a Wallet?**
A wallet is a **USER ACCOUNT** that holds funds and has:
- ✅ A balance (e.g., $5,000 or 2,000 USDC)
- ✅ A unique identifier (wallet ID, address)
- ✅ Transaction history
- ✅ User ownership

**In Monay**:
- **Monay Wallet**: Holds fiat USD (`wallets` table)
- **Circle Wallet**: Holds USDC (`user_circle_wallets` table)

---

#### **What IS a Provider?**
A provider is **INFRASTRUCTURE** that enables blockchain operations:
- ✅ Processes transactions
- ✅ Provides APIs for wallet operations
- ✅ Runs blockchain nodes
- ✅ Handles compliance
- ❌ Does NOT hold user balances directly

**In Monay**:
- **Tempo**: Infrastructure for stablecoin operations
- **Circle**: Infrastructure + API for USDC operations

---

### **How They Work Together**

```
┌────────────────────────────────────────────────────────────┐
│                    USER'S PERSPECTIVE                      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Consumer Sarah has:                                       │
│  • Monay Wallet: $5,000 USD                               │
│  • Circle Wallet: 2,000 USDC                              │
│                                                            │
└────────────────────────────────────────────────────────────┘
                           ↓
┌────────────────────────────────────────────────────────────┐
│                 TECHNICAL IMPLEMENTATION                    │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  When Sarah sends 100 USDC from Circle Wallet:            │
│                                                            │
│  Step 1: Monay Backend receives request                   │
│          "Send 100 USDC from Sarah's Circle Wallet"        │
│                                                            │
│  Step 2: Provider Selection (Smart Routing)                │
│          ┌──────────────────────────────────┐             │
│          │  Provider Factory decides:       │             │
│          │  • Is Tempo available? ✅ Yes    │             │
│          │  • Does Tempo support USDC? ✅   │             │
│          │  • Is Tempo cheaper? ✅ Yes      │             │
│          │  DECISION: Use Tempo             │             │
│          └──────────────────────────────────┘             │
│                                                            │
│  Step 3: Transaction Execution via Tempo                   │
│          Tempo.transfer({                                  │
│            from: sarah_circle_wallet_address,              │
│            to: recipient_address,                          │
│            amount: 100,                                    │
│            currency: 'USDC',                               │
│            blockchain: 'base-l2'                           │
│          })                                                │
│                                                            │
│  Step 4: Blockchain Confirmation                           │
│          Transaction mined on Base L2                      │
│          Fee: $0.0001 (Tempo's near-zero fee)             │
│          Time: < 1 second                                  │
│                                                            │
│  Step 5: Database Update                                   │
│          UPDATE user_circle_wallets                        │
│          SET usdc_balance = usdc_balance - 100             │
│          WHERE user_id = 'sarah'                           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### **Provider Comparison Table**

| Feature | Tempo (Infrastructure) | Circle (Infrastructure) | Monay Wallet (User Account) | Circle Wallet (User Account) |
|---------|----------------------|------------------------|----------------------------|------------------------------|
| **Type** | Provider/Infrastructure | Provider/Infrastructure | User Wallet | User Wallet |
| **Holds Balance?** | ❌ No | ❌ No (API only) | ✅ Yes (Fiat USD) | ✅ Yes (USDC) |
| **Transaction Processing** | ✅ Yes (5 stablecoins) | ✅ Yes (USDC only) | Via providers | Via providers |
| **Blockchain** | Operates on Base L2 + Solana | Operates on Base L2 | N/A (fiat) | Base L2 + Solana |
| **TPS** | 100,000+ | 1,000 | N/A | N/A |
| **Fees** | $0.0001 | $0.05 | 2-3% | Uses provider fees |
| **User Visible?** | ❌ No (backend only) | ❌ No (backend only) | ✅ Yes | ✅ Yes |
| **Has Wallet Features?** | ❌ No (just infrastructure) | ⚠️ Partial (Wallet API) | ✅ Full | ✅ Full |

---

### **Tempo: Infrastructure Provider Only**

```
┌────────────────────────────────────────────────────────────┐
│                    TEMPO SERVICE                           │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  What Tempo Provides:                                      │
│  ✅ EVM-compatible L1 blockchain (100,000+ TPS)           │
│  ✅ Multi-stablecoin support (5 currencies)               │
│  ✅ Near-zero fees ($0.0001 per transaction)              │
│  ✅ Native compliance hooks                                │
│  ✅ Batch transfer features                                │
│  ✅ Stablecoin swap functionality                          │
│  ✅ API for blockchain operations                          │
│                                                            │
│  What Tempo DOES NOT Provide:                             │
│  ❌ User wallet accounts                                   │
│  ❌ User balance storage                                   │
│  ❌ KYC/AML services                                       │
│  ❌ Fiat on/off ramp                                       │
│  ❌ User-facing interface                                  │
│                                                            │
│  Tempo's Role in Monay:                                    │
│  "The highway that transactions travel on"                 │
│                                                            │
│  Supported Stablecoins:                                    │
│  • USDC (USD Coin)                                         │
│  • USDT (Tether)                                           │
│  • PYUSD (PayPal USD)                                      │
│  • EURC (Euro Coin)                                        │
│  • USDB (Bridge USD)                                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### **Circle: Hybrid Provider + Wallet API**

```
┌────────────────────────────────────────────────────────────┐
│                    CIRCLE SERVICE                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Circle's Dual Role:                                       │
│                                                            │
│  1️⃣ Infrastructure Provider (Like Tempo):                 │
│     ✅ Blockchain operations on Base L2                    │
│     ✅ USDC minting/burning                                │
│     ✅ Transaction processing                              │
│     ✅ Settlement services                                 │
│                                                            │
│  2️⃣ Wallet API Provider (Unique to Circle):               │
│     ✅ Create USDC wallets via API                         │
│     ✅ Programmable wallet features                        │
│     ✅ Deposit/withdrawal management                       │
│     ✅ Transaction history                                 │
│                                                            │
│  What We Use from Circle:                                  │
│  ┌────────────────────────────────────────────┐           │
│  │ API Call: circleAPI.createWallet()         │           │
│  │ Returns: { walletId, address, blockchain } │           │
│  │                                             │           │
│  │ We store in: user_circle_wallets table     │           │
│  │ User sees: "Circle Wallet: 2,000 USDC"     │           │
│  └────────────────────────────────────────────┘           │
│                                                            │
│  Supported Currency:                                       │
│  • USDC only                                               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 💸 Complete Transaction Flows

### **Flow 1: Enterprise → Consumer (Invoice-Based)**

This is the **PRIMARY** flow for enterprise-to-consumer payments.

```
┌─────────────────────────────────────────────────────────────────┐
│  FLOW 1: Enterprise Creates Invoice for Consumer Payment       │
│  (Invoice-First Model - RECOMMENDED)                           │
└─────────────────────────────────────────────────────────────────┘

ACTORS:
- Enterprise: "TechCorp Inc" (has Enterprise Wallet on port 3007)
- Consumer: "John Doe" (has Dual-Wallet on port 3003)

SCENARIO: TechCorp invoices John for $500 consulting fee

┌────────────────────────────────────────────────────────────────┐
│ STEP 1: Enterprise Creates Invoice                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [TechCorp Admin Dashboard - Port 3007]                        │
│                                                                │
│  POST /api/invoices/create                                     │
│  {                                                             │
│    "tenant_id": "tenant-techcorp",                            │
│    "recipient_type": "consumer",                              │
│    "recipient_id": "user-john-doe",                           │
│    "amount": 500,                                             │
│    "currency": "USD",                                         │
│    "description": "Consulting services - January 2025",       │
│    "payment_methods_accepted": [                              │
│      "monay_wallet",     // John's fiat wallet               │
│      "circle_wallet",    // John's USDC wallet               │
│      "external_card",    // John's credit card               │
│      "external_bank"     // John's bank account              │
│    ],                                                         │
│    "due_date": "2025-02-01"                                   │
│  }                                                             │
│                                                                │
│  Backend Processing:                                           │
│  1. Create invoice in `invoices` table                        │
│  2. Generate unique invoice ID: "INV-2025-001234"             │
│  3. Create invoice wallet: `invoice_wallets` table            │
│  4. Status: 'pending_payment'                                 │
│  5. Send notification to John (email + push)                  │
│                                                                │
│  Database State:                                               │
│  ┌────────────────────────────────────────────────┐          │
│  │ invoices table:                                │          │
│  │ - id: INV-2025-001234                          │          │
│  │ - tenant_id: tenant-techcorp                   │          │
│  │ - consumer_id: user-john-doe                   │          │
│  │ - amount: 500                                  │          │
│  │ - status: pending_payment                      │          │
│  │ - created_at: 2025-01-15 10:00:00             │          │
│  └────────────────────────────────────────────────┘          │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ STEP 2: Consumer Receives Invoice Notification                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [John's Consumer App - Port 3003]                             │
│                                                                │
│  📱 Push Notification:                                         │
│  "You have a new invoice from TechCorp Inc"                    │
│  "Amount: $500.00 | Due: Feb 1, 2025"                         │
│                                                                │
│  John opens app → "Invoices" section                          │
│                                                                │
│  GET /api/invoices/consumer                                    │
│  Returns:                                                      │
│  [                                                             │
│    {                                                           │
│      "id": "INV-2025-001234",                                 │
│      "from": "TechCorp Inc",                                  │
│      "amount": 500,                                           │
│      "currency": "USD",                                       │
│      "description": "Consulting services",                    │
│      "status": "pending",                                     │
│      "due_date": "2025-02-01",                                │
│      "payment_options": {                                     │
│        "monay_wallet": {                                      │
│          "available": true,                                   │
│          "balance": 5000,                                     │
│          "sufficient": true,                                  │
│          "fee": 0,                                            │
│          "total": 500                                         │
│        },                                                     │
│        "circle_wallet": {                                     │
│          "available": true,                                   │
│          "balance": 2000,                                     │
│          "sufficient": true,                                  │
│          "fee": 0.25,                                         │
│          "total": 500.25,                                     │
│          "note": "Auto-converted from USDC"                   │
│        },                                                     │
│        "external_card": {                                     │
│          "available": true,                                   │
│          "fee": 14.50,                                        │
│          "total": 514.50                                      │
│        }                                                      │
│      }                                                        │
│    }                                                           │
│  ]                                                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ STEP 3: Smart Routing Analyzes Payment Options                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  John clicks "Pay Now"                                         │
│                                                                │
│  Backend Smart Routing Engine:                                 │
│  POST /api/circle-wallets/routing/optimize                     │
│  {                                                             │
│    "user_id": "user-john-doe",                                │
│    "amount": 500,                                             │
│    "payment_type": "invoice",                                 │
│    "recipient_type": "enterprise"                             │
│  }                                                             │
│                                                                │
│  Routing Analysis:                                             │
│  ┌────────────────────────────────────────────────┐          │
│  │ Option 1: Monay Wallet (Fiat)                 │          │
│  │ - Balance: $5,000 ✅                           │          │
│  │ - Fee: $0 (P2P invoice payment)                │          │
│  │ - Time: Instant                                │          │
│  │ - Score: 85/100                                │          │
│  │                                                 │          │
│  │ Option 2: Circle Wallet (USDC)                │          │
│  │ - Balance: 2,000 USDC ✅                       │          │
│  │ - Fee: $0.25 (Tempo infrastructure)            │          │
│  │ - Time: <2 seconds                             │          │
│  │ - Score: 82/100                                │          │
│  │                                                 │          │
│  │ RECOMMENDATION: Monay Wallet                   │          │
│  │ Reason: Zero fees, instant, sufficient funds   │          │
│  └────────────────────────────────────────────────┘          │
│                                                                │
│  UI shows John:                                                │
│  ┌────────────────────────────────────────────────┐          │
│  │ 💡 Smart Recommendation                        │          │
│  │                                                 │          │
│  │ ✅ Pay with Monay Wallet                       │          │
│  │    Save $0.25 in fees                          │          │
│  │    Instant delivery                            │          │
│  │                                                 │          │
│  │    [Pay $500.00] [Choose Different Method]     │          │
│  └────────────────────────────────────────────────┘          │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ STEP 4: Payment Execution                                     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  John confirms payment                                         │
│                                                                │
│  POST /api/invoices/pay                                        │
│  {                                                             │
│    "invoice_id": "INV-2025-001234",                           │
│    "payment_method": "monay_wallet",                          │
│    "amount": 500,                                             │
│    "wallet_id": "wallet-john-monay"                           │
│  }                                                             │
│                                                                │
│  Backend Processing (Transaction):                             │
│                                                                │
│  BEGIN TRANSACTION;                                            │
│                                                                │
│  1. Verify John's balance >= 500                              │
│     SELECT balance FROM wallets                               │
│     WHERE id = 'wallet-john-monay'                            │
│     Result: 5000 ✅                                            │
│                                                                │
│  2. Debit John's Monay wallet                                 │
│     UPDATE wallets                                             │
│     SET balance = balance - 500                                │
│     WHERE id = 'wallet-john-monay'                            │
│     New balance: $4,500                                        │
│                                                                │
│  3. Credit TechCorp's enterprise wallet                       │
│     UPDATE wallets                                             │
│     SET balance = balance + 500                                │
│     WHERE organization_id = 'tenant-techcorp'                 │
│                                                                │
│  4. Record transaction                                         │
│     INSERT INTO transactions (                                 │
│       id, type, from_wallet_id, to_wallet_id,                 │
│       amount, currency, status, invoice_id                    │
│     ) VALUES (                                                 │
│       'txn-001', 'invoice_payment',                           │
│       'wallet-john-monay', 'wallet-techcorp',                 │
│       500, 'USD', 'completed', 'INV-2025-001234'              │
│     )                                                          │
│                                                                │
│  5. Update invoice status                                      │
│     UPDATE invoices                                            │
│     SET status = 'paid',                                       │
│         paid_at = CURRENT_TIMESTAMP,                          │
│         payment_method = 'monay_wallet',                      │
│         transaction_id = 'txn-001'                            │
│     WHERE id = 'INV-2025-001234'                              │
│                                                                │
│  6. Create routing decision record                             │
│     INSERT INTO routing_decisions (...)                        │
│                                                                │
│  COMMIT;                                                       │
│                                                                │
│  Time elapsed: ~50ms                                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ STEP 5: Confirmation & Notifications                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  John sees:                                                    │
│  ┌────────────────────────────────────────────────┐          │
│  │ ✅ Payment Successful!                         │          │
│  │                                                 │          │
│  │ You paid $500.00 to TechCorp Inc              │          │
│  │ Invoice: INV-2025-001234                       │          │
│  │ Payment method: Monay Wallet                   │          │
│  │ New balance: $4,500.00                         │          │
│  │                                                 │          │
│  │ [View Receipt] [Download PDF]                  │          │
│  └────────────────────────────────────────────────┘          │
│                                                                │
│  TechCorp sees (Port 3007):                                    │
│  ┌────────────────────────────────────────────────┐          │
│  │ 💰 Payment Received                            │          │
│  │                                                 │          │
│  │ From: John Doe                                 │          │
│  │ Amount: $500.00                                │          │
│  │ Invoice: INV-2025-001234                       │          │
│  │ Status: PAID                                   │          │
│  │                                                 │          │
│  │ [View Transaction] [Send Receipt]              │          │
│  └────────────────────────────────────────────────┘          │
│                                                                │
│  Notifications sent:                                           │
│  • Email to John: "Payment confirmation"                       │
│  • Email to TechCorp: "Invoice paid notification"             │
│  • Push notification to both parties                           │
│  • Webhook to TechCorp's accounting system (if configured)    │
│                                                                │
└────────────────────────────────────────────────────────────────┘

RESULT:
✅ Enterprise received payment: $500
✅ Consumer paid invoice: $500
✅ Fee: $0 (internal P2P)
✅ Settlement time: Instant
✅ Database: Fully consistent
✅ Audit trail: Complete
```

---

### **Flow 2: Enterprise → Consumer (Direct Transfer, No Invoice)**

This is the **OPTIONAL** flow when no invoice is required.

```
┌─────────────────────────────────────────────────────────────────┐
│  FLOW 2: Enterprise Direct Transfer to Consumer                │
│  (Optional - Without Invoice)                                  │
└─────────────────────────────────────────────────────────────────┘

SCENARIO: TechCorp sends $200 bonus to employee John

┌────────────────────────────────────────────────────────────────┐
│ Enterprise Initiates Direct Transfer                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [TechCorp Enterprise Dashboard - Port 3007]                   │
│                                                                │
│  POST /api/p2p-transfer/send                                   │
│  {                                                             │
│    "from_tenant": "tenant-techcorp",                          │
│    "to_user_id": "user-john-doe",                            │
│    "to_wallet_type": "auto",  // Let smart routing decide    │
│    "amount": 200,                                             │
│    "currency": "USD",                                         │
│    "description": "Performance bonus - Q1 2025",             │
│    "type": "bonus"                                            │
│  }                                                             │
│                                                                │
│  Backend Processing:                                           │
│                                                                │
│  1. Identify recipient wallet options                         │
│     GET /api/circle-wallets/balance?userId=user-john-doe      │
│     Returns:                                                   │
│     {                                                          │
│       "monay_wallet": { id: "wallet-john", active: true },    │
│       "circle_wallet": { id: "circle-john", active: true }    │
│     }                                                          │
│                                                                │
│  2. Smart routing decision                                     │
│     - Payment type: "bonus" → Prefer instant delivery         │
│     - Amount: $200 → Small amount, any wallet works           │
│     - Recipient preference: Check wallet_links.preferred      │
│     DECISION: Deliver to Monay Wallet (John's default)        │
│                                                                │
│  3. Execute transfer                                           │
│     BEGIN TRANSACTION;                                         │
│                                                                │
│     UPDATE wallets                                             │
│     SET balance = balance - 200                                │
│     WHERE organization_id = 'tenant-techcorp';                │
│                                                                │
│     UPDATE wallets                                             │
│     SET balance = balance + 200                                │
│     WHERE id = 'wallet-john';                                 │
│                                                                │
│     INSERT INTO transactions (                                 │
│       type, amount, from_tenant, to_user,                     │
│       status, description                                     │
│     ) VALUES (                                                 │
│       'direct_transfer', 200, 'tenant-techcorp',              │
│       'user-john-doe', 'completed', 'Performance bonus'       │
│     );                                                         │
│                                                                │
│     COMMIT;                                                    │
│                                                                │
│  4. Notifications                                              │
│     - Push to John: "You received $200 from TechCorp"        │
│     - Email receipt to both parties                           │
│                                                                │
└────────────────────────────────────────────────────────────────┘

RESULT:
✅ Direct transfer completed
✅ No invoice required
✅ Settlement: Instant
✅ Fee: $0 (internal transfer)
```

---

### **Flow 3: Enterprise ← Enterprise (On Monay Platform)**

```
┌─────────────────────────────────────────────────────────────────┐
│  FLOW 3: B2B Payment Between Two Monay Enterprises            │
└─────────────────────────────────────────────────────────────────┘

ACTORS:
- TechCorp (Tenant A) - Software vendor
- HealthPlus (Tenant B) - Healthcare provider

SCENARIO: HealthPlus pays TechCorp $10,000 for software license

┌────────────────────────────────────────────────────────────────┐
│ Step 1: TechCorp Creates B2B Invoice                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  POST /api/invoices/create                                     │
│  {                                                             │
│    "tenant_id": "tenant-techcorp",                            │
│    "recipient_type": "enterprise",                            │
│    "recipient_tenant_id": "tenant-healthplus",                │
│    "amount": 10000,                                           │
│    "currency": "USD",                                         │
│    "payment_terms": "Net 30",                                 │
│    "items": [                                                  │
│      {                                                         │
│        "description": "Annual Software License",              │
│        "quantity": 1,                                         │
│        "unit_price": 10000                                    │
│      }                                                         │
│    ]                                                           │
│  }                                                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Step 2: HealthPlus Receives & Approves Invoice                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [HealthPlus Enterprise Dashboard - Port 3007]                 │
│                                                                │
│  • Finance team reviews invoice                               │
│  • Approval workflow (if required)                            │
│  • Clicks "Pay Invoice"                                       │
│                                                                │
│  POST /api/invoices/pay                                        │
│  {                                                             │
│    "invoice_id": "INV-B2B-001",                               │
│    "payment_method": "enterprise_wallet",                     │
│    "approved_by": "finance-manager-healthplus"                │
│  }                                                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Step 3: Payment Execution (Enterprise to Enterprise)          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  BEGIN TRANSACTION;                                            │
│                                                                │
│  -- Debit HealthPlus enterprise wallet                        │
│  UPDATE wallets                                                │
│  SET balance = balance - 10000                                 │
│  WHERE organization_id = 'tenant-healthplus'                  │
│    AND wallet_type = 'enterprise';                            │
│                                                                │
│  -- Credit TechCorp enterprise wallet                         │
│  UPDATE wallets                                                │
│  SET balance = balance + 10000                                 │
│  WHERE organization_id = 'tenant-techcorp'                    │
│    AND wallet_type = 'enterprise';                            │
│                                                                │
│  -- Record B2B transaction                                     │
│  INSERT INTO transactions (                                    │
│    type, amount, from_tenant, to_tenant,                      │
│    status, invoice_id                                         │
│  ) VALUES (                                                    │
│    'b2b_payment', 10000,                                      │
│    'tenant-healthplus', 'tenant-techcorp',                    │
│    'completed', 'INV-B2B-001'                                 │
│  );                                                            │
│                                                                │
│  -- Update invoice                                             │
│  UPDATE invoices                                               │
│  SET status = 'paid', paid_at = CURRENT_TIMESTAMP             │
│  WHERE id = 'INV-B2B-001';                                    │
│                                                                │
│  -- Audit trail                                                │
│  INSERT INTO audit_logs (                                      │
│    action, tenant_id, amount, details                         │
│  ) VALUES (                                                    │
│    'b2b_payment', 'tenant-healthplus',                        │
│    10000, 'Paid invoice INV-B2B-001 to TechCorp'             │
│  );                                                            │
│                                                                │
│  COMMIT;                                                       │
│                                                                │
└────────────────────────────────────────────────────────────────┘

RESULT:
✅ B2B payment completed
✅ Settlement: Instant (both on Monay platform)
✅ Fee: $0 (internal platform transfer)
✅ Compliance: Full audit trail
```

---

### **Flow 4: Enterprise ← External Enterprise (Off Monay)**

```
┌─────────────────────────────────────────────────────────────────┐
│  FLOW 4: Payment from External Enterprise to Monay Enterprise │
└─────────────────────────────────────────────────────────────────┘

ACTORS:
- TechCorp (on Monay) - Software vendor
- ExternalCorp (NOT on Monay) - Customer

SCENARIO: ExternalCorp pays TechCorp $15,000 via USDC transfer

┌────────────────────────────────────────────────────────────────┐
│ Step 1: TechCorp Shares Blockchain Address                    │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  TechCorp provides payment details to ExternalCorp:            │
│                                                                │
│  ┌────────────────────────────────────────────────┐          │
│  │ Payment Information                            │          │
│  │                                                 │          │
│  │ Recipient: TechCorp Inc                        │          │
│  │ Amount: $15,000 USD                            │          │
│  │                                                 │          │
│  │ Option 1: USDC on Base L2                      │          │
│  │ Address: 0x742d35Cc6634C0532925a3b844Bc9...    │          │
│  │ Network: Base (Ethereum L2)                    │          │
│  │ Token: USDC                                     │          │
│  │                                                 │          │
│  │ Option 2: Bank Wire                            │          │
│  │ Account: [...banking details...]               │          │
│  │                                                 │          │
│  │ Option 3: ACH                                  │          │
│  │ Routing: [...ACH details...]                   │          │
│  └────────────────────────────────────────────────┘          │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Step 2: ExternalCorp Sends USDC (Off-Platform)                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ExternalCorp uses their crypto wallet (e.g., MetaMask):      │
│                                                                │
│  Blockchain Transaction:                                       │
│  • From: 0xExternalCorp123... (their address)                 │
│  • To: 0x742d35Cc6634C0532925a3b844Bc9... (TechCorp)          │
│  • Amount: 15,000 USDC                                        │
│  • Network: Base L2                                           │
│  • Transaction Hash: 0xabc123def456...                        │
│                                                                │
│  This happens OUTSIDE Monay platform                           │
│  (Direct blockchain transfer)                                  │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Step 3: Monay Detects Incoming Transaction (Webhook)          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Circle Webhook → Monay Backend                                │
│                                                                │
│  POST /api/circle-wallets/webhook                              │
│  {                                                             │
│    "event": "transfer.incoming",                              │
│    "walletId": "circle-techcorp-wallet",                      │
│    "amount": "15000",                                         │
│    "currency": "USDC",                                        │
│    "from": "0xExternalCorp123...",                            │
│    "transactionHash": "0xabc123def456...",                    │
│    "blockchain": "base",                                      │
│    "status": "confirmed"                                       │
│  }                                                             │
│                                                                │
│  Backend Processing:                                           │
│                                                                │
│  1. Verify webhook signature (security)                       │
│     ✅ Valid Circle signature                                  │
│                                                                │
│  2. Update TechCorp's Circle wallet balance                   │
│     UPDATE user_circle_wallets                                 │
│     SET usdc_balance = usdc_balance + 15000                    │
│     WHERE organization_id = 'tenant-techcorp';                │
│                                                                │
│  3. Record external transaction                                │
│     INSERT INTO blockchain_transactions (                      │
│       wallet_id, transaction_hash, from_address,              │
│       to_address, value, token_symbol, chain,                 │
│       status, type, source                                    │
│     ) VALUES (                                                 │
│       'circle-techcorp-wallet',                               │
│       '0xabc123def456...',                                    │
│       '0xExternalCorp123...',                                 │
│       '0x742d35Cc6634C0532925a3b844Bc9...',                   │
│       15000, 'USDC', 'base',                                  │
│       'confirmed', 'incoming', 'external'                     │
│     );                                                         │
│                                                                │
│  4. Notify TechCorp                                            │
│     - Dashboard notification: "15,000 USDC received"          │
│     - Email: "Payment received from external wallet"          │
│     - Webhook to TechCorp's accounting system                 │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Step 4: (Optional) Convert USDC to Fiat                       │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  TechCorp may choose to convert USDC → USD:                   │
│                                                                │
│  POST /api/circle-wallets/bridge/to-monay                      │
│  {                                                             │
│    "amount": 15000,                                           │
│    "tenant_id": "tenant-techcorp"                             │
│  }                                                             │
│                                                                │
│  This moves USDC → Fiat in Monay wallet                       │
│  (See Bridge Transfer Flow below)                              │
│                                                                │
└────────────────────────────────────────────────────────────────┘

RESULT:
✅ External payment received via blockchain
✅ Settlement: ~2 seconds (blockchain confirmation)
✅ Fee: Network gas fee (paid by sender)
✅ TechCorp can keep as USDC or convert to fiat
```

---

### **Flow 5: Consumer → Consumer (Monay to Monay)**

```
┌─────────────────────────────────────────────────────────────────┐
│  FLOW 5: P2P Payment Between Monay Consumers                   │
└─────────────────────────────────────────────────────────────────┘

ACTORS:
- Alice (Monay consumer) - has Dual-Wallet
- Bob (Monay consumer) - has Dual-Wallet

SCENARIO: Alice sends $50 to Bob for dinner split

┌────────────────────────────────────────────────────────────────┐
│ Alice Initiates P2P Transfer                                  │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [Alice's Consumer App - Port 3003]                            │
│                                                                │
│  POST /api/p2p-transfer/send                                   │
│  {                                                             │
│    "from_user_id": "user-alice",                              │
│    "to_user_id": "user-bob",  // or phone/email               │
│    "amount": 50,                                              │
│    "wallet_preference": "auto",  // Smart routing             │
│    "note": "Dinner split - Italian restaurant"                │
│  }                                                             │
│                                                                │
│  Smart Routing Decision:                                       │
│  ┌────────────────────────────────────────────────┐          │
│  │ Analyzing Alice's wallets:                     │          │
│  │ • Monay Wallet: $5,000 ✅                      │          │
│  │ • Circle Wallet: 2,000 USDC ✅                 │          │
│  │                                                 │          │
│  │ Payment type: P2P (friend payment)             │          │
│  │ Both parties on Monay: YES                     │          │
│  │                                                 │          │
│  │ DECISION: Monay Wallet                         │          │
│  │ Reason: Zero fees for internal P2P             │          │
│  └────────────────────────────────────────────────┘          │
│                                                                │
│  Execution:                                                    │
│  BEGIN TRANSACTION;                                            │
│                                                                │
│  UPDATE wallets                                                │
│  SET balance = balance - 50                                    │
│  WHERE user_id = 'user-alice';                                │
│                                                                │
│  UPDATE wallets                                                │
│  SET balance = balance + 50                                    │
│  WHERE user_id = 'user-bob';                                  │
│                                                                │
│  INSERT INTO transactions (                                    │
│    type, from_user, to_user, amount, note                     │
│  ) VALUES (                                                    │
│    'p2p', 'user-alice', 'user-bob',                           │
│    50, 'Dinner split - Italian restaurant'                    │
│  );                                                            │
│                                                                │
│  COMMIT;                                                       │
│                                                                │
│  Bob receives push notification:                               │
│  "💰 Alice sent you $50.00"                                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘

RESULT:
✅ P2P transfer completed
✅ Fee: $0 (internal Monay network)
✅ Settlement: Instant
✅ Both users notified
```

---

### **Flow 6: Consumer → External Consumer (Monay to Non-Monay)**

```
┌─────────────────────────────────────────────────────────────────┐
│  FLOW 6: Payment to External Wallet (Non-Monay User)          │
└─────────────────────────────────────────────────────────────────┘

ACTORS:
- Alice (Monay consumer) - has Dual-Wallet
- Charlie (NOT on Monay) - has external crypto wallet

SCENARIO: Alice sends 100 USDC to Charlie's external wallet

┌────────────────────────────────────────────────────────────────┐
│ Alice Sends USDC to External Address                          │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  [Alice's Consumer App - Port 3003]                            │
│                                                                │
│  Screen: "Send to External Wallet"                             │
│                                                                │
│  Alice enters:                                                 │
│  • Recipient address: 0xCharlie789abc...                       │
│  • Network: Base L2                                            │
│  • Amount: 100 USDC                                            │
│  • From: Circle Wallet                                         │
│                                                                │
│  POST /api/circle-wallets/transfer                             │
│  {                                                             │
│    "from_wallet_id": "circle-alice",                          │
│    "to_address": "0xCharlie789abc...",                        │
│    "amount": 100,                                             │
│    "currency": "USDC",                                        │
│    "network": "base",                                         │
│    "note": "Payment to Charlie"                               │
│  }                                                             │
│                                                                │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│ Backend Routes Through Tempo/Circle                            │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Provider Selection:                                           │
│  1. Check Tempo availability → ✅ Available                    │
│  2. Check currency support → ✅ USDC supported                 │
│  3. Use Tempo for transaction                                  │
│                                                                │
│  Tempo Transfer Execution:                                     │
│                                                                │
│  const transfer = await tempoService.transfer({                │
│    from: alice_circle_wallet_address,                          │
│    to: '0xCharlie789abc...',                                  │
│    amount: 100,                                               │
│    currency: 'USDC',                                          │
│    blockchain: 'base'                                         │
│  });                                                           │
│                                                                │
│  Blockchain Transaction:                                       │
│  • From: 0xAlice... (Alice's Circle wallet address)           │
│  • To: 0xCharlie789abc... (external address)                   │
│  • Amount: 100 USDC                                            │
│  • Network: Base L2                                            │
│  • Fee: $0.0001 (Tempo infrastructure fee)                    │
│  • Confirmation: < 1 second                                    │
│  • Tx Hash: 0xdef789ghi012...                                 │
│                                                                │
│  Database Update:                                              │
│  UPDATE user_circle_wallets                                    │
│  SET usdc_balance = usdc_balance - 100                         │
│  WHERE id = 'circle-alice';                                   │
│                                                                │
│  INSERT INTO blockchain_transactions (                         │
│    user_id, wallet_id, transaction_hash,                      │
│    from_address, to_address, value,                           │
│    token_symbol, chain, status, type                          │
│  ) VALUES (                                                    │
│    'user-alice', 'circle-alice',                              │
│    '0xdef789ghi012...',                                       │
│    '0xAlice...', '0xCharlie789abc...',                        │
│    100, 'USDC', 'base',                                       │
│    'confirmed', 'external_transfer'                           │
│  );                                                            │
│                                                                │
│  Alice sees:                                                   │
│  ┌────────────────────────────────────────────────┐          │
│  │ ✅ Transfer Successful                         │          │
│  │                                                 │          │
│  │ Sent: 100 USDC                                 │          │
│  │ To: 0xCharlie789abc...                         │          │
│  │ Network: Base L2                               │          │
│  │ Fee: $0.0001                                   │          │
│  │ Status: Confirmed                              │          │
│  │ Transaction: 0xdef789ghi012...                 │          │
│  │                                                 │          │
│  │ [View on Block Explorer]                       │          │
│  └────────────────────────────────────────────────┘          │
│                                                                │
│  Charlie receives USDC in his external wallet                 │
│  (Automatically, via blockchain)                               │
│                                                                │
└────────────────────────────────────────────────────────────────┘

RESULT:
✅ External transfer completed via blockchain
✅ Fee: $0.0001 (Tempo)
✅ Settlement: < 1 second
✅ Charlie receives USDC in his external wallet
```

---

## 🗄️ Database Architecture

### **Core Wallet Tables**

```sql
-- ============================================
-- ENTERPRISE WALLETS
-- ============================================
CREATE TABLE wallets (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),

    -- Wallet details
    wallet_name VARCHAR(255),
    wallet_type VARCHAR(50) NOT NULL,  -- 'enterprise', 'consumer'
    wallet_address VARCHAR(255),       -- Blockchain address

    -- Blockchain config
    blockchain VARCHAR(50) DEFAULT 'base',  -- 'base', 'solana'
    chain_id INTEGER,

    -- Balance
    balance DECIMAL(40, 18) DEFAULT 0,
    locked_balance DECIMAL(40, 18) DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_primary BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONSUMER CIRCLE WALLETS (USDC)
-- ============================================
CREATE TABLE user_circle_wallets (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),

    -- Circle API details
    circle_wallet_id VARCHAR(255) NOT NULL,  -- From Circle API
    circle_address VARCHAR(255) NOT NULL,    -- Blockchain address
    wallet_type VARCHAR(50) DEFAULT 'end_user_wallet',

    -- Balance tracking
    usdc_balance DECIMAL(20, 6) DEFAULT 0,
    available_balance DECIMAL(20, 6) DEFAULT 0,
    pending_balance DECIMAL(20, 6) DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'active',
    last_synced_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WALLET LINKS (Dual-Wallet System)
-- ============================================
CREATE TABLE wallet_links (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE REFERENCES users(id),

    -- Link both wallets
    monay_wallet_id UUID REFERENCES wallets(id),
    circle_wallet_id UUID REFERENCES user_circle_wallets(id),

    -- Configuration
    link_status VARCHAR(20) DEFAULT 'active',
    auto_bridge_enabled BOOLEAN DEFAULT true,
    preferred_wallet VARCHAR(20) DEFAULT 'smart',  -- 'monay', 'circle', 'smart'
    balance_threshold DECIMAL(20, 2),

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BRIDGE TRANSFERS (Between Wallets)
-- ============================================
CREATE TABLE bridge_transfers (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),

    -- Transfer direction
    direction VARCHAR(30) CHECK (direction IN ('monay_to_circle', 'circle_to_monay')),

    -- Amounts
    amount DECIMAL(20, 2) NOT NULL,
    fee_amount DECIMAL(10, 2) DEFAULT 0,

    -- Status tracking
    status VARCHAR(20) DEFAULT 'pending',
    circle_reference_id VARCHAR(255),

    -- Timing
    initiated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    estimated_completion TIMESTAMPTZ,

    -- Metadata
    trigger_type VARCHAR(50),  -- 'manual', 'auto_balance', 'payment_routing'
    metadata JSONB
);

-- ============================================
-- ROUTING DECISIONS (Smart Routing Audit)
-- ============================================
CREATE TABLE routing_decisions (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    transaction_id UUID,

    -- Decision
    decision_type VARCHAR(50),  -- 'payment', 'transfer', 'invoice'
    selected_wallet VARCHAR(20),  -- 'monay', 'circle', 'split'
    routing_reason TEXT,

    -- Amounts
    total_amount DECIMAL(20, 2),
    monay_amount DECIMAL(20, 2),
    circle_amount DECIMAL(20, 2),

    -- Fee analysis
    monay_fee_estimate DECIMAL(10, 2),
    circle_fee_estimate DECIMAL(10, 2),
    selected_fee DECIMAL(10, 2),
    fee_savings DECIMAL(10, 2),

    -- Time analysis
    monay_time_estimate INTEGER,  -- seconds
    circle_time_estimate INTEGER,  -- seconds
    selected_time INTEGER,

    -- Scores
    score_monay INTEGER,
    score_circle INTEGER,

    -- Factors
    factors JSONB,  -- Payment type, international, etc.

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BLOCKCHAIN TRANSACTIONS
-- ============================================
CREATE TABLE blockchain_transactions (
    id UUID PRIMARY KEY,
    user_id VARCHAR(255) REFERENCES users(id),
    wallet_id UUID,

    -- Blockchain details
    chain VARCHAR(50) NOT NULL,  -- 'base', 'solana'
    transaction_hash VARCHAR(255) UNIQUE,
    from_address VARCHAR(255),
    to_address VARCHAR(255),

    -- Value
    value DECIMAL(40, 18),
    token_address VARCHAR(255),
    token_symbol VARCHAR(20),  -- 'USDC', 'USDT', etc.

    -- Gas
    gas_used BIGINT,
    gas_price DECIMAL(40, 18),

    -- Status
    status VARCHAR(20),  -- 'pending', 'confirmed', 'failed'
    type VARCHAR(50),  -- 'incoming', 'outgoing', 'external_transfer'
    source VARCHAR(50),  -- 'internal', 'external', 'tempo', 'circle'

    -- Timing
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,

    -- Metadata
    metadata JSONB
);
```

---

## 🔌 API Integration Guide

### **Consumer Wallet APIs**

#### **Initialize Dual-Wallet**
```javascript
POST /api/circle-wallets/initialize
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "monay_wallet": {
      "id": "wallet-abc123",
      "balance": 0,
      "currency": "USD"
    },
    "circle_wallet": {
      "id": "circle-def456",
      "address": "0x742d35Cc...",
      "usdc_balance": 0
    },
    "link": {
      "id": "link-ghi789",
      "status": "active",
      "preferred_wallet": "smart"
    }
  }
}
```

#### **Get Combined Balance**
```javascript
GET /api/circle-wallets/balance
Authorization: Bearer {token}

Response:
{
  "monay_balance": 5000.00,
  "circle_balance": 2000.00,
  "total_usd_value": 7000.00,
  "currency": "USD",
  "breakdown": {
    "monay_wallet": {
      "balance": 5000.00,
      "available": 5000.00,
      "pending": 0
    },
    "circle_wallet": {
      "usdc_balance": 2000.00,
      "available": 2000.00,
      "pending": 0,
      "usd_value": 2000.00
    }
  }
}
```

#### **Smart Routing Decision**
```javascript
POST /api/circle-wallets/routing/optimize
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 100,
  "payment_type": "payment",
  "recipient_type": "consumer",
  "metadata": {
    "international": false,
    "urgency": "normal"
  }
}

Response:
{
  "recommended_wallet": "circle",
  "reason": "Better fees and speed with Circle",
  "routing_id": "route-xyz123",
  "analysis": {
    "balances": {
      "monay_balance": 5000,
      "circle_balance": 2000,
      "total": 7000
    },
    "fees": {
      "monay": 2.50,
      "circle": 0.25
    },
    "times": {
      "monay": 86400,  // 1 day in seconds
      "circle": 2       // 2 seconds
    },
    "scores": {
      "monay": 45,
      "circle": 85
    },
    "can_use_monay": true,
    "can_use_circle": true,
    "fee_savings": 2.25
  }
}
```

#### **Bridge Transfer Between Wallets**
```javascript
// Monay → Circle
POST /api/circle-wallets/bridge/to-circle
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 1000
}

Response:
{
  "success": true,
  "transfer_id": "bridge-abc123",
  "direction": "monay_to_circle",
  "amount": 1000,
  "fee": 0,
  "estimated_time": "30-60 minutes",
  "status": "pending"
}

// Circle → Monay
POST /api/circle-wallets/bridge/to-monay
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 500
}

Response:
{
  "success": true,
  "transfer_id": "bridge-def456",
  "direction": "circle_to_monay",
  "amount": 500,
  "fee": 0,
  "estimated_time": "1-2 business days",
  "status": "pending"
}
```

---

### **Enterprise Wallet APIs**

#### **Get Enterprise Wallet Balance**
```javascript
GET /api/wallets/enterprise/balance
Authorization: Bearer {token}

Response:
{
  "wallet_id": "wallet-enterprise-123",
  "organization_id": "tenant-techcorp",
  "balance": 425850.00,
  "locked_balance": 0,
  "available_balance": 425850.00,
  "currency": "USD",
  "blockchain": "base",
  "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
  "stablecoin_balances": {
    "USDC": 100000,
    "USDT": 50000,
    "PYUSD": 25000
  }
}
```

#### **Create Invoice**
```javascript
POST /api/invoices/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "tenant_id": "tenant-techcorp",
  "recipient_type": "consumer",  // or "enterprise"
  "recipient_id": "user-john-doe",
  "amount": 500,
  "currency": "USD",
  "description": "Consulting services - January 2025",
  "payment_methods_accepted": ["monay_wallet", "circle_wallet"],
  "due_date": "2025-02-01"
}

Response:
{
  "success": true,
  "invoice": {
    "id": "INV-2025-001234",
    "status": "pending_payment",
    "amount": 500,
    "currency": "USD",
    "created_at": "2025-01-15T10:00:00Z",
    "due_date": "2025-02-01T23:59:59Z",
    "payment_url": "https://app.monay.com/invoices/INV-2025-001234"
  }
}
```

---

## 📊 Architecture Decision Records

### **ADR-001: Why Dual-Wallet for Consumers?**

**Decision**: Implement separate Monay and Circle wallets for consumers rather than a unified balance.

**Reasoning**:
1. **Currency Separation**: Fiat USD vs USDC have different characteristics
2. **Compliance**: Different regulatory requirements for fiat vs crypto
3. **User Choice**: Some users prefer keeping crypto separate
4. **Risk Management**: Limits exposure if one system has issues
5. **Accounting**: Clearer financial reporting

**Trade-offs**:
- ✅ Better security and compliance
- ✅ More flexibility for users
- ⚠️ Slightly more complex UX (mitigated by smart routing)

---

### **ADR-002: Why Tempo as Primary Provider?**

**Decision**: Use Tempo as primary stablecoin infrastructure, Circle as fallback.

**Reasoning**:
1. **Performance**: 100,000+ TPS vs 1,000 TPS
2. **Cost**: $0.0001 vs $0.05 per transaction (500x cheaper)
3. **Multi-Currency**: 5 stablecoins vs 1 (USDC only)
4. **Speed**: Sub-second vs 2-15 second finality

**Trade-offs**:
- ✅ Industry-leading performance
- ✅ Future-proof for scale
- ⚠️ Newer provider (mitigated by Circle fallback)

---

### **ADR-003: Why Smart Routing?**

**Decision**: Implement intelligent routing engine rather than forcing users to choose wallets.

**Reasoning**:
1. **UX**: Most users don't want to think about which wallet to use
2. **Optimization**: Algorithm can optimize better than humans
3. **Cost Savings**: Automatically selects cheaper option
4. **Speed**: Selects faster option when appropriate

**Implementation**:
- 30% weight: Fees
- 30% weight: Speed
- 20% weight: Balance availability
- 20% weight: Payment type preference

---

## 🎓 Summary

### **Key Concepts**

1. **Wallets Are User Accounts**
   - Monay Wallet = Fiat USD account
   - Circle Wallet = USDC account
   - Users can have both (dual-wallet)

2. **Providers Are Infrastructure**
   - Tempo = Blockchain infrastructure (PRIMARY)
   - Circle = Infrastructure + Wallet API (FALLBACK)
   - Neither holds user balances directly

3. **Smart Routing Optimizes Everything**
   - Automatically selects best wallet
   - Considers fees, speed, balance, type
   - Transparent to user

4. **Transaction Flows Are Seamless**
   - Invoice-first model (recommended)
   - Direct transfers (supported)
   - External payments (blockchain)
   - Internal P2P (instant, free)

### **For Developers**

- Use `wallet_orchestrator_service.js` for all wallet operations
- Never bypass smart routing unless explicitly required
- Always record routing decisions for analytics
- Use transactions for all financial operations
- Test with both Tempo and Circle providers

### **For Product**

- Invoice-first flow is recommended for B2C
- Smart routing should be default (with manual override)
- Dual-wallet provides choice without complexity
- External payments work via blockchain addresses

---

**End of Documentation**

This architecture provides a robust, scalable, and user-friendly foundation for Monay's dual-rail payment platform.
