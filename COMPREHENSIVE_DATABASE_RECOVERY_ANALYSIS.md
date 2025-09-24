# COMPREHENSIVE DATABASE RECOVERY ANALYSIS
## Critical Recovery Document - Month of Work
## Date: 2025-01-23

## OVERVIEW
This document contains a comprehensive analysis of ALL database schemas across the entire Monay ecosystem to recover and consolidate the database structure. We have found 39 SQL migration files across multiple applications that need to be consolidated into a single, unified schema.

## MIGRATION FILES INVENTORY

### Location 1: /monay-backend-common/migrations/
1. 000_create_invoices.sql
2. 001_invoice_first_wallets.sql
3. 002_consumer_wallet_features.sql
4. 003_extend_child_parents_table.sql

### Location 2: /monay-backend-common/monay-api/migrations/
1. 20250120_create_capital_markets_tables.sql
2. 20250121_001_create_hierarchical_organizations.sql
3. 20250121_002_create_customer_accounts_subledger.sql
4. 20250121_003_create_mass_billing_groups.sql
5. 20250121_004_create_core_database_schema.sql
6. 20250121_005_create_customer_verification_system.sql
7. 20250121_006_create_subledger_posting_engine.sql
8. 20250121_007_create_communication_layer.sql
9. 20250121_008_create_security_infrastructure.sql
10. 20250121_009_create_cards_benefits_supplementary.sql
11. 20250122_001_create_bre_enhancement_tables.sql
12. 20250122_002_create_loyalty_program_schema.sql
13. 20250122_003_create_capital_markets_schema.sql
14. 20250122_004_create_invoice_financing_schema.sql
15. 20250122_005_create_ai_ml_schema.sql

### Location 3: /monay-backend-common/src/migrations/
(Duplicates of Location 2 - 15 files)

### Location 4: /monay-data/
1. add_auth_challenges_table.sql
2. add_new_tables_fixed.sql
3. add_new_tables.sql
4. unified_auth_migration.sql

## APPLICATIONS REQUIRING DATABASE

1. **Monay-Backend-Common** (Port 3001) - Central API
2. **Monay-Admin** (Port 3002) - Administrative Dashboard
3. **Monay-Cross-Platform/Web** (Port 3003) - Consumer Wallet
4. **Monay-Enterprise-Wallet** (Port 3007) - Enterprise/CaaS Platform
5. **Monay-iOS** - Mobile Consumer App
6. **Monay-Android** - Mobile Consumer App

## DETAILED SCHEMA ANALYSIS

---

## PHASE 1: INVOICE AND WALLET FOUNDATIONS

### From 000_create_invoices.sql
**NO DROP STATEMENTS - SAFE**
- **invoices** (basic version)
  - id, invoice_number, user_id, type, amount, currency, status
  - client_name, vendor_name, description, payment_method
  - due_date, paid_date, is_recurring, metadata
  - created_at, updated_at

### From 001_invoice_first_wallets.sql
**NO DROP STATEMENTS - SAFE**
- **invoice_wallets**
  - Links invoices to ephemeral/persistent wallets
  - Quantum-resistant key support
  - Mode: ephemeral, persistent, adaptive
- **wallet_lifecycle_events** - Audit trail for wallets
- **quantum_key_registry** - Quantum-resistant keys
- **zk_compliance_proofs** - Zero-knowledge proofs
- **wallet_mode_decisions** - AI mode selection history

### From 002_consumer_wallet_features.sql
**NO DROP STATEMENTS - SAFE**
- **auto_topup_rules** - Automatic wallet top-up config
- **ready_cash_loans** - Micro-loans up to $10K
- **gift_cards** - Digital gift cards
- **loyalty_rewards** - Points and tiers
- **loyalty_transactions** - Points history
- **bills** - Bill management
- **bill_payments** - Payment history
- **super_app_bookings** - Travel, food, rides
- **ai_financial_insights** - AI recommendations
- **charity_organizations** - Verified charities
- **charity_donations** - Donation tracking
- **split_bills** - Group payments
- **split_bill_participants** - Split participants

