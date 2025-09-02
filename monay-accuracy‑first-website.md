# Monay.com — Accuracy‑First Website Refresh (Instructions for Claude)
**Date:** Sept 2, 2025  
**Author:** Ali / Product  
**Goal:** Update monay.com to be accurate, investor‑ready, and compliant with our current status. Avoid any misleading statements.

---

## Ground truth (do not override)
- **No certifications, partnerships, or registrations yet** for the **new platform** (Monay ID, CaaS, WaaS).  
- Under **Tilli**, our **legacy Monay Wallet** holds **PCI‑DSS, ISO 27001, SOC 2** — **these do not automatically apply** to the new platform components.  
- **Build status (Sept 2, 2025):** Monay ID ~**78%**, CaaS ~**48%**, WaaS (MVP) ~**66%**.  
- **Audits, certifications, registrations, legal reviews, partner integrations, and regression testing are pending.**

> **All site copy must reflect the above.** If a page suggests otherwise, rewrite it.

---

## Global copy standards
1) **Wording of capability**  
   - Prefer **“building,” “designed to,” “planned,” “prototype,”** or **“in development”** for not‑yet‑live features.  
   - For features already implemented internally, use **“available in private preview”** only if we can actually enable it for select customers.

2) **Rails**  
   - Canonical wording: **“Core rails: Base L2 + Solana. Optional: additional L2s (e.g., Polygon zkEVM) for specific pilots.”**

3) **Stablecoins**  
   - Canonical wording: **“Designed to support USDM and major stablecoins at the treasury layer (interoperability goal). Actual asset support will be announced upon completion of required reviews and agreements.”**

4) **Cash access**  
   - Use **“planned cardless ATM support”**. Do **not** name a network or show logos until agreements are executed.

5) **Partnerships & logos**  
   - **Remove** all third‑party logos/names except where we have executed agreements **and** live integrations.  
   - Add a footnote site‑wide: **“Partners will be announced once agreements are executed and integrations are live.”**

6) **Compliance & certifications**  
   - Create a **Security & Compliance** page with a status table.  
   - Wording: **“Under Tilli, legacy Monay Wallet holds PCI‑DSS, ISO 27001, SOC 2. New platform (Monay ID, CaaS, WaaS): audits, certifications, and registrations pending.”**  
   - Do **not** say “SOC 2 certified,” “ISO certified,” “FedRAMP Ready,” or similar for the new platform.

7) **Forward‑looking disclaimer**  
   - Add to the **Investor page** and **footer** of investor‑facing assets:  
   > “Certain statements are forward‑looking and subject to risks and uncertainties. Features and timelines may change.”

8) **Availability language**  
   - Add a small note where needed: **“Feature availability varies by program, tier, and region.”**

---

## Components to implement
### A) Build Status ribbon (global component)
- Text: **“Platform Build Status (as of Sept 2, 2025)”**
- Bars:
  - **Monay ID — 78%**
  - **CaaS — 48%**
  - **WaaS (MVP) — 66%**
- Note: **“Audits, certifications/registrations, partner integrations, and regression testing are pending.”**
- Placement: Homepage hero (under CTA) and Investors page (top section).

### B) Feature Availability table (Products + Investors)
- Columns: **Capability**, **ID**, **CaaS**, **WaaS**, **Status** (✅ available · 🟡 private preview · ⏳ in development).  
- Populate from a JSON config so marketing can update without code changes.

---

## Page‑by‑page instructions
### 1) Homepage
- **Hero one‑liner (replace):**  
  “We’re **building** a single platform where institutions can issue a branded stablecoin and run controlled wallets that work in everyday contexts (tap‑to‑pay, e‑commerce, and planned cash access) — with policy, compliance, and identity tied to every transaction.”
- Insert **Build Status ribbon** below hero CTAs.  
- Add rails note: **“Core rails: Base L2 + Solana. Optional: additional L2s (e.g., Polygon zkEVM) for specific pilots.”**  
- Remove any third‑party logos/claims without executed agreements.

