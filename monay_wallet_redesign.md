# MONAY_WALLET_REDESIGN.md

## 1. Overview
Monay Wallet is a unified **fiat + crypto orchestration platform** designed to power both enterprise and consumer payments globally. Built on a **forked TilliPay orchestration core (MonayPay)**, it integrates **Cross River Bank** (for fiat rails), **BitGo** (for custody and stablecoins), and **Tempo** (for cross-border settlements). The system supports **Invoice-First logic** and **Business Rule Engine (BRE)**-based policy enforcement across multiple blockchain networks.

---

## 2. Strategic Objectives
- Create a **self-sufficient wallet ecosystem** supporting all major fiat and stablecoin assets.
- Enable **global settlement** through direct bank and custody integrations (U.S., EMEA, APAC, MENA, India).
- Maintain **65%+ gross margin** through owned orchestration logic and BRE automation.
- Remove dependency on third-party rails (e.g., Circle, Stripe, Fiserv).
- Provide **developer SDKs/APIs** for wallet, invoice, and orchestration extensions.

---

## 3. Provider Summary and Rationale
| Component | Provider | Role | Key Benefits |
|------------|-----------|------|---------------|
| **Fiat Rails** | **Cross River Bank** | ACH, FedNow, RTP, SWIFT | Regulated U.S. bank, fintech-native, scalable APIs |
| **Custody / Stablecoins** | **BitGo Trust** | Multi-chain custody (USDC, PYUSD, EURC, etc.) | Global reach (U.S. + Switzerland), institutional-grade security |
| **Cross-Border / FX** | **Tempo** | International payments, SEPA, SWIFT, on/off-ramp | EU-regulated PSP, native stablecoin ↔ fiat conversion |
| **Orchestration** | **MonayPay (forked from TilliPay)** | Unified ledger, compliance, routing, invoice-first logic | PCI DSS/SOC2 compliant, modular, and extensible |

**Justification:** Cross River + BitGo + Tempo collectively provide global coverage, high compliance readiness, and API-native access without Circle or Fiserv dependency.

---

## 4. System Architecture
```
┌──────────────────────────────┐
│         Monay Wallet         │
│ (Enterprise + Consumer UX)   │
└─────────────┬────────────────┘
              │
              ▼
┌──────────────────────────────┐
│        MonayPay Core         │
│ (Forked TilliPay Engine)     │
│ Ledger • Routing • Rules     │
└─────────────┬────────────────┘
     ┌─────────┼─────────┐
     ▼         ▼         ▼
┌────────┐  ┌────────┐  ┌────────┐
│Cross   │  │ BitGo  │  │ Tempo  │
│River   │  │ Custody│  │ FX /   │
│Banking │  │ Stable │  │ Global │
│Rails   │  │ Coins  │  │ Rails  │
└────────┘  └────────┘  └────────┘
     │            │           │
     ▼            ▼           ▼
┌──────────────────────────────────────┐
│ Business Rule Engine (BRE)           │
│  - Compliance & Policy Enforcement   │
│  - Cross-chain synchronization       │
└──────────────────────────────────────┘
```

---

## 5. Core Components
### **A. Super Admin Layer**
Central governance for global operations.
- Manage integrations (Cross River, BitGo, Tempo).
- Publish BRE policies and orchestration templates.
- Oversee compliance dashboards, rate limits, and KYC rules.

### **B. Enterprise Wallet**
For B2B payments, ERP integrations, and invoice-first flows.
- Deterministic, invoice-scoped wallet creation.
- Smart contract escrow tied to milestone attestations.
- ERP synchronization (SAP, Oracle, Dynamics) via OAuth.
- Zeroization of ephemeral keys after settlement.

### **C. Consumer Wallet**
Self-custodial, multi-asset wallet with fiat on/off ramps.
- Fiat top-up (ACH, FedNow, Card, SWIFT).
- Multi-chain stablecoin transfers (USDC, USDT, PYUSD, EURC).
- Peer-to-peer transactions under BRE policy enforcement.
- SDKs for 3rd-party developer integrations.

---

## 6. MonayPay (Forked TilliPay Core)
| Module | Function | Technology |
|---------|-----------|-------------|
| **Ledger Service** | Double-entry ledger for fiat + crypto | PostgreSQL + Redis Streams |
| **Router Engine** | Chooses optimal rail (ACH, FedNow, Crypto) | Go/Node.js microservices |
| **Compliance Engine** | KYC/KYB/AML pre-checks | BRE-driven rules + AI models |
| **Audit Layer** | On-chain hash anchoring and logs | SHA256 + Merkle DAG proofs |
| **ERP Connector** | Bi-directional sync with ERP | HTTPS OAuth APIs |