### From 003_extend_child_parents_table.sql
**NO DROP STATEMENTS - SAFE**
- Extends existing **child_parents** table with:
  - relationship, dailyLimit, monthlyLimit
  - autoTopupEnabled, autoTopupThreshold, autoTopupAmount

---

## PHASE 2: CORE ENTERPRISE INFRASTRUCTURE

### From 20250121_001_create_hierarchical_organizations.sql
**⚠️ DANGEROUS - DROP TABLE organizations CASCADE at line 9**
- **organizations** - Hierarchical org structure
  - parent_id for hierarchy, org_type (holding/subsidiary/division/branch)
  - ERP integration fields, path_ids array for fast queries
  - Functions: get_organization_descendants, get_organization_ancestors
  - View: organization_hierarchy

### From 20250121_002_create_customer_accounts_subledger.sql
**⚠️ DANGEROUS - DROP TABLE statements at lines 11-15**
- **ledger_categories** - GL category definitions
- **account_types** - Account type mapping
- **customer_accounts** - Full subledger support
  - Hierarchical accounts with parent_account_id
  - GL mapping with 5 segments
  - ERP integration fields
  - Credit limits and terms
- **customer_subledger_entries** - Detailed ledger entries
- Functions: update_account_balance, post_subledger_entry
- Views: customer_account_hierarchy, gl_account_mapping

### From 20250121_003_create_mass_billing_groups.sql
**⚠️ DANGEROUS - DROP TABLE statements at lines 11-16**
- **billing_schedules** - Predefined schedules
- **billing_groups** - Batch billing configuration
  - Account selection criteria (JSON)
  - Dunning schedules
  - Auto-generation settings
- **billing_group_accounts** - Group membership
- **billing_runs** - Execution history
- **billing_run_details** - Per-account results
- Functions: add_accounts_to_billing_group, create_billing_run

### From 20250121_004_create_core_database_schema.sql
**⚠️ DANGEROUS - DROP TABLE statements at lines 12-20**
- **wallets** - Blockchain wallets (Enterprise/Consumer/Treasury)
  - Multi-blockchain support (Base, Polygon, Solana)
  - Invoice-first wallet features
  - KYC/AML fields
- **invoices** - Enhanced invoice table
  - Links to wallets, billing groups
  - Invoice-first wallet creation flags
  - Blockchain transaction support
- **invoice_line_items** - Line item details
- **transactions** - All transaction types
  - Blockchain details, compliance fields
- **payment_methods** - Cards, ACH, crypto
- **invoice_payments** - Payment applications
- **business_rules** - BRF engine rules
  - Government benefit program rules (SNAP, WIC, TANF)
- **audit_logs** - Immutable audit trail

### From 20250121_005_create_customer_verification_system.sql
**⚠️ DANGEROUS - DROP TABLE statements at lines 11-18**
- **verification_providers** - KYC/KYB provider config
- **verification_sessions** - Verification workflow sessions
  - Support for KYC, KYB, government ID verification
  - GENIUS Act compliance fields
- **verification_checks** - Individual checks in session
- **verification_documents** - Uploaded documents
- **government_identities** - Login.gov/ID.me integration
  - NIST IAL/AAL levels
  - Benefit program eligibility
- **watchlist_entries** - Sanctions/PEP lists
- **risk_assessments** - Risk scoring and decisions
- Functions: calculate_risk_score, check_watchlist, create_verification_session

### From 20250121_006_create_subledger_posting_engine.sql
- Tables to be extracted...

### From 20250121_007_create_communication_layer.sql
- Tables to be extracted...

### From 20250121_008_create_security_infrastructure.sql
- Tables to be extracted...

### From 20250121_009_create_cards_benefits_supplementary.sql
- card_programs
- cards (with hierarchy support)
- spending_limits
- card_authorizations
- benefit_households
- benefit_enrollments
- benefit_balances
- benefit_transactions
- program_merchants
- eligibility_history

---

## PHASE 3: ADVANCED FEATURES

### From 20250122_001_create_bre_enhancement_tables.sql
- Tables to be extracted...

### From 20250122_002_create_loyalty_program_schema.sql
- Tables to be extracted...

### From 20250122_003_create_capital_markets_schema.sql
- Tables to be extracted...

