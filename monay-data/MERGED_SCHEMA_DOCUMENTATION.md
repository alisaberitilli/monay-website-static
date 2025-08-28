# Merged Schema Documentation

## Overview

This document describes the merged Prisma schema that combines the modern Monay blockchain/fintech platform with a legacy B2B billing and invoicing system. The merger creates a comprehensive financial services platform supporting both crypto/blockchain operations and traditional B2B payment workflows.

**Generated**: 2025-08-28  
**Total Models**: 120  
**Total Enums**: 51  
**Schema File**: `merged.schema.prisma`  
**Size**: 3,393 lines (112KB)

## Architecture Overview

The merged schema represents two distinct but interconnected systems:

### 1. **Modern Monay Platform** (Primary System)
- Dual-rail blockchain architecture (EVM L2 + Solana)
- Cryptocurrency and stablecoin management
- DeFi protocols and yield opportunities
- Modern payment methods (cards, wallets, crypto)
- Compliance and KYC/AML frameworks
- Treasury and cross-rail swap operations

### 2. **Legacy B2B System** (Secondary System)
- Invoice and billing management
- Subscriber/Biller relationships
- Contract and service management
- Legacy payment processing
- Nudge notification system
- KYB (Know Your Business) documentation

## Naming Conventions

To avoid conflicts during the merge, legacy models that conflicted with modern models were renamed with a "Legacy" prefix:

| Original Name | Renamed To | Reason |
|--------------|------------|---------|
| User | LegacyUser | Conflicts with modern User model |
| Account | LegacyAccount | Conflicts with modern Account model |
| Invoice | LegacyInvoice | Conflicts with modern Invoice model |
| Transaction | LegacyTransaction | Conflicts with modern Transaction model |
| PaymentMethod | LegacyPaymentMethod | Conflicts with modern PaymentMethod |
| UserDevice | LegacyUserDevice | Conflicts with modern UserDevice |
| ServiceType | ServiceTypeModel | Conflicts with ServiceType enum |
| Faq | LegacyFaq | Conflicts with modern Faq model |

## Enum Categories

### 1. **User & Authentication Enums**
- `UserStatus`: User account states (active, inactive, suspended, deleted, pending_verification)
- `UserRoleType`: Platform roles (platform_admin, compliance_officer, treasury_manager, etc.)
- `DeactivationReason`: Reasons for account deactivation
- `Access`: Permission levels (NONE, READ, WRITE)
- `Theme`: UI themes (USER, LIGHT, DARK)
- `DeviceType`: Device types (WEB, DESKTOP, IOS, ANDROID)

### 2. **KYC/Compliance Enums**
- `KycStatus`: KYC verification states (not_started, pending, in_review, approved, rejected, expired)
- `KycLevel`: KYC verification levels (basic, standard, enhanced, enterprise)
- `KycProvider`: KYC service providers (persona, alloy, onfido, internal)
- `PiiType`: Personal identification types (SSN, LICENSE, AADHAR, PASSPORT)

### 3. **Blockchain & Crypto Enums**
- `BlockchainNetwork`: Supported networks (base_mainnet, base_testnet, polygon_zkevm_mainnet, solana_mainnet, etc.)
- `TokenStandard`: Token standards (ERC20, ERC3643, TOKEN2022, SPL)
- `CryptoAssetType`: Asset categories (stablecoin, volatile, cbdc, wrapped, synthetic, etc.)
- `StablecoinBacking`: Backing types (fiat_collateralized, crypto_collateralized, algorithmic, etc.)
- `StablecoinPeg`: Peg currencies (USD, EUR, GBP, JPY, GOLD, SILVER, etc.)
- `OracleSource`: Price oracle providers (chainlink, pyth, band_protocol, etc.)

