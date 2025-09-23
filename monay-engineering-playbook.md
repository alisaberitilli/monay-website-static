# Monay Engineering Playbook (Org Hardening • Repo Templates • QA Handbook • Playwright + Postman Starters)

> Copy this single file into a repo named `engineering-playbook` (or your internal wiki). Replace `REPLACE_WITH_ORG_NAME`, domains, and emails where noted.

---

## 0) Quick Goals

- **Isolation:** one private repo per app/service; least-privilege access.
- **Security-by-default:** 2FA/SSO, forking off, secret/code scanning on, signed commits.
- **Reproducible QA:** per-PR previews, seeded synthetic data, clear handoffs, tight bug reports.
- **Automation:** CI for lint/test/build, nightly regression, and dependency hygiene.
- **No source exposure to testers:** test via environments, not repo access.

---

## 1) GitHub Org Hardening (REPLACE_WITH_ORG_NAME)

### 1.1 Organization settings
- Base permission: **None**
- Require **SSO** + **2FA**
- Disable **forking** (Org → Policies)
- Limit third-party **OAuth/GitHub Apps** to allowlist
- **IP allowlist** or VPN for Git operations (Enterprise)
- Audit logs → **stream to SIEM** (CloudWatch/Datadog/etc.)
- Secret scanning: **enable** (and push-protection)
- Code scanning: **enable** (CodeQL or Semgrep in CI)

### 1.2 Teams & access
- One team per repo (e.g., `team-monay-id`, `team-caas`, …)
- Contractors: **Outside collaborator** on a single repo
- Fine-grained PATs (repo-scoped), classic tokens **disabled**

### 1.3 Required repo settings (apply to each app/service)
- Private repo, **Actions enabled**, **Pages disabled**
- Default branch: `main`
- **Branch protection** (see policy doc below)
- Require **signed commits**
- Require **linear history**; disallow force-push
- Secrets:
  - `ENV` (QA/STAGING/PROD) via **Environments** with reviewers
  - **No secrets in code**; rotate on off-boarding

### 1.4 Legal & policy
- NDA + IP assignment in onboarding
- Repo header in `README.md`:
  > CLASSIFICATION: CONFIDENTIAL – RESTRICTED. © Monay/Tilli. Unauthorized copying prohibited.

---

## 2) Repo Template (drop these into each new app repo)

```
/.github/
  workflows/
    ci.yml
    preview.yml
  ISSUE_TEMPLATE.md
  PULL_REQUEST_TEMPLATE.md
  SECURITY.md
  dependabot.yml
CODEOWNERS
CONTRIBUTING.md
policies/
  BRANCH_PROTECTION.md
  ACCESS_AND_OFFBOARDING.md
renovate.json (optional if using Renovate instead of Dependabot)
.editorconfig
```

### 2.1 CODEOWNERS (example)
```
# Leads review core code
/infra/           @devops-leads
/src/security/    @security-leads

# App team owns everything else
*                 @team-monay-id
```

### 2.2 Branch Protection Policy (`policies/BRANCH_PROTECTION.md`)
- Protected branch: `main`
- Requirements:
  - ✅ Pull request required
  - ✅ **2 approvals** (1 for internal tools)
  - ✅ Status checks must pass: `lint`, `test`, `build`, `codeql` (if used)
  - ✅ Require **CODEOWNERS review**
  - ✅ Require **signed commits**
  - ✅ Linear history; **no force-push**
- Environments:
  - `staging`, `prod` require **reviewers** (release managers)

### 2.3 CI: `/.github/workflows/ci.yml`
```yaml
name: CI
on:
  push: { branches: [main] }
  pull_request:
jobs:
  build-test:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'npm' }
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --reporter=list
      - run: npm run build
  codeql:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with: { languages: javascript }
      - uses: github/codeql-action/analyze@v3
```

### 2.4 PR Preview Deploy (sketch) `/.github/workflows/preview.yml`
```yaml
name: Preview
on: pull_request
jobs:
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci && npm run build
      - name: Deploy ephemeral
        run: ./scripts/deploy_preview.sh ${{ github.event.number }}
      - name: Comment with URL
        uses: marocchino/sticky-pull-request-comment@v2
        with:
          message: "Preview: https://id-pr-${{ github.event.number }}.qa.monay.net"
```

### 2.5 Dependabot (if not using Renovate) `/.github/dependabot.yml`
```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule: { interval: weekly }
    open-pull-requests-limit: 10
```