---

## 7. Tempo Integration Layer
Tempo is integrated as Monay’s **international liquidity and FX provider**, enabling global cross-border payments without Circle APIs.

### **Key Functions:**
- **FX Quoting:** MonayPay requests Tempo API for live conversion rates.
- **Settlement Routing:** Tempo executes cross-border SWIFT/SEPA/UPI transfers.
- **Stablecoin Conversion:** Tempo converts stablecoins ↔ local fiat.
- **KYT + AML:** Tempo’s risk engine feeds compliance data into BRE.

### **Integration Flow:**
```
[Monay Wallet]
     │
     ▼
[Invoice Created] → [MonayPay Router]
     │                     │
     ▼                     ▼
[Cross River] (Domestic)   [Tempo FX API] (Cross-Border)
     │                     │
     ▼                     ▼
[BitGo Custody] ←→ [Tempo Liquidity Wallet]
     │                     │
     ▼                     ▼
[Settlement] → [Invoice Escrow Release → ERP Update]
```

### **Benefits of Tempo Integration:**
| Advantage | Description |
|------------|-------------|
| **Global Reach** | Connects to 170+ currencies via SWIFT/SEPA rails. |
| **Stablecoin Liquidity** | Enables direct swaps between fiat and digital assets. |
| **Regulated Entity** | EU PSD2 compliance for cross-border transactions. |
| **Low Spread** | FX margin under 0.5% → supports Monay’s 70%+ gross margin. |

---

## 8. Sequence Diagram – Invoice to Settlement
```
ERP System ─► MonayPay ─► BRE ─► Cross River ─► Tempo ─► BitGo ─► ERP
     │           │          │          │           │         │
     │ 1. Create Invoice (ID)
     │ 2. Derive Wallet (Ephemeral Key)
     │ 3. BRE Compliance Check
     │ 4. Route via Cross River or Tempo
     │ 5. Execute Transfer / FX / Custody
     │ 6. Confirm Settlement → Zeroize Key
     │ 7. Reconcile + Update ERP
```

---

## 9. Business Rule Engine (BRE) Enforcement Sequence
```
Rule Definition → Compilation → Deployment → Evaluation → Attestation → Synchronization
```
- Rules expressed in universal JSON schema.
- Compiled to chain-specific code (Solidity, Rust).
- Deployed via adapters (EVM, Solana, Polygon).
- Evaluates policy (AML, KYC, Jurisdictional, Escrow conditions).
- Produces signed attestation → anchored on-chain.
- Synchronizes versions across all chains.

**Integration Examples:**
- Deny transaction if payee country is sanctioned.
- Require oracle attestation for milestone completion.
- Route transaction via Tempo if foreign invoice currency detected.

---

## 10. Invoice-First Lifecycle
```
Create Invoice → Derive Wallet → Authorize Transaction → Settle → Zeroize Key → Reconcile ERP
```
- **Wallet Derivation:** Invoice ID + HSM Salt → Deterministic address.
- **Post-Quantum Security:** ML-KEM (Kyber) + ML-DSA (Dilithium) hybrid signatures.
- **Smart Contract Escrow:** Binds invoice ID to release condition.
- **Lifecycle Control:** Key erased after settlement, escrow finalized.

---

## 11. Global Banking and Custody Expansion
| Region | Bank Integration | Custody Node |
|---------|------------------|---------------|
| **U.S.** | Cross River (ACH, FedNow) | BitGo / Anchorage |
| **India** | Axis / HDFC (UPI) | Local RBI-licensed custodian |
| **Europe** | Railsbank / Solaris | BitGo Switzerland |
| **Middle East** | Emirates NBD / Mashreq | BitOasis / Fireblocks |
| **Asia-Pacific** | DBS / Airwallex | Hex Trust / Fireblocks APAC |

---

## 12. Security & Compliance Stack
| Area | Mechanism |
|------|------------|
| Encryption | ML-KEM + AES-GCM hybrid |
| Custody | HSM-backed key management (BitGo) |
| Audit | On-chain attestation via BRE |
| PCI DSS | Inherited from TilliPay fork |
| SOC 2 | CloudOps & access control |
| AML/KYC | AI-based screening + Tempo KYT feeds |

---

## 13. Long-Term Roadmap
1. Phase 1 – Launch with Cross River + BitGo + Tempo (MVP).
2. Phase 2 – Internalize orchestration (TilliPay → MonayPay).
3. Phase 3 – Add regional rails (UPI, SEPA, PIX).
4. Phase 4 – Introduce MonayFiat token backed by reserves.
5. Phase 5 – Monetize MonayPay SDKs + global API marketplace.