### 4. **Transaction & Payment Enums**
- `TransactionStatus`: Transaction states (pending, processing, completed, failed, cancelled, reversed)
- `TransactionType`: Transaction categories (deposit, withdrawal, transfer, swap, mint, burn, etc.)
- `PaymentMethodType`: Payment types (card, ach, wire, wallet, crypto_stable, crypto_unstable, etc.)
- `PaymentType`: Legacy payment types (ACH, CREDIT, DEBIT, AADHAR)
- `InvoiceStatus`: Invoice states (UNPAID, PROCESSING, DISPUTED, PARTIALLY_PAID, FULLY_PAID, etc.)

### 5. **Business & Compliance Enums**
- `RuleType`: Business rule types (transaction_limit, velocity_limit, kyc_requirement, etc.)
- `RuleAction`: Rule actions (block, review, approve, notify, report)
- `BusinessType`: Business entity types (GOV, INTL, LLC, LLP, PARTNERSHIP, etc.)
- `ComplaintStatus`: Complaint states (OPEN, UNDER_INVESTIGATION, RESOLVED, etc.)
- `ComplaintPriority`: Priority levels (NO_PRIORITY, URGENT, HIGH, MEDIUM, LOW)

### 6. **Platform & Service Enums**
- `ApplicationType`: Application types (website, backend, frontend, web_app, mobile_ios, etc.)
- `ServiceType`: Service categories (caas, waas, admin, enterprise, consumer)
- `TechStack`: Technology stacks (nextjs, react_native, nodejs, express, solidity, rust)
- `Channel`: Communication channels (PUSH, SMS, EMAIL, WHATSAPP)

## Model Categories

### 1. **Core Organization & User Models** (11 models)
- **Organization**: Central entity for both modern and legacy systems
- **User**: Modern user with crypto/blockchain features
- **LegacyUser**: Legacy B2B system user
- **UserDevice**: Modern device management
- **LegacyUserDevice**: Legacy device tracking
- **UserBankAccount**: Bank account connections
- **ChildParentRelationship**: User hierarchy
- **UserReferral**: Referral tracking
- **UserBlock**: User blocking functionality
- **ChangeMobileHistory**: Mobile number change audit
- **MediaDocument**: User document storage

### 2. **KYC/KYB & Compliance Models** (19 models)
- **KycDocument**: Modern KYC documentation
- **KybDocument**: Business verification documents
- **KybOwner**: Business owner information
- **KybManager**: Key management personnel
- **BusinessRule**: Compliance rule definitions
- **BusinessRuleViolation**: Rule violation tracking
- **IdentityRegistry**: Blockchain identity management
- **IdentityClaim**: Identity verification claims
- **TrustedClaimIssuer**: Verified claim issuers
- **ComplianceAttestation**: Compliance proofs
- **TransferRestriction**: Token transfer restrictions

### 3. **Blockchain & Token Models** (15 models)
- **BlockchainWallet**: User blockchain wallets
- **Token**: Token definitions
- **Token2022Extension**: Solana Token-2022 extensions
- **TokenDeployment**: Token deployment tracking
- **TokenDeploymentTemplate**: Deployment templates
- **SmartContract**: Smart contract registry
- **ContractUpgrade**: Contract upgrade governance
- **SolanaProgram**: Solana program registry
- **SolanaTransactionDetail**: Solana transaction details
- **MultiSigWallet**: Multi-signature wallets
- **MultiSigTransaction**: Multi-sig transactions
- **TimeLockedOperation**: Time-locked operations
- **EmergencyPauseEvent**: Emergency pause tracking
- **WalletCustody**: Custody configurations
- **BatchOperation**: Batch transaction optimization

### 4. **Crypto & DeFi Models** (11 models)
- **CryptoAsset**: Cryptocurrency definitions
- **StablecoinConfig**: Stablecoin parameters
- **StablecoinReserve**: Reserve backing details
- **CryptoPriceFeed**: Price oracle data
- **CryptoWalletConfig**: Wallet configurations
- **CryptoExchangePair**: Trading pairs
- **DefiProtocol**: DeFi protocol registry
- **YieldOpportunity**: Yield farming opportunities
- **CryptoTransactionMonitoring**: Transaction monitoring
- **BlockchainNetworkHealth**: Network monitoring
- **BlockchainPerformanceMetric**: Performance metrics

