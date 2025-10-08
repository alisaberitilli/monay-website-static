
# Monay Consumer Wallet — SPEC

## 0. Purpose
Self-custodial multi-asset wallet with **fiat on/off‑ramp**, **stablecoin support**, P2P and merchant payments, under BRE rules.

## 1. Features
- **Assets**: USDC, USDT, PYUSD, EURC (+ future via registry); fiat balances.
- **On/Off-Ramps**: ACH/FedNow/Card (Cross River), SWIFT/SEPA (Tempo).
- **Self-Custody**: device-held keys; optional managed custody via BitGo.
- **P2P/Request-to-Pay**: invoice token references; memoized reasons.
- **Compliance Tiers**: KYC level gating (limits, features) per jurisdiction.
- **Developer SDKs**: create wallet, fund, pay, subscribe to events.

## 2. APIs (selected)
- `POST /consumer/wallets` → create self-custody wallet (with backup kit)
- `POST /consumer/topup` (rail=ach|fednow|card|tempo)
- `POST /consumer/pay` (asset=fiat|stablecoin)
- `GET  /consumer/transactions?walletId=...`

## 3. Mobile App Notes
- Secure enclave keystore; passkey support; MPC (future).
- Watch-only mode for enterprise payroll disbursements.
- In-app FX previews via Tempo quotes.

## 4. Refactoring Tasks
- Unify fiat+crypto balances in UI with **single activity feed** (ledger-backed).
- Add **request-to-pay** UX linked to invoice tokens.
- Implement recoverability: social recovery/MPC (phase 2).
- Integrate BRE responses for proactive UX gating (e.g., “feature not available in region”).

## 5. Acceptance Criteria
- Wallet create ≤ 200ms; send/receive confirmation within SLA targets.
- On-ramp ACH credit confirmation webhooks processed reliably (idempotent).