---

## 14. Summary
| Objective | Achieved By |
|------------|--------------|
| High-margin wallet (>65%) | Own orchestration (MonayPay) + low-cost bank/custody stack |
| Global settlement | Cross River (domestic) + Tempo (international) |
| Stablecoin & fiat support | BitGo multi-chain custody |
| Compliance-first | BRE policy enforcement & attestation |
| Invoice-first logic | Deterministic wallets + smart-contract escrow |
| Developer extensibility | SDKs + APIs for ERP, wallets, and payments |

**Result:** Monay Wallet becomes a *global, compliant, multi-rail payment and custody ecosystem*, supporting both enterprises and consumers with smart orchestration, flexible integrations, and decentralized auditability.



---

## 15. Circle Dependency Analysis & Elimination Strategy
**Position:** Monay operates *without* Circle APIs. USDC (and other stablecoins) are supported via **BitGo custody** and **Tempo on/off‑ramp** where needed.

**Why we can remove Circle APIs**
- **Fiat rails:** Cross River (ACH, FedNow, RTP, SWIFT) replaces Circle’s banking legs.
- **Custody & issuance flow:** BitGo manages USDC/other stablecoins custody and handles mint/redeem with issuers at the custody layer; Monay does not integrate Circle directly.
- **Cross‑border:** Tempo provides FX + settlement (SEPA/SWIFT/UPI), removing Circle’s cross‑border role.
- **Orchestration:** MonayPay (forked TilliPay) provides ledger, routing, and compliance—no Circle treasury needed.

**Risk Controls**
- BRE rule to **enable/disable specific stablecoins** per jurisdiction.
- Liquidity mirrors across USDC, PYUSD, USDT, EURC; failover rails: FedNow/RTP ↔ on‑chain swap.
- Custody diversification: BitGo primary, Anchorage optional.

**When Circle might still be used (optional)**
- Direct *primary* USDC mint/redeem for treasury optimization (via BitGo integration path). Not required for wallet operations.

---

## 16. Pricing Matrix & Unit Economics
A flexible pricing model that achieves **≥65% gross margin** across Consumer and Enterprise.

### 16.1 Variables
- **ATV** = Average Transaction Value
- **TTR** = Monay Take Rate (% of volume)
- **FXS** = FX Spread (Tempo)
- **PROC_fiat** = Fiat processing cost (ACH/FedNow/RTP/card)
- **PROC_chain** = On‑chain cost (gas + custody bps)
- **CUST_bps** = BitGo custody bps on AUC (annualized → per txn allocation)
- **KYC_fee** = Per‑user onboarding cost (amortized per txn)
- **SUPPORT_fee** = Variable support cost per txn (amortized)

### 16.2 Formulas
**Revenue/txn** = `ATV × TTR + (FX volume × FXS)`  
**Direct Cost/txn** = `PROC + gas + (ATV × CUST_bps_alloc) + KYC_fee + SUPPORT_fee`  
**Gross Margin** = `(Revenue − Direct Cost) ÷ Revenue`

Where `PROC` selects **PROC_fiat** or **PROC_chain** based on router decision.

### 16.3 Reference Cost Ranges (assumptions)
- ACH/FedNow/RTP: **$0.05–$0.15** per txn (RTP may be tiered caps)
- Card (if used): **1.8–2.5%** interchange + scheme ~**0.1%** (use sparingly)
- On‑chain gas (EVM L2): **$0.02–$0.20** typical (volatile)
- Custody (BitGo): **10–20 bps/year** (allocate per txn by avg turnover)
- Tempo FX spread: **0.20–0.50%** (corridor‑dependent)

### 16.4 Pricing Tiers
| Segment | Take Rate (TTR) | Notes |
|---|---:|---|
| **Consumer** | **1.20–1.50%** | Small‑ticket, higher support amortization |
| **Enterprise Domestic** | **0.80–1.10%** | ACH/FedNow heavy; high volume |
| **Enterprise Cross‑Border** | **1.00–1.40% + FX 0.2–0.5%** | Tempo FX + SEPA/SWIFT

### 16.5 Worked Examples
**A) Consumer ACH top‑up, $100 ATV**  
Revenue: `100×1.3% = $1.30`  
Costs: `ACH $0.08 + custody alloc $0.02 + KYC amort $0.05 + support $0.03 = $0.18`  
Gross Margin: `(1.30−0.18)/1.30 = **86%**`

**B) Enterprise domestic invoice, $5,000 ATV (ACH)**  
Revenue: `5000×0.9% = $45.00`  
Costs: `ACH $0.10 + custody alloc $0.50 + support $0.10 = $0.70`  
Gross Margin: `(45.00−0.70)/45.00 = **98%**`

