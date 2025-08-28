# Claude Code Scaffolding Prompts — Monay CaaS

These prompts assume Claude Code (or similar) will generate multi-repo scaffolding, tests, CI, and infra as described in the Requirements doc.

---

## 0) Project Layout (Monorepo)

**Prompt:**  
Create a pnpm-based monorepo with the following packages and apps. Add TypeScript strict mode, ESLint, Prettier, Vitest, and commitlint/husky. Add GitHub Actions for CI (lint, typecheck, tests) and Docker builds.

```
packages/
  sdk-js/            # Public JS/TS SDK wrapping OpenAPI client
  schemas/           # zod/io-ts schemas shared across services
  config/            # shared tsconfig/eslint/prettier configs
services/
  api/               # REST API (NestJS or Express)
  ledger/            # Ledger service (double-entry, Prisma)
  brf/               # Policy engine + decision API (OPA sidecar or lib)
  kyc/               # KYC adapters + case mgmt
  treasury/          # Bank connectors, mint/redeem orchestration
  indexer/           # Chain listeners for Base/Solana
apps/
  console/           # Next.js (shadcn/ui) — Enterprise Console
  wallet/            # React Native (Expo) + PWA
infra/
  terraform/         # AWS/GCP resources
  helm/              # K8s manifests and charts
  github/            # CI workflows
```

---

## 1) OpenAPI-First API

**Prompt:**  
Import `/mnt/data/openapi.yaml`. Generate a Node/TypeScript API (NestJS preferred) with controllers, DTOs, input validation, Problem+JSON error filter, OAuth2 client-credentials auth, and typed clients.

- Use `@nestjs/swagger` to expose `/docs` in sandbox only.
- Implement idempotency middleware reading `Idempotency-Key`.
- Emit domain events to a message bus (e.g., NATS or Kafka).

---

## 2) Ledger Service

**Prompt:**  
Implement a **double-entry ledger** in a standalone service using Prisma + PostgreSQL following the `LedgerEntry` schema in OpenAPI. Provide:

- Journal write endpoint (internal gRPC/REST).
- Invariant checks (trial balance equals zero across rails/tenants).
- Daily close job + snapshots.
- Reconciliation consumer that ingests on-chain balances from `indexer` and flags drift.

Include property-based tests using fast-check.

---

## 3) BRF (Business Rules Framework)

**Prompt:**  
Build a rule engine service with these capabilities:

- Policy store (PostgreSQL) with versioned JSON policies.
- Decision endpoint `POST /brf/decide` returning `ALLOW|DENY|REVIEW` with reasons.
- 10ms P95 decisions with in-memory cache and circuit-breaker (fail-closed).
- Admin UI in `apps/console` to author policies (visual + JSON).

Provide example policies for: KYC state, geofencing, velocity limits, address allow/deny.

---

## 4) Chain Indexer & Orchestrator

**Prompt:**  
Create `services/indexer` for Base (ethers + Foundry ABIs) and Solana (Anchor client). Responsibilities:

- Subscribe to Mint/Burn/Transfer events.
- Retry with exponential backoff on RPC errors.
- Publish normalized events to the bus for `ledger` and `treasury`.
- Track confirmations and update operation state machines.

Also create `services/treasury` to orchestrate mint/redeem/swap with idempotency and sagas.

---

## 5) Contracts & Programs

**Prompt:**  
Generate Solidity contracts (Foundry) for ERC-20 with roles (ADMIN, MINTER, PAUSER, COMPLIANCE), UUPS proxy, and `_beforeTokenTransfer` hook calling an external BRF endpoint. Include tests (forge, echidna fuzz).

Generate Solana program (Anchor) with instructions: INIT_ISSUER, MINT, BURN, FREEZE_ACCOUNT, THAW_ACCOUNT, FORCE_TRANSFER. Include CPI-safe authority checks and tests.

---

## 6) Enterprise Console (Next.js)

**Prompt:**  
Scaffold `apps/console` (Next.js 14, App Router) with shadcn/ui and the modules listed in the Requirements doc (Dashboard, Programs/Tokens, Wallets, Treasury, Compliance, Developers, Ledger, Settings).

- Implement server-side RBAC guards.
- Add table virtualization (TanStack Table + react-virtual).
- Use OpenAPI-generated client hooks.

---

## 7) Wallet App (React Native + PWA)

**Prompt:**  
Create `apps/wallet` with Expo routing for the screens in the Requirements doc (Onboarding/KYC, Home, Send, Receive, Activity, Cash In, Cash Out, Settings). Add mocked KYC provider and chain listeners. Ensure shared UI components can render on web (PWA) with the same codebase.

---

## 8) Webhooks

**Prompt:**  
Implement webhook sender with HMAC SHA-256 signatures in header `X-Monay-Signature`. Add retry policy (exponential, jitter) and DLQ after N failures. Provide a webhook test UI in `apps/console`.

---

## 9) Observability & Security

**Prompt:**  
Add OpenTelemetry tracing/metrics/logs across services, propagate `trace_id` into Problem+JSON errors. Configure structured logs (pino). Integrate with SIEM hooks. Use Vault or KMS for secrets, rotate keys, and enforce mTLS between services.

---

## 10) CI/CD & Environments

**Prompt:**  
Create GitHub Actions:
- PR: lint/typecheck/test, build docker images
- Main: push images, run migrations, deploy to `dev` via Helm
- Tag: deploy to `staging`, manual approval to `prod`

Create Terraform modules for core infra (Postgres, Redis, object storage, HSM placeholder), and Helm charts per service.

---

## 11) Seed & Fixtures

**Prompt:**  
Add seed scripts to create: a demo issuer, tokens on Base/Solana (testnets), a few wallets, and sample mints/transfers. Provide a Postman/Insomnia collection generated from OpenAPI.

---

## 12) Security Tests

**Prompt:**  
Run Slither and Mythril on Solidity, cargo-audit on Rust deps (for Solana), and add ZAP baseline scan for the API. Export SARIF to GitHub Code Scanning.