### 2.6 Renovate (optional) `/renovate.json`
```json
{
  "extends": ["config:recommended"],
  "labels": ["deps"],
  "automerge": false,
  "rangeStrategy": "bump",
  "packageRules": [
    { "matchManagers": ["npm"], "groupName": "npm deps (weekly)" }
  ],
  "schedule": ["every weekend"]
}
```

### 2.7 CONTRIBUTING.md (excerpt)
- Branch from `main`, `feat/*` or `fix/*`
- Write tests; keep PRs < 400 LOC where possible
- No secrets; `.env` values provided via Environments
- Link to Jira ticket in PR

### 2.8 PR Template `/.github/PULL_REQUEST_TEMPLATE.md`
```markdown
## What
- …

## Why
- …

## Test
- [ ] Unit
- [ ] API
- [ ] E2E preview link: https://id-pr-XXX.qa.monay.net

## Risk & Rollback
- Risk: …
- Rollback: revert to tag vX.Y.Z

## Checklist
- [ ] Lint/test pass
- [ ] No secrets committed
- [ ] Updated docs
```

### 2.9 Issue Template `/.github/ISSUE_TEMPLATE.md`
```
Title: [App][Area] Brief
Type: Bug | Feature | Task
Description:
Acceptance:
Out of Scope:
```

### 2.10 Off-boarding (`policies/ACCESS_AND_OFFBOARDING.md`)
- Remove from team(s), disable SSO, revoke PATs
- Rotate repo/environment secrets
- Review recent clones/archives; SIEM alert check

---

## 3) QA Handbook (One-Pager)

### 3.1 Environments
- **Preview (per-PR):** `app-pr-###.qa.monay.net` (ephemeral)
- **QA:** shared, stable build for regression
- **Staging:** prod-like, final verification
- **Prod:** release only

Test analysts get **environment access only** (no repo access).

### 3.2 Roles for analysts
- SSO to test tenant with least-privilege roles: `Customer`, `CSR-lite`, `Admin-lite`
- Read-only dashboards (Sentry/Datadog), feature flags (view or QA-scoped)

### 3.3 Data strategy (no PII)
- Synthetic, deterministic seeds:
  - `alice.basic` (2 bills), `ben.autopay` (expiring card), `ivy.multiple` (3 accounts)
- Nightly reset or on-demand reseed script
- Edge fixtures: expired card, ACH return, Unicode names, slow network

### 3.4 What's automated vs. manual
- **Automated (dev):** unit, API contracts, smoke E2E on PR; full nightly regression
- **Manual (analyst):** exploratory, accessibility, cross-browser/device, UAT

### 3.5 Tooling
- **E2E/UI:** Playwright
- **API:** Postman (analyst) + Newman (CI)
- **Perf:** k6 (baseline SLAs)
- **Accessibility:** axe + manual SR/keyboard

### 3.6 QA Handoff (paste in Jira)
```
# QA Handoff – App: Monay-ID – PR #123 / Release 0.8.4
Env: Preview https://id-pr-123.qa.monay.net | QA https://id.qa.monay.net
Scope: Soft-auth login improvements; device trust.
Accounts:
- customer: alice.basic (magic link in QA mailbox)
- csr-lite: csr.qa@monay.net (pwd in 1Password "QA Vault")
Seeds: alice.basic=2 bills; ben.autopay=card expiring; ivy.multiple=3 accounts.
Flags: soft_auth_v2=ON (QA), device_trust=ON (Preview)
Accept: remembered device skips MFA; step-up on new device; "Pay Now" deep link works.
Known: DW-1420 Safari chart slowness
```

### 3.7 Bug Report Template
```
Title: [App][Area] concise failure
Env & URL:
User/Role:
Steps:
Expected:
Actual:
Artifacts: screenshot/video, console log, HAR
Severity: S1 blocker | S2 major | S3 minor | S4 cosmetic
```

### 3.8 Cadence & SLAs
- Nightly regression on QA 02:00 local; HTML report + screenshots
- SLAs: S1—4h; S2—1d; S3—next sprint; S4—backlog

---

## 4) Starter Playwright (drop into `/qa/playwright` inside each app repo)

