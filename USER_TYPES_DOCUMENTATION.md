# Monay Platform User Types Documentation

## Overview
The Monay platform supports multiple user types across its dual-rail blockchain architecture, integrating Coin-as-a-Service (CaaS), Wallet-as-a-Service (WaaS), and Business Rule Framework (BRF) systems.

## User Categories and Roles

### 1. System Users

#### Platform Admin
- **Role**: `platform_admin`
- **Rail Access**: All rails (EVM L2, Solana, Traditional)
- **Permissions**:
  - Full system configuration and control
  - User management across all roles
  - Smart contract deployment and management
  - BRF rule configuration
  - System monitoring and maintenance
  - Emergency pause/resume capabilities
- **KYC Level**: Enhanced with background verification
- **Transaction Limits**: Unlimited
- **API Access**: Full access to all endpoints

#### Compliance Officer
- **Role**: `compliance_officer`
- **Rail Access**: All rails (read/review only)
- **Permissions**:
  - KYC/AML policy management
  - Transaction monitoring and review
  - Suspicious activity reporting (SAR)
  - Sanctions list management
  - Risk scoring configuration
  - Compliance report generation
- **KYC Level**: Enhanced with regulatory certification
- **Transaction Limits**: Review only (no transaction initiation)
- **API Access**: Compliance and reporting endpoints

#### Treasury Manager
- **Role**: `treasury_manager`
- **Rail Access**: All rails
- **Permissions**:
  - Liquidity pool management
  - Token minting/burning operations
  - Reserve ratio management
  - Cross-rail capital flows
  - Exchange rate configuration
  - Fee structure management
- **KYC Level**: Enhanced with financial background check
- **Transaction Limits**: Unlimited for treasury operations
- **API Access**: Treasury and liquidity endpoints

### 2. Enterprise Users (CaaS)

#### Enterprise Admin
- **Role**: `enterprise_admin`
- **Rail Access**: EVM L2, Traditional
- **Permissions**:
  - Company token deployment (ERC-3643)
  - Employee wallet management
  - Department structure configuration
  - Spending policy creation
  - Compliance rule customization
  - Enterprise analytics access
- **KYC Level**: Business verification required
- **Transaction Limits**: Configurable by platform
- **API Access**: Enterprise management endpoints

#### Enterprise Finance Officer
- **Role**: `enterprise_finance`
- **Rail Access**: EVM L2, Traditional
- **Permissions**:
  - Payroll processing
  - Bulk payment initiation
  - Vendor payment management
  - Financial reporting
  - Budget allocation
  - Expense approval workflows
- **KYC Level**: Enhanced business verification
- **Transaction Limits**: 
  - Daily: $10,000,000
  - Monthly: $100,000,000
- **API Access**: Financial operations endpoints

#### Enterprise Developer
- **Role**: `enterprise_developer`
- **Rail Access**: EVM L2 (testnet and mainnet)
- **Permissions**:
  - Smart contract deployment
  - API integration management
  - Webhook configuration
  - Sandbox environment access
  - Custom token logic implementation
  - Technical documentation access
- **KYC Level**: Standard business verification
- **Transaction Limits**: Testnet unlimited, Mainnet restricted
- **API Access**: Development and integration endpoints

### 3. Consumer Users (WaaS)

#### Verified Consumer
- **Role**: `verified_consumer`
- **Rail Access**: Solana, Traditional
- **Permissions**:
  - Full wallet functionality
  - P2P transfers
  - DeFi protocol access
  - Savings and staking
  - Multi-currency support
  - Card issuance (virtual and physical)
- **KYC Level**: Full KYC (ID + address verification)
- **Transaction Limits**:
  - Daily: $50,000
  - Monthly: $200,000
- **API Access**: Consumer wallet endpoints

#### Basic Consumer
- **Role**: `basic_consumer`
- **Rail Access**: Traditional only
- **Permissions**:
  - Basic send/receive
  - Prepaid card access
  - Limited P2P transfers
  - Basic wallet features
