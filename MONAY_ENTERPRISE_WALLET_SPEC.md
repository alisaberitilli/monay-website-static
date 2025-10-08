
# Monay Enterprise Wallet — SPEC

## 0. Purpose
Programmable enterprise wallet with **invoice-first** flows, escrow, ERP sync, and dual-rail settlement (fiat/crypto).

## 1. Key Features
- **Invoice-Scoped Wallets**: deterministic derivation; ephemeral keys; PQC hybrid auth.
- **Smart Escrow**: invoice-bound contracts; oracle-based releases; milestone support.
- **ERP Connectors**: SAP/Oracle/Dynamics official APIs; reconciliation and journal postings.
- **Rail Selection**: BRE + Router choose ACH/FedNow vs. on-chain vs. Tempo cross-border.
- **Compliance**: sanctions/KYB/AML; Travel Rule payloads for eligible corridors.
- **Reporting**: invoice→payment lineage; audit-ready artifacts.

## 2. APIs (selected)
- `POST /enterprise/invoices` → returns pay address/URI + escrow ref
- `POST /enterprise/invoices/{id}/pay` → creates payment intent
- `POST /enterprise/invoices/{id}/oracle` → attach milestone attestation
- `GET  /enterprise/invoices/{id}/status`

## 3. Data Model (simplified)
- Invoice(id, merchantId, currency, amount, dueDate, escrow, policySetId)
- Intent(id, invoiceId, rail, quote, status, policyVersion)
- Escrow(id, invoiceId, state, oracleRefs[])
- Reconciliation(id, invoiceId, txHash|railRef, journalId)

## 4. Refactoring Tasks
- Add deterministic mapping (invoice→wallet/contract) + index for fast lookup.
- Implement oracle handler service with signature verification and retry semantics.
- Extend ERP adapters for status webhooks + idempotent postings.
- Bulk-invoice APIs and batched settlement optimization.
- Enterprise RBAC, SSO (SAML/OIDC).

## 5. Acceptance Criteria
- Create→derive wallet ≤ 100ms; escrow deploy ≤ 500ms (or factory pattern).
- Settlement to ERP posting ≤ 5s P95.
- Key zeroization ≤ 2s after finality.