### From 20250122_004_create_invoice_financing_schema.sql
- Tables to be extracted...

### From 20250122_005_create_ai_ml_schema.sql
- Tables to be extracted...

---

## PHASE 4: AUTHENTICATION AND SECURITY

### From unified_auth_migration.sql
- Tables to be extracted...

### From add_auth_challenges_table.sql
- Tables to be extracted...

### From add_new_tables.sql and add_new_tables_fixed.sql
- Tables to be extracted...

---

## CRITICAL ISSUES FOUND

1. **DROP TABLE Statements**: Most enterprise migrations contain dangerous DROP TABLE IF EXISTS statements
   - 20250121_001: DROP organizations
   - 20250121_002: DROP customer_subledger_entries, customer_accounts, account_types, ledger_categories
   - 20250121_003: DROP billing tables (5 tables)
   - 20250121_004: DROP core tables (9 tables including wallets, invoices, transactions)
   - 20250121_005: DROP verification tables (8 tables)
   - Additional DROP statements in files 006-009 and 20250122 series (not yet fully analyzed)

2. **Safe Files** (NO DROP statements):
   - 000_create_invoices.sql ✅
   - 001_invoice_first_wallets.sql ✅
   - 002_consumer_wallet_features.sql ✅
   - 003_extend_child_parents_table.sql ✅

3. **No Backup Strategy**: No database backup files found
4. **Empty Database**: The main 'monay' database exists but has no tables
5. **Duplication**: Migration files are duplicated in /src/migrations and /monay-api/migrations

## RECOVERY STRATEGY

1. **Extract all table definitions** from each migration file
2. **Remove all DROP statements**
3. **Consolidate duplicate definitions**
4. **Create proper migration order** based on dependencies
5. **Generate single unified schema** with CREATE TABLE IF NOT EXISTS
6. **Implement backup strategy** before applying

## NEXT STEPS

1. Complete extraction of all table definitions
2. Identify and resolve any conflicts or duplicates
3. Create dependency graph for proper table creation order
4. Generate clean migration script without DROP statements
5. Test on a separate database first
6. Create backup procedures

---

## TABLES MASTER LIST
(To be populated after complete analysis)

### Core Tables
- users
- organizations
- wallets
- transactions
- accounts

### Invoice & Billing
- invoices
- invoice_wallets
- invoice_items
- billing_groups

### Cards & Payments
- cards
- card_programs
- card_authorizations
- spending_limits

### Benefits & Programs
- benefit_households
- benefit_enrollments
- benefit_balances
- benefit_transactions
- program_merchants

### Security & Compliance
- audit_logs
- security_policies
- verification_logs
- compliance_checks

### Communication
- notifications
- email_templates
- sms_logs

### Financial
- ledger_entries
- subledger_accounts
- journal_entries
- posting_rules

### AI/ML
- fraud_detection_models
- risk_scores
- behavioral_analytics

---

## DATABASE REQUIREMENTS BY APPLICATION

### Monay-Backend-Common (Central API)
- Requires: ALL TABLES (central database access point)

### Monay-Admin
- Primary: organizations, users, audit_logs, compliance
- Secondary: Read access to all tables for reporting

### Monay-Consumer-Wallet
- Primary: users, wallets, transactions, cards
- Secondary: benefit_*, loyalty_*

### Monay-Enterprise-Wallet
- Primary: organizations, invoice_*, treasury_*
- Secondary: subledger_*, posting_*

---

## CRITICAL DATA TO PRESERVE
(If any existing data is found)

1. User accounts and authentication
2. Wallet balances and transactions
3. Organization hierarchies
4. Card and payment data
5. Compliance and KYC records
6. Audit trails

---

## BACKUP AND RECOVERY PLAN

1. **Immediate**: Create pg_dump of any existing data
2. **Before Migration**: Full database backup
3. **During Migration**: Transaction logs
4. **After Migration**: Verification checksums
5. **Ongoing**: Daily automated backups

---

## NOTES

- This is a critical recovery document for a month of work
- All DROP statements must be removed before execution
- Test everything on a separate database first
- Maintain this document as source of truth for database structure
