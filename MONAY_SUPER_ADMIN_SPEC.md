
# Monay Super Admin — SPEC

## 0. Purpose
Administer **global policies, providers, pricing, limits, and tenants** for all wallets. Manage BRE rules, orchestration templates, API keys, and compliance/audit.

## 1. Capabilities
- **Provider Mgmt**: onboard Cross River, BitGo, Tempo; rotate credentials; set corridor availability.
- **BRE Rules**: author in universal schema; publish/rollback; view attestations.
- **Pricing Matrix**: configure take rates, FX caps, add-on fees per segment/corridor.
- **Limits & Tiers**: KYC tiers, daily/monthly caps, MCC restrictions, sanction lists.
- **Feature Flags**: per-jurisdiction asset allowlist, router weights, failover toggles.
- **Audit & Reports**: immutable logs, regulator exports, SLA dashboards.
- **Developer Admin**: create API keys, rate limits, SDK access scopes.

## 2. UI/UX (major screens)
- Providers, Rules, Pricing, Limits, Assets, Corridors, Telemetry, Webhooks, Developers, Audit.

## 3. APIs (selected)
- `POST /admin/providers` (CrossRiver|BitGo|Tempo configs)
- `PUT /admin/pricing-matrix` (per segment/corridor)
- `POST /admin/bre/rules` → compile+deploy
- `GET /admin/attestations?ruleId=...`
- `PUT /admin/assets/allowlist`
- `PUT /admin/router/weights`

## 4. Refactoring Tasks
- Extract admin-only endpoints from monolith into **admin-api**.
- Add RBAC (tenant/global admin), audit-only roles.
- Versioned rule/policy store with migration helpers.
- Pricing engine (matrix) + preview simulator.
- Attestation explorer (search by txHash/invoiceId).

## 5. Acceptance Criteria
- Rule publish→active ≤ 60s with cross-chain adapter acks.
- Pricing changes applied at **intent** time deterministically.
- All admin writes emit signed audit records.
