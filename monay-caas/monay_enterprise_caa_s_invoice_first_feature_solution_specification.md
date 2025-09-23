# Monay Enterprise CaaS – Invoice‑First Feature Solution Specification

## 0) Purpose & Scope
Design and deliver an **Invoice‑First** capability within Monay Enterprise **Coin‑as‑a‑Service (CaaS)** that:
- Creates an invoice‑scoped payment experience using crypto (stablecoins first) without prior wallet setup.
- Offers three deployment models: **Anchored Proof**, **Invoice NFT (certificate)**, and **Receivable NFT (asset)**.
- Supports low‑cost settlement, auditability, compliance, cancel/reissue flows, and ERP‑native reconciliation.

Non‑goals (v1): fiat card acquiring, dynamic currency conversion for fiat rails, consumer KYC onboarding flows outside invoice context.

---

## 1) Product Objectives (KPIs)
- **Payment acceptance**: ≥ 98% on‑chain payment detection within ≤ 30s finality (chain dependent).
- **Cost**: Median gas/tx ≤ $0.02 (Solana) or ≤ $0.15 (EVM L2) per invoice anchor; ≤ $0.30 for NFT flows.
- **Security**: 0 critical incidents; PQC mode available; ephemeral wallet erasure verified.
- **Reconciliation accuracy**: ≥ 99.99% automated match rate invoice↔payment.
- **Time‑to‑invoice**: < 300 ms to mint/anchor per invoice under load (P95).

---

## 2) Personas & Actors
- **Issuer**: Enterprise billing entity (AR/AP, Treasury).
- **Debtor/Payer**: Counterparty paying the invoice.
- **Factor/Assignee**: Optional finance counterparty for receivables.
- **Compliance Officer**: Runs checks (KYC/AML/sanctions/tax).
- **Auditor/Regulator**: Verifies proofs and logs.

---

## 3) Deployment Models

### A) Anchored Proof (not an asset)
**What:** On‑chain anchor of invoice hash + UUID; payment is a stablecoin transfer to a designated address.
**Why:** Cheapest integrity/audit trail; enables global uniqueness and anti‑tamper with minimal ops.
**Key Specs:**
- Anchor fields: `invoice_uuid`, `hash_alg`, `content_hash`, optional `ipfs_cid`.
- Chains: Solana (Memo), EVM L2 (calldata or tiny Anchor contract).
- Payment reference: Solana reference key or EVM event log/memo.

### B) Invoice NFT (certificate)
**What:** Mint 1 NFT per invoice (non‑transferable by default or transferable per policy) capturing identity + metadata.
**Why:** Visible provenance and lifecycle (issue/void/reissue) without encoding payment rights.
**Key Specs:**
- Token ID = `invoice_uuid`.
- Metadata: `content_hash`, amount, currency, due_date, issuer, debtor_id, `ipfs_cid`, status.
- Cancel = burn/revoke; Reissue = mint new.

### C) Receivable NFT (asset)
**What:** Tokenize the **right to receive payment**; payments routed to current NFT owner via Pay contract.
**Why:** Enables factoring/assignment/collateral; programmatic cash routing & settlement.
**Key Specs:**
- NFT attributes: principal, due_date, debtor_id, jurisdiction, `invoice_uuid`, `content_hash`.
- Pay contract routes USDC to `ownerOf(uuid)`; emits `Paid`, `Settled` events.
- Cancel after assignment requires **redeem‑and‑burn**; reissue mints new NFT.

---

## 4) End‑to‑End Workflows

### 4.1 Issue → Request‑to‑Pay → Settle → Reconcile (Common)
1. **Issue**: ERP posts invoice (JSON/PDF). Monay canonicalizes payload → computes SHA‑256 hash → generates `invoice_uuid` (ULID).
2. **Anchor/Mint**: Execute per selected model (A/B/C).
3. **R2P**: Generate payment intent with `chain`, `token=USDC`, `amount`, `pay_to` (address or Pay contract), `invoice_uuid` (as memo/ref).
4. **Payment**: Debtor pays via wallet; optional escrow (milestone) when enabled.
5. **Detect**: Chain listener matches transfer/event to `invoice_uuid`.
6. **Reconcile**: Update AR, close balance; emit receipt; optional payment‑receipt anchor.