- **KYC Level**: Phone/email verification only
- **Transaction Limits**:
  - Daily: $1,000
  - Monthly: $5,000
- **API Access**: Basic wallet endpoints

#### Premium Consumer
- **Role**: `premium_consumer`
- **Rail Access**: Solana, Traditional
- **Permissions**:
  - All verified consumer features
  - Priority support
  - Advanced trading tools
  - Higher yields on savings
  - Exclusive DeFi access
  - Metal card issuance
- **KYC Level**: Enhanced KYC with wealth verification
- **Transaction Limits**:
  - Daily: $250,000
  - Monthly: $1,000,000
- **API Access**: Premium feature endpoints

#### Secondary User
- **Role**: `secondary_user`
- **Rail Access**: Traditional only
- **Permissions**:
  - Associated with a primary consumer account
  - Basic send/receive (requires primary user approval for certain amounts)
  - View-only access to primary account balance
  - Limited P2P transfers
  - Basic wallet features
  - Restricted card access (if authorized by primary user)
- **KYC Level**: Phone verification + primary user authorization
- **Transaction Limits**:
  - Daily: $500 (or as set by primary user)
  - Monthly: $2,500 (or as set by primary user)
  - Limits can be adjusted by primary account holder
- **API Access**: Basic wallet endpoints with restrictions
- **Special Features**:
  - Primary user can set spending limits
  - Primary user receives notifications of secondary user transactions
  - Can be upgraded to independent basic_consumer with primary user approval

### 4. Business Users

#### Merchant
- **Role**: `merchant`
- **Rail Access**: Traditional, Solana (for crypto payments)
- **Permissions**:
  - Payment acceptance
  - POS integration
  - Invoice generation
  - Refund processing
  - Settlement management
  - Business analytics
- **KYC Level**: Business verification + merchant agreement
- **Transaction Limits**:
  - Based on business volume
  - Customizable by risk profile
- **API Access**: Merchant processing endpoints

#### Payment Processor
- **Role**: `payment_processor`
- **Rail Access**: All rails
- **Permissions**:
  - Gateway integration
  - Bulk processing
  - Multi-currency operations
  - Settlement automation
  - Risk management tools
  - Reconciliation systems
- **KYC Level**: Enhanced business + regulatory compliance
- **Transaction Limits**:
  - Daily: $100,000,000
  - Monthly: Unlimited
- **API Access**: Payment processing endpoints

### 5. Partner Users

#### Banking Partner
- **Role**: `banking_partner`
- **Rail Access**: Traditional
- **Permissions**:
  - Fiat on/off-ramp management
  - ACH/Wire processing
  - Liquidity provision
  - Settlement account management
  - Regulatory reporting
- **KYC Level**: Institutional verification
- **Transaction Limits**: Unlimited
- **API Access**: Banking integration endpoints

#### Exchange Partner
- **Role**: `exchange_partner`
- **Rail Access**: EVM L2, Solana
- **Permissions**:
  - Liquidity pool access
  - Market making tools
  - Price feed provision
  - Trading API access
  - Settlement reconciliation
- **KYC Level**: Institutional verification
- **Transaction Limits**: Unlimited
- **API Access**: Exchange integration endpoints

#### TilliPay Integration User
- **Role**: `tillipay_partner`
- **Rail Access**: Traditional
- **Permissions**:
  - Card program management
  - Issuance processing
  - Transaction processing
  - Dispute handling
  - Compliance reporting
- **KYC Level**: Partner agreement
- **Transaction Limits**: Based on program agreement
- **API Access**: Card program endpoints

### 6. Operational Users

#### Support Agent
- **Role**: `support_agent`
- **Rail Access**: Read-only access to all rails
- **Permissions**:
  - Customer account viewing (read-only)
  - Ticket management
  - Basic refund initiation
  - Issue escalation
  - Knowledge base access