**C) Enterprise cross‑border, $10,000 ATV (Tempo FX 0.35%)**  
Revenue: `10000×1.1% + 10000×0.35% = $110 + $35 = $145`  
Costs: `SWIFT $12 (blended) + custody alloc $1.00 + support $0.25 = $13.25`  
Gross Margin: `(145−13.25)/145 = **90.9%**`

> **Note:** Card rails reduce margins; prefer ACH/FedNow/RTP or on‑chain where compliant.

### 16.6 Price Card (Publishable)
- **Domestic ACH/FedNow Payments:** 0.9–1.1% (Enterprise); 1.3–1.5% (Consumer)
- **Cross‑Border via Tempo:** 1.0–1.4% + FX 0.20–0.50%
- **On‑Chain Stablecoin Settlement:** 0.9–1.2%
- **Add‑ons:** Invoice Escrow $0.05–$0.25/txn; Advanced Compliance $0.02–$0.10/txn

---

## 17. Refactoring Plan for Dual‑Rail Orchestration (Fiat ↔ Crypto)
Goal: **Best‑rail selection** per transaction with policy, cost, and reliability constraints.

### 17.1 Abstractions
- **Rail Provider Interface**: `bank.pay()`, `custody.transfer()`, `fx.quote()`, `chain.send()`
- **Asset Model**: Chain‑agnostic token schema (fiat/stablecoin) with normalization (decimals, metadata).
- **Rule Adapter**: BRE‑compiled evaluators (EVM/SVM) invoked pre‑route.

### 17.2 Router Decision Function
Score each eligible rail and choose `argmax(score)`.
```
score(rail) = w_cost·f_cost + w_time·f_time + w_fx·f_fx + w_liq·f_liq + w_policy·f_policy + w_reliab·f_reliab
```
- **f_cost**: estimated total cost (fees + gas)
- **f_time**: settlement SLA (ms/min)
- **f_fx**: FX spread (if cross‑border)
- **f_liq**: available liquidity depth
- **f_policy**: BRE compliance (1 allow / 0 deny / fractional for conditional)
- **f_reliab**: recent rail health (success rate, latency percentiles)

### 17.3 Services to Refactor in MonayPay (forked TilliPay)
- **Router v2**: plug‑in rails (Cross River, BitGo, Tempo) with scoring + fallback tree; add **transaction intents** and **idempotency**.
- **Ledger v2**: dual‑entry for fiat & crypto with **atomic multi‑leg postings** (e.g., fiat debit + stablecoin credit) and **reconciliation snapshots**.
- **Compliance v2**: synchronous BRE gate (pre‑auth) + asynchronous **attestation DAG** anchoring.
- **Escrow v2**: invoice‑bound contract templates; oracle attestation handler.
- **FX Service**: Tempo first, pluggable quotes (BankProv/M&T or market makers) with **best‑of‑N** selection.
- **Telemetry**: per‑rail metrics, SLOs, circuit‑breakers, and auto‑degrade strategies.
- **Config & Feature Flags**: per‑jurisdiction policies, asset allow‑lists, and dynamic weights.

### 17.4 Failure & Fallback Patterns
- If **RTP/FedNow** down → auto‑fallback to ACH same‑day.
- If **tempo.fx > max_spread** → route on‑chain stablecoin + local cash‑out.
- If **gas spike** → prefer fiat rails unless SLA requires on‑chain.
- If **custody congestion** → split payouts across addresses (BitGo fan‑out).

### 17.5 Developer Surface (APIs/SDKs)
- `POST /payments/intents` → returns selected rail + quote + SLA
- `POST /payments/confirm` → executes on chosen rail
- `GET /payments/{id}` → unified status across rails
- Webhooks: `payment.settled`, `escrow.released`, `erp.synced`
- SDKs: Typescript/Java/Kotlin/Swift with typed models for invoices, rails, and tokens

### 17.6 Compliance Hooks
- Geofence & sanction screening at **intent** time.
- Travel Rule payload injection for eligible corridors.
- Rule‑version in every decision log; signed attestation anchored periodically.

---

## 18. Appendices
- **A. Corridor Playbooks:** EU (SEPA), India (UPI), MEA (SWIFT Instant), APAC (FPS/PayNow).
- **B. Asset Allow‑List:** USDC, USDT, PYUSD, EURC (+ future issuer registry via BRE).
- **C. SLA Targets:** Domestic ≤ 1 min; Cross‑border ≤ 30 min; On‑chain ≤ 5 min on L2.