### 4.2 Cancel & Reissue
- **A (Anchor)**: Anchor `{status:canceled, at:ts}`; issue new anchor with new `invoice_uuid`.
- **B (Invoice NFT)**: Burn/revoke existing token; mint replacement.
- **C (Receivable NFT)**: If assigned, call `redeem(uuid)` to repay holder then burn; mint replacement NFT.

### 4.3 Partial/Over/Under‑Payment
- Track `open_amount` in Pay contract (C) or off‑chain ledger (A/B). Allow multiple payments until settled; emit `Paid(uuid, amount, remaining)`.

### 4.4 Escrow (Optional)
- Contract state machine for milestones (FUNDED → releases → FINALIZED) with oracle verification and M‑of‑N approvals.

---

## 5) Architecture & Components

### 5.1 Chain Targets
- **Primary**: Solana (lowest cost) and EVM L2s (Base/Polygon) for EVM tooling compatibility.
- **Abstraction**: Invoice‑layer that chooses chain per policy (cost, SLA, jurisdiction).

### 5.2 Smart Contracts (EVM, minimal)
- **Anchor**: `anchor(bytes32 hash, string uuid, string cid)` events only.
- **Pay**: Holds `openAmount[uuid]`, pulls USDC via `transferFrom`, forwards to `ownerOf(uuid)` (Receivable NFT), emits `Paid`, `Settled`.
- **ReceivableNFT**: `ownerOfUuid(uuid)`, `mint(uuid, attrs)`, `burn(uuid)`, `redeem(uuid)` (if factoring present).
- **Escrow** (optional): milestone releases, dispute pause, oracle verification.

### 5.3 Solana Programs
- **Anchor**: Memo program with compact CBOR payload.
- **Pay Router**: Reference‑tagged SPL transfers; optional program for routing to current NFT owner.

### 5.4 Off‑Chain Services
- **Canonicalizer**: Normalizes invoice JSON/PDF; produces deterministic `content_hash`.
- **Listener**: Subscribes to chain events/logs; matches payments by `invoice_uuid`.
- **Reconciler**: Posts journal entries to ERP; updates AR/AP; closes out invoices.
- **Notary Service**: Stores proofs, signatures, audit logs.

### 5.5 ERP Integration (Native)
- SAP ABAP, Oracle PL/SQL, MS Dynamics X++ injection points:
  - On **invoice create** → call Monay SDK for anchor/mint.
  - On **payment received** → webhook from Monay → post receipt, clear AR.
  - Aim: zero middleware; real‑time journal entries inside ERP.

### 5.6 Cross‑Chain & FX (Optional)
- Accept **any chain/token**; auto swap to preferred asset via HTLC/routers; protect slippage; batch on L2 for gas savings.

### 5.7 Compliance & Security
- **Sanctions/KYC/AML**: Wallet reputation + screening pre‑transaction; risk scoring with auto‑approve/hold/block policies.
- **Tax**: Zero‑knowledge proofs for VAT/withholding disclosure without amount leakage (jurisdiction templates).
- **PQC**: Optional Kyber/Dilithium/SPHINCS+ signing modes; hybrid RSA+PQ during transition.
- **Ephemeral wallets (optional mode)**: Time‑boxed lifecycle; NIST SP 800‑88 key erasure and audit log preservation.

---

## 6) APIs & Schemas (v1)

### 6.1 REST (Issuer‑facing)
- `POST /invoices`  
  **Body**: `{invoice_uuid?, payload, attachments[], options{model:A|B|C, chain, token, amount, due_date, debtor_id, persistent?:bool}}`  
  **Returns**: `{invoice_uuid, content_hash, anchor_txid|token_id, r2p_url, qr_svg}`