- **KYC Level**: Employee verification
- **Transaction Limits**: Refunds up to $1,000
- **API Access**: Support tool endpoints

#### Risk Analyst
- **Role**: `risk_analyst`
- **Rail Access**: Read access to all rails
- **Permissions**:
  - Transaction pattern analysis
  - Risk scoring adjustment
  - Fraud detection configuration
  - Alert management
  - Risk report generation
- **KYC Level**: Employee verification + background check
- **Transaction Limits**: None (analysis only)
- **API Access**: Risk management endpoints

#### Auditor
- **Role**: `auditor`
- **Rail Access**: Read-only access to all rails
- **Permissions**:
  - Complete transaction history access
  - Audit log viewing
  - Compliance report generation
  - System configuration review
  - No modification capabilities
- **KYC Level**: Professional certification required
- **Transaction Limits**: None (read-only)
- **API Access**: Audit and reporting endpoints

## Permission Matrix

| Feature | Platform Admin | Compliance | Treasury | Enterprise Admin | Verified Consumer | Basic Consumer | Merchant |
|---------|---------------|------------|----------|------------------|-------------------|----------------|----------|
| View All Transactions | ✅ | ✅ | ✅ | Own Org | Own | Own | Own |
| Initiate Transfers | ✅ | ❌ | ✅ | ✅ | ✅ | Limited | ✅ |
| Manage KYC | ✅ | ✅ | ❌ | Own Org | ❌ | ❌ | ❌ |
| Deploy Smart Contracts | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Access DeFi | ✅ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage Liquidity | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Configure BRF Rules | ✅ | ✅ | ❌ | Limited | ❌ | ❌ | ❌ |
| Issue Cards | ✅ | ❌ | ❌ | ✅ | ✅ | Prepaid | ❌ |
| API Access | Full | Limited | Limited | Enterprise | Consumer | Basic | Merchant |

## Transaction Limits by Role

| Role | Daily Limit | Monthly Limit | Per Transaction | Notes |
|------|-------------|---------------|-----------------|-------|
| Platform Admin | Unlimited | Unlimited | Unlimited | Full control |
| Treasury Manager | Unlimited | Unlimited | Unlimited | Treasury operations only |
| Enterprise Admin | $10M | $100M | $1M | Configurable |
| Enterprise Finance | $10M | $100M | $500K | Payroll/vendor payments |
| Verified Consumer | $50K | $200K | $10K | Standard limits |
| Premium Consumer | $250K | $1M | $50K | Enhanced limits |
| Basic Consumer | $1K | $5K | $500 | Entry-level limits |
| Merchant | Variable | Variable | Variable | Based on business volume |

## KYC Requirements

### Level 1 - Basic
- Email verification
- Phone number verification
- Basic information collection
- **Applicable to**: Basic Consumer

### Level 2 - Standard
- Level 1 requirements
- Government ID verification
- Selfie/liveness check
- Address verification
- **Applicable to**: Verified Consumer, Support Agent

### Level 3 - Enhanced
- Level 2 requirements
- Proof of address (utility bill)
- Source of funds verification
- Background check
- **Applicable to**: Premium Consumer, Enterprise users

### Level 4 - Institutional
- Level 3 requirements
- Business registration documents
- Financial statements
- Regulatory compliance certificates
- Director/officer verification
- **Applicable to**: Partners, Payment Processors

## Rail Access Control

### EVM L2 (Enterprise Blockchain)
- **Full Access**: Platform Admin, Treasury Manager, Enterprise Admin
- **Limited Access**: Enterprise Finance, Enterprise Developer
- **Read Only**: Compliance Officer, Auditor

### Solana (Consumer Blockchain)
- **Full Access**: Platform Admin, Treasury Manager
- **Transaction Access**: Verified Consumer, Premium Consumer
- **Limited Access**: Exchange Partner
- **Read Only**: Compliance Officer, Auditor