### 2) Investors page (`/investors`)
- Use the **“Monay.com — Investor Page (Accuracy‑First v2)”** canvas as the source of truth.  
- Keep **Status Disclosure** block at the top and **Forward‑looking statement** at the bottom.  
- Include **Policy tailwinds** bullets and the **Build Status** table.

### 3) Products overview (`/products`)
- Create three tiles: **Monay ID**, **CaaS**, **WaaS**.  
- Under each tile, show a **status badge** (78% / 48% / 66% MVP) and link to the Feature Availability table.

### 4) Monay ID page (`/products/id`)
- Use accurate phrasing: WebAuthn/passkeys; biometrics **where device capabilities permit**; custodian‑assisted recovery; SSO/SAML/OIDC; risk engine.  
- No promises of modalities or device support we can’t meet.  
- Accessibility note: WCAG‑aligned UIs; voice OTP option.

### 5) CaaS page (`/products/caas`)
- Emphasize: branded coin issuance, treasury segregation, conversion, cross‑rail (prototype).  
- Include **stablecoin language** from Global standards #3.  
- Status badge: **48%**; audits/registrations pending.

### 6) WaaS page (`/products/waas`)
- Emphasize: policy engine, refunds/returns, multi‑role wallets.  
- Card issuing & **cardless ATM support** labeled **planned** until live.  
- Status badge: **66% (MVP)**.

### 7) Security & Compliance page (`/security`)
- Show two sections:
  - **Legacy (Tilli / Monay Wallet):** PCI‑DSS, ISO 27001, SOC 2 (existing).  
  - **New Platform (Monay ID, CaaS, WaaS):** **Pending** — audits/certifications/registrations in progress.  
- Add FAQ: “Are you a bank?” → **No.** “Money transmitter?” → **No; authorizations under evaluation.”

### 8) Partners page or section (optional for now)
- Replace logos with a **placeholder statement**:  
  “Partners will be announced once agreements are executed and integrations are live.”

### 9) Pricing page
- If a **Pilot discount** is shown, add a footnote with eligibility, term, and that availability is limited.

---

## Content snippets to reuse (verbatim)
- **Rails:** “**Core rails: Base L2 + Solana. Optional: additional L2s (e.g., Polygon zkEVM) for specific pilots.**”
- **Stablecoins:** “**Designed to support USDM and major stablecoins at the treasury layer (interoperability goal). Actual asset support will be announced upon completion of required reviews and agreements.**”
- **Cash access:** “**Planned cardless ATM support**” (no network names until live).  
- **Status note:** “**Audits, certifications/registrations, partner integrations, and regression testing are pending. Feature availability varies by program, tier, and region.**”

---

## Acceptance criteria (Definition of Done)
- No page contains **implied certifications or partnerships** for the new platform.  
- Homepage and Investors page include the **Build Status ribbon**.  
- Security & Compliance page clearly separates **legacy certifications** from **new platform (pending)**.  
- All mentions of ATM support and card issuing are labeled **planned** until live.  
- Stablecoin/rails wording follows the **Global copy standards**.  
- A site‑wide **forward‑looking disclaimer** appears on the Investors page (and optionally in the footer of investor assets).  
- Feature Availability table is present and populated from JSON.

---

## Hand‑off notes for devs (Next.js + Tailwind)
- Add routes: `/investors`, `/products`, `/products/id`, `/products/caas`, `/products/waas`, `/security`.  
- Components: `<BuildStatus />`, `<FeatureAvailability />`.  
- Content config: `site/status.json` (percentages, dates), `site/features.json` (capability statuses).  
- Add `lastUpdated` timestamps to pages (“Updated Sept 2, 2025”).  
- SEO: add meta tags for “Monay ID”, “Coin‑as‑a‑Service”, “Wallet‑as‑a‑Service”, and structured data.

---

**Questions for Ali before publish**
1) Is it acceptable to add a **footer disclaimer** site‑wide on investor assets?  
2) Should we expose the percentage statuses globally or only on `/investors` and `/products`?  
3) Any regional restrictions we should note on availability?