- `POST /invoices/{uuid}/cancel`  
  **Body**: `{reason, policy{redeem_if_assigned?:bool}}`  
  **Returns**: `{status}`

- `POST /invoices/{uuid}/reissue`  
  **Body**: `{updated_payload}`  
  **Returns**: `{new_uuid, links}`

- `GET /invoices/{uuid}/status`  
  **Returns**: `{state: issued|paid|partial|disputed|canceled, amounts{due,paid,remaining}, chain_refs[]}`

### 6.2 Webhooks
- `invoice.issued` `{uuid, model, anchor_txid|token_id}`
- `payment.detected` `{uuid, chain, amount, txid, remaining}`
- `invoice.settled` `{uuid, settled_at}`
- `invoice.canceled` `{uuid}`
- `invoice.reissued` `{old_uuid, new_uuid}`

### 6.3 Data Contracts
```json
// Canonical invoice header (subset)
{
  "invoice_uuid": "01JABC...",
  "hash_alg": "SHA-256",
  "content_hash": "0x...",
  "amount": {"value": "500.00", "asset": "USDC", "decimals": 6},
  "due_date": "2025-10-15",
  "issuer": {"id": "ACME-123"},
  "debtor": {"id": "BUYER-456"},
  "ipfs_cid": "bafy...",
  "signature": "0x..."
}
```

---

## 7) UX & Flows (Issuer and Debtor)
- **Issuer Console**: Toggle model A/B/C by invoice or policy; view anchors/tokens; track payment state; export proofs.
- **Debtor Pay Page**: Minimal wallet connect, invoice summary, Pay USDC button, QR, chain selector, memo/reference embedded.
- **Receipts**: Downloadable PDF + on‑chain proof link.

---

## 8) Security, Risk & Controls
- **Key Management**: HSM or hosted custody; least‑privilege API keys; per‑invoice deposit addresses.
- **Abuse Prevention**: Allowlist/denylist; rate limits; dust payment filtering; replay protection.
- **Disputes**: Optional escrow; `pauseInvoice(uuid)` ability; manual override with full audit log.
- **Observability**: Traces for anchor/mint/pay; alert on stalled invoices; SLA monitors per chain.

---

## 9) Rollout Plan
- **Phase 1**: Model A (Solana + Base), anchor + simple USDC pay, ERP webhooks.
- **Phase 2**: Model B NFTs + cancel/reissue lifecycle; PQC toggle; ZK tax pilot.
- **Phase 3**: Model C receivable NFTs + Pay router + factoring flows + escrow.

---

## 10) Acceptance Criteria (excerpt)
- Issue A/B/C from sandbox; receive stablecoin; auto‑reconcile in ERP; cancel/reissue produces correct on‑chain events.
- Anchor/NFT artifacts verifiable by third parties.
- Reconciliation ≥ 99.99% across 10k test invoices; partial/overpayments handled.
- Security review passed; PQC and sanctions checks enforced per policy.

---

## 11) Governance & Compliance Notes
- Jurisdictional templates for VAT/GST/withholding proof.
- Data retention: proofs and logs ≥ 7 years (configurable).
- Privacy: Only hashes/CIDs on chain; PII stays off‑chain; selective disclosure keys per auditor/regulator.

---

## 12) Open Questions
1. Which chains for GA? (recommend Solana + Base)
2. Are receivables transferable cross‑jurisdiction (legal opinion per market)?
3. NFT transfer restrictions (soulbound vs. free transfer) per client type.
4. Escrow default off or on for enterprise?

---

## 13) References (figures & design cues)
- Invoice‑scoped wallet lifecycle (ephemeral/self‑destruct vs persistent transformation; decision tree); quantum‑resistant crypto layer; ZK tax proofs; cross‑chain HTLC routing; ERP native code injection; AI compliance risk scoring; escrow state machine; dual‑mode operation.