### Traditional (Banking Rails)
- **Full Access**: Platform Admin, Treasury Manager
- **Transaction Access**: All consumer and business users
- **Integration Access**: Banking Partner, TilliPay Partner
- **Read Only**: Compliance Officer, Auditor

## API Rate Limits

| User Type | Requests/Second | Requests/Hour | Requests/Day |
|-----------|----------------|---------------|--------------|
| Platform Admin | Unlimited | Unlimited | Unlimited |
| Enterprise Developer | 100 | 10,000 | 100,000 |
| Payment Processor | 500 | 50,000 | 500,000 |
| Exchange Partner | 1000 | 100,000 | 1,000,000 |
| Verified Consumer | 10 | 1,000 | 10,000 |
| Basic Consumer | 5 | 500 | 5,000 |
| Support Agent | 50 | 5,000 | 50,000 |

## Security Requirements

### Multi-Factor Authentication (MFA)
- **Required**: All system users, enterprise users, premium consumers
- **Optional**: Verified consumers, basic consumers
- **Methods**: TOTP, SMS, Hardware keys (for high-privilege users)

### Session Management
- **System Users**: 4-hour sessions, IP restriction
- **Enterprise Users**: 8-hour sessions, device management
- **Consumers**: 30-day sessions with biometric re-auth
- **Partners**: API key based, no sessions

### Audit Logging
- All actions by system users are logged
- Transaction history retained for 7 years
- Login attempts tracked and analyzed
- API calls logged with rate limiting

## Implementation Notes

1. **User Migration Path**: Basic → Verified → Premium for consumers
2. **Enterprise Onboarding**: Requires business verification before employee accounts
3. **Partner Integration**: Custom implementation per partner agreement
4. **Compliance Updates**: Quarterly review of limits and requirements
5. **Risk Scoring**: Dynamic adjustment based on user behavior

## Database Schema

```sql
-- User type and role management
CREATE TYPE user_role AS ENUM (
    'platform_admin',
    'compliance_officer',
    'treasury_manager',
    'enterprise_admin',
    'enterprise_finance',
    'enterprise_developer',
    'verified_consumer',
    'basic_consumer',
    'premium_consumer',
    'merchant',
    'payment_processor',
    'banking_partner',
    'exchange_partner',
    'tillipay_partner',
    'support_agent',
    'risk_analyst',
    'auditor'
);

CREATE TYPE rail_type AS ENUM (
    'evm_l2',
    'solana',
    'traditional',
    'all'
);

CREATE TYPE kyc_level AS ENUM (
    'none',
    'basic',
    'standard',
    'enhanced',
    'institutional'
);

-- Extended user attributes
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'basic_consumer',
ADD COLUMN IF NOT EXISTS rail_access rail_type[] DEFAULT ARRAY['traditional'],
ADD COLUMN IF NOT EXISTS kyc_level kyc_level DEFAULT 'none',
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id),
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS transaction_limits JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS api_rate_limits JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_kyc_review TIMESTAMP,
ADD COLUMN IF NOT EXISTS risk_score INTEGER DEFAULT 50;

-- Organizations for enterprise users
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50), -- 'enterprise', 'merchant', 'partner'
    verification_status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Role permissions mapping
CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role user_role NOT NULL,
    permission VARCHAR(255) NOT NULL,
    resource VARCHAR(255),
    action VARCHAR(50), -- 'read', 'write', 'delete', 'execute'
    UNIQUE(role, permission, resource, action)
);

-- Audit log for compliance
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    resource_type VARCHAR(100),
    resource_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Contact Information

For role upgrades or permission changes, contact:
- **System Administration**: admin@monay.com
- **Compliance**: compliance@monay.com
- **Enterprise Support**: enterprise@monay.com
- **Partner Integration**: partners@monay.com

---

*Last Updated: December 2024*
*Version: 1.0.0*