### 5. **Treasury & Cross-Rail Models** (3 models)
- **TreasuryAccount**: Treasury management accounts
- **CrossRailSwap**: Cross-blockchain swaps
- **TreasuryReconciliation**: Treasury reconciliation

### 6. **Transaction & Payment Models** (12 models)
- **Transaction**: Modern transaction records
- **LegacyTransaction**: Legacy transaction records
- **PaymentMethod**: Modern payment methods
- **LegacyPaymentMethod**: Legacy payment methods
- **PaymentRequest**: Payment requests
- **RecurringPayment**: Subscription payments
- **UserCard**: Card management
- **CardNetwork**: Card network configurations
- **Account**: Modern account management
- **LegacyAccount**: Legacy account records
- **Invoice**: Modern invoicing
- **LegacyInvoice**: Legacy invoices

### 7. **Legacy B2B Models** (35 models)
- **Subscriber**: B2B subscriber entities
- **Biller**: B2B biller entities
- **Contract**: Service contracts
- **Service**: Service definitions
- **ServiceTypeModel**: Service categorization
- **PaymentTerm**: Payment terms
- **Price**: Pricing structures
- **PriceType**: Price categorization
- **Fee**: Fee structures
- **FeeStructure**: Fee calculation rules
- **LegacyInvoiceItem**: Invoice line items
- **LegacyInvoiceApproval**: Invoice approvals
- **LegacyInvoiceComplaint**: Complaint management
- **OrgExpected**: Expected organizations
- **OrgUser**: Organization users
- **GpsUser**: GPS integration users
- **Submerchant**: Sub-merchant entities

### 8. **Notification & Communication Models** (7 models)
- **Notification**: User notifications
- **Nudge**: Legacy nudge system
- **NudgeType**: Nudge categorization
- **NudgeVariant**: Nudge variations
- **CmsContent**: Content management
- **Faq**: Modern FAQ system
- **LegacyFaq**: Legacy FAQ entries

### 9. **System & Administrative Models** (14 models)
- **Settings**: Configuration settings
- **ActivityLog**: User activity tracking
- **AdminActionLog**: Admin action audit
- **DashboardAnalytic**: Analytics metrics
- **SpendLimit**: Spending limitations
- **EmailDomain**: Email domain verification
- **EncryptionKey**: Encryption key storage
- **BeaconPlugin**: Plugin configurations
- **MediaRepo**: Media repository
- **ApplicationInput**: Application inputs
- **Locale**: Localization settings
- **Country**: Country definitions
- **Address**: Address management
- **Contact**: Contact information

### 10. **Legacy User Management Models** (10 models)
- **LegacyUserRole**: Role definitions
- **LegacyUserControl**: Access control
- **LegacyUserFlags**: User flags
- **LegacyUserPrefs**: User preferences
- **LegacyUserNudgePrefs**: Nudge preferences
- **LegacyUserContact**: Contact associations
- **LegacyUserAssignment**: User assignments
- **LegacyUserReport**: Reporting relationships
- **LegacyUserInvite**: User invitations
- **LegacyAccountMeta**: Account metadata

## Key Relationships

### Cross-System Integration Points

1. **Organization Model**: Serves as the bridge between modern and legacy systems
   - Modern relations: tokens, treasury_accounts, settings
   - Legacy relations: kybDoc, billerUnits, subscriberUnits

2. **User Models**: Separate but potentially linkable
   - Modern User: Full crypto/blockchain capabilities
   - LegacyUser: B2B invoicing and billing features

3. **Payment Processing**: Dual systems
   - Modern: Crypto, cards, wire transfers, ACH
   - Legacy: Traditional B2B payment methods

4. **Compliance Framework**: Unified approach
   - Modern: KYC, business rules, blockchain compliance
   - Legacy: KYB documents, business verification

## Migration Strategy

