
# Monay Common Backend & Orchestration (MonayPay) — SPEC

## 0. Purpose
Define the **shared backend** that powers Super Admin, Enterprise Wallet, and Consumer Wallet. This service is a fork and refactor of TilliPay into **MonayPay**, providing **dual-rail orchestration (fiat ↔ crypto)**, a **unified ledger**, **BRE-based compliance**, **invoice-first lifecycle**, and integrations with **Cross River (fiat)**, **BitGo (custody/stablecoins)**, and **Tempo (cross-border/FX)**.

## 1. Scope
- Core services: Router, Ledger, Compliance (BRE), Escrow, FX, ERP Connectors, Audit/Attestation.
- Providers: Cross River (ACH/FedNow/RTP/SWIFT), BitGo (custody + stablecoins), Tempo (SEPA/SWIFT/FX).
- No dependency on Circle APIs (USDC supported via BitGo/Tempo).

## 2. Architecture (Services)
- **router-v2**: best-rail selection with scoring.
- **ledger-v2**: double-entry, atomic multi-leg postings (fiat + crypto).
- **compliance-v2**: synchronous BRE gate; asynchronous attestation DAG anchoring.
- **escrow-v2**: invoice-bound smart contracts + oracle attestations.
- **fx-v1**: Tempo quotes + best-of-N providers (future).
- **erp-bridge**: SAP/Oracle/Dynamics OAuth connectors.
- **audit**: immutable event log + periodic on-chain hash anchoring.
- **telemetry**: SLOs, circuit breakers, per-rail health.

### 2.1 Data stores
- Postgres (ledger, configs, invoices, wallets, rule snapshots)
- Redis Streams (events)
- Object store (attestations, reports)
- HSM/KMS (keys; PQC seeds for invoice keys)

## 3. Orchestration Algorithm (Dual Rail)
```
score(rail) = w_cost*f_cost + w_time*f_time + w_fx*f_fx + w_liq*f_liq 
              + w_policy*f_policy + w_reliab*f_reliab

Eligible rails per txn:
- Domestic: ACH, FedNow/RTP, on-chain stablecoin
- Cross-border: Tempo (SEPA/SWIFT/UPI), on-chain + local cashout (future)
```
- **Constraints** enforced by BRE: jurisdiction, KYC tier, asset allowlist, limits, sanctioned entities.
- **Fallbacks**: RTP→ACH, high gas→fiat, FX spread > threshold→stablecoin path.

## 4. Invoice-First Lifecycle
- Derive invoice-scoped wallet (InvoiceID + HSM salt) → Ephemeral keys (PQC hybrid)
- Optional escrow contract bound to invoice ID
- On settlement: reconciliation → key zeroization → ERP update

## 5. Public API (selected)
- `POST /v1/payments/intents` → returns chosen rail + quote + SLA + compliance status
- `POST /v1/payments/confirm`  → executes on selected rail (idempotent)
- `GET  /v1/payments/{id}`     → consolidated status
- `POST /v1/escrow/{invoiceId}/release` → oracle attestation payload
- `POST /v1/invoices` / `GET /v1/invoices/{id}`
- Webhooks: `payment.settled`, `escrow.released`, `erp.synced`, `bre.attested`

## 6. Provider Adapters
- **CrossRiverAdapter**: ACH/FedNow/RTP/SWIFT, sub-accounts (FBO); 2FA signing.
- **BitGoAdapter**: wallet ops, multi-chain transfers, custody fees tracking, USDC/PYUSD/EURC.
- **TempoAdapter**: FX quote/execute, settlement webhooks, corridor metadata (SEPA/SWIFT/UPI).

## 7. Refactoring Tasks (from TilliPay → MonayPay)
1. Extract routing logic into **router-v2** with pluggable adapters and scoring.
2. Upgrade ledger to support **atomic multi-leg postings** (fiat debit + crypto credit).
3. Implement **idempotent intents** with server-side reservation + expiry.
4. Integrate BRE gate (sync) + **attestation DAG** (async) and on-chain anchoring.
5. Add **escrow-v2** with deterministic invoice mapping and oracle API.
6. Implement **fx-v1** (Tempo) with policy-aware max spread guardrail.
7. Telemetry & SLOs per rail + circuit-breaker library.
8. Config service for **jurisdiction policies**, **asset allowlist**, **router weights**.
9. Migrate secrets/keys to KMS/HSM; add PQC seeds for invoice keys.
10. Replace any Circle calls with BitGo/Tempo equivalents.

## 8. Acceptance Criteria
- Payment intent chooses optimal rail within 250ms @ P95.
- Atomic posting guarantees (ledger) across rail legs.
- ERP sync within 5s of on-ledger settlement event.
- Zeroization of invoice keys occurs ≤ 2s after settlement status=final.
- BRE denies prohibited corridors/assets reliably (100% test coverage on ruleset).

## 9. NFRs
- PCI DSS scope maintained; SOC2 logging; 99.95% availability; RPO≤5m / RTO≤30m.
- Data privacy (GDPR-ready), encryption in transit (TLS1.3) and at rest (AES-256-GCM).

## 10. Rollout
- Phase 1: Cross River + BitGo + Tempo in U.S./EU corridors
- Phase 2: Add SEPA direct, UPI, FPS; best-of-N FX; regional custodians
- Phase 3: MonayFiat tokenization (1:1 reserves)