### 4.1 package.json additions
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:report": "playwright show-report"
  },
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "axe-playwright": "^2.0.0"
  }
}
```

### 4.2 playwright.config.ts
```typescript
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  timeout: 60_000,
  retries: 1,
  use: {
    baseURL: process.env.BASE_URL || 'https://id.qa.monay.net',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } }
  ],
  reporter: [['html', { outputFolder: 'playwright-report' }]]
});
```

### 4.3 Example test `tests/login.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test('soft-auth magic link lands on bill details', async ({ page }) => {
  const magic = process.env.MAGIC_LINK!;
  await page.goto(magic);
  await expect(page.getByRole('heading', { name: /your bill/i })).toBeVisible();
});

test('pay-now deep link opens tokenized page', async ({ page }) => {
  const link = process.env.PAY_NOW_LINK!;
  await page.goto(link);
  await expect(page.getByRole('button', { name: /submit payment/i })).toBeEnabled();
});
```

### 4.4 Accessibility smoke `tests/a11y.spec.ts`
```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('homepage is accessible', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

### 4.5 Running
```bash
# Env (per run or in CI environment vars)
export BASE_URL=https://id.qa.monay.net
export MAGIC_LINK="https://id.qa.monay.net/magic?k=..."
export PAY_NOW_LINK="https://id.qa.monay.net/pay?k=..."

npm run test:e2e
npm run test:e2e:report
```

---

## 5) Starter Postman (drop into `/qa/postman` inside each app repo)

### 5.1 Structure
```
/qa/postman/
  Monay-ID.postman_collection.json
  QA.postman_environment.json
  Newman.md
```

### 5.2 Environment (`QA.postman_environment.json`)
```json
{
  "name": "QA",
  "values": [
    { "key": "baseUrl", "value": "https://id.qa.monay.net/api", "type": "text", "enabled": true },
    { "key": "authToken", "value": "", "type": "secret", "enabled": true }
  ]
}
```

### 5.3 Collection (snippet)
```json
{
  "info": { "name": "Monay-ID", "_postman_id": "REPLACE", "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json" },
  "item": [
    {
      "name": "Health",
      "request": { "method": "GET", "url": "{{baseUrl}}/health" },
      "event": [{
        "listen": "test",
        "script": { "exec": [
          "pm.test('status 200', () => pm.response.code === 200);",
          "pm.test('healthy', () => pm.response.json().status === 'ok');"
        ], "type": "text/javascript" }
      }]
    },
    {
      "name": "Auth – Login",
      "request": {
        "method": "POST",
        "header": [{ "key": "Content-Type", "value": "application/json" }],
        "body": { "mode": "raw", "raw": "{\"email\":\"alice.basic@qa.monay.net\",\"otp\":\"000000\"}" },
        "url": "{{baseUrl}}/auth/login"
      },
      "event": [{
        "listen": "test",
        "script": { "exec": [
          "const json = pm.response.json();",
          "pm.test('200', () => pm.response.code === 200);",
          "pm.environment.set('authToken', json.token);"
        ], "type": "text/javascript" }
      }]
    }
  ]
}
```

### 5.4 Newman in CI (`Newman.md`)
```bash
# Install in pipeline
npm i -g newman

# Run against QA
newman run qa/postman/Monay-ID.postman_collection.json \
  -e qa/postman/QA.postman_environment.json \
  --timeout-request 10000 --reporters cli,html --reporter-html-export newman-report.html
```

---

## 6) Testing & Release Cadence
- **Per-PR:** CI (lint/test/build) + preview deploy + Playwright smoke + Newman smoke
- **Nightly (QA):** full Playwright + Newman suites; publish HTML reports; auto-create Jira on failures
- **Pre-prod (Staging):** golden path E2E + perf baseline (k6) + a11y smoke
- **Release:** environment approvals; signed tag; changelog in PR

---

## 7) Access Isolation Patterns (when needed)
- Split large apps into service repos (`monay-id-api`, `monay-id-auth`, `monay-id-web`)
- Shared code via private packages (`@monay/shared-*`) not shared repos
- For rare "one big repo" cases: submodules/subtrees + git-crypt for sensitive paths (convenience—not hard security)

---

## 8) Off-boarding Checklist (fast path)
- Remove from team(s); disable SSO; revoke PATs
- Rotate repo/env secrets
- Review last 30–90 days access/clones; SIEM anomaly check
- Reassign open PRs/issues

---

## Appendix A — Minimal .editorconfig
```
root = true
[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
```

---

## Appendix B — Quick Test Data Seeds (pseudo)
```bash
# scripts/seed-qa.sh
create_user alice.basic --bills 2
create_user ben.autopay --autopay card:expiring_30d
create_user ivy.multiple --accounts 3
```