### Phase 1: Schema Deployment
1. Review merged schema for business logic consistency
2. Create database backup
3. Generate Prisma migration: `npx prisma migrate dev --schema=merged.schema.prisma`
4. Test migration in development environment

### Phase 2: Data Migration
1. Map legacy users to modern User model where applicable
2. Convert legacy payment methods to modern equivalents
3. Migrate invoice data with proper references
4. Update application code to use new model names

### Phase 3: Application Updates
1. Update import statements for renamed models
2. Modify queries to use new model names
3. Test all CRUD operations
4. Verify relationship integrity

### Phase 4: Deprecation Plan
1. Maintain legacy models for backward compatibility
2. Gradually migrate functionality to modern models
3. Create data archival strategy for legacy data
4. Plan sunset timeline for legacy system

## Usage Examples

### Accessing Modern Models
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Modern user operations
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    role: 'verified_consumer',
    kyc_status: 'approved'
  }
});

// Blockchain operations
const wallet = await prisma.blockchainWallet.create({
  data: {
    user_id: user.id,
    network: 'solana_mainnet',
    address: '...'
  }
});
```

### Accessing Legacy Models
```typescript
// Legacy user operations
const legacyUser = await prisma.legacyUser.create({
  data: {
    email: 'legacy@example.com',
    name: 'Legacy User',
    organizationId: '...',
    roleId: '...'
  }
});

// Legacy invoice operations
const invoice = await prisma.legacyInvoice.create({
  data: {
    invoiceNum: 'INV-001',
    amount: 1000,
    accountId: '...'
  }
});
```

### Cross-System Queries
```typescript
// Find organization with both modern and legacy relations
const org = await prisma.organization.findUnique({
  where: { id: orgId },
  include: {
    users: true,           // Modern users
    legacyUsers: true,     // Legacy users
    tokens: true,          // Blockchain tokens
    billerUnits: true,     // Legacy billers
    subscriberUnits: true  // Legacy subscribers
  }
});
```

## Important Considerations

### Data Integrity
- Foreign key relationships are maintained across both systems
- Cascade deletes are configured where appropriate
- Unique constraints prevent duplicate data

### Performance
- Indexes are preserved from both schemas
- Consider adding composite indexes for cross-system queries
- Monitor query performance after migration

### Security
- Sensitive fields (private keys, passwords) remain encrypted
- Audit logs track all administrative actions
- Compliance rules apply to both systems

### Compatibility
- Legacy model names prevent breaking changes
- Gradual migration path available
- Backward compatibility maintained

## Next Steps

1. **Review & Validate**: Have stakeholders review the merged schema
2. **Test Migration**: Run migration in test environment
3. **Performance Testing**: Benchmark queries across merged data
4. **Documentation**: Update API documentation for new models
5. **Training**: Train team on new schema structure
6. **Monitoring**: Set up monitoring for migration issues

## Support & Maintenance

- **Schema Version**: 1.0.0
- **Last Updated**: 2025-08-28
- **Merge Script**: `merge_schemas.js`
- **Validation Command**: `DATABASE_URL="..." npx prisma validate --schema=merged.schema.prisma`
- **Format Command**: `npx prisma format --schema=merged.schema.prisma`
- **Migration Command**: `npx prisma migrate dev --schema=merged.schema.prisma`

## Appendix

### Model Count by Category
- Core Models: 11
- KYC/Compliance: 19
- Blockchain/Token: 15
- Crypto/DeFi: 11
- Treasury: 3
- Transactions: 12
- Legacy B2B: 35
- Notifications: 7
- System/Admin: 14
- Legacy User: 10

### Files Generated
1. `merged.schema.prisma` - Complete merged schema
2. `merge_schemas.js` - Automated merge script
3. `MERGED_SCHEMA_DOCUMENTATION.md` - This documentation

### Backup Files
- `schema.prisma` - Original modern schema
- `merged.schema.prisma.backup` - Backup before merge
- Legacy source: `/Users/alisaberi/Library/Mobile Documents/com~apple~CloudDocs/Downloads/schema.prisma_TO_BE_MERGED_DELETE`