# Monay Technical Specification
## Dual-Rail Blockchain Architecture

**Version:** 1.0  
**Date:** January 2025  
**Status:** Draft

---

## 1. Executive Summary

### 1.1 Project Overview
Monay implements a dual-rail blockchain architecture that combines:
- **Enterprise Rail (EVM L2)**: Stablecoin issuance, compliance, and institutional features
- **Consumer Rail (Solana)**: Fast payments, consumer transactions, and user experience
- **Business Rule Framework (BRF)**: Unified compliance and policy enforcement
- **Payment Infrastructure**: Cards, POS, ATM, and mobile wallet integration

### 1.2 Key Objectives
- Enable compliant stablecoin operations
- Provide sub-second payment settlement
- Maintain regulatory compliance across all rails
- Support traditional payment methods (cards, ATM)
- Deliver seamless user experience

---

## 2. Architecture Overview

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Monay Ecosystem                         │
├─────────────────────────────────────────────────────────────┤
│  Frontend Applications                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │   Web App   │  │ Mobile App  │  │ Admin Portal│        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  API Gateway & Load Balancer                              │
├─────────────────────────────────────────────────────────────┤
│  Wallet Orchestrator Service                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ EVM Adapter │  │Solana Adapter│  │ BRF Engine  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  Blockchain Layer                                         │
│  ┌─────────────────┐              ┌─────────────────┐      │
│  │   Enterprise    │              │    Consumer     │      │
│  │   Rail (EVM)    │◄────────────►│   Rail (Solana) │      │
│  │                 │   Cross-Rail │                 │      │
│  │ • ERC-3643      │     Swaps    │ • Token-2022    │      │
│  │ • PolicyHook    │              │ • TransferHook  │      │
│  │ • Access Control│              │ • Fast Settlement│      │
│  └─────────────────┘              └─────────────────┘      │
├─────────────────────────────────────────────────────────────┤
│  Payment Infrastructure                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  TilliPay   │  │ Card Systems│  │ ATM Network │        │
│  │  Gateway    │  │ (Visa/MC)   │  │ (AllPoint)  │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
├─────────────────────────────────────────────────────────────┤
│  External Services                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ KYC/AML     │  │ Monitoring  │  │ Compliance  │        │
│  │ Providers   │  │ & Analytics │  │ Reporting   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow Architecture

```
User Transaction Flow:
1. User initiates payment via mobile app
2. Wallet Orchestrator routes to optimal rail
3. BRF Engine validates against compliance rules
4. Transaction executes on selected blockchain
5. Settlement notification to payment systems
6. Real-time updates to user interface
```

---

## 3. Blockchain Architecture

### 3.1 Enterprise Rail (EVM L2)

#### 3.1.1 Platform Selection
**Options Under Evaluation:**
- **Base (Coinbase L2)**
  - Pros: Strong compliance focus, banking integrations
  - Cons: Newer ecosystem, limited DeFi
- **Polygon zkEVM**
  - Pros: Mature ecosystem, proven scalability
  - Cons: Complexity, potential regulatory concerns

#### 3.1.2 Smart Contract Architecture

```solidity
// ERC-3643 Compliant Security Token
contract MonayStablecoin is ERC3643 {
    // Compliance features
    mapping(address => bool) private _identityVerified;
    mapping(address => uint256) private _spendingLimits;
    
    // Policy enforcement
    modifier onlyCompliant(address _to, uint256 _amount) {
        require(BRFEngine.validateTransfer(msg.sender, _to, _amount));
        _;
    }
    
    // Transfer with compliance check
    function transfer(address _to, uint256 _amount) 
        public 
        onlyCompliant(_to, _amount) 
        returns (bool) 
    {
        return super.transfer(_to, _amount);
    }
}

// Policy Hook for Runtime Compliance
contract PolicyHook {
    IBRFEngine public brf;
    
    function beforeTransfer(
        address from,
        address to,
        uint256 amount
    ) external returns (bool) {
        return brf.validateTransaction(from, to, amount);
    }
}
```

#### 3.1.3 Key Features
- **ERC-3643 Compliance**: Security token standard
- **Identity Integration**: On-chain identity verification
- **Transfer Restrictions**: Programmable compliance rules
- **Audit Trail**: Complete transaction history
- **Upgrade Patterns**: Proxy contracts for updates

### 3.2 Consumer Rail (Solana)

#### 3.2.1 Token Program Architecture

```rust
// Token-2022 with Transfer Hook
use spl_token_2022::extension::transfer_hook::TransferHook;

#[account]
pub struct TransferHookAccount {
    pub policy_authority: Pubkey,
    pub compliance_rules: Vec<ComplianceRule>,
}

// Fast payment processing
impl TransferHookInterface for MonayTransferHook {
    fn execute(&self, ctx: Context<ExecuteTransfer>) -> Result<()> {
        // Quick compliance check (< 100ms)
        let is_valid = self.validate_fast_rules(&ctx)?;
        
        if !is_valid {
            // Defer to Enterprise rail for full compliance
            self.defer_to_enterprise_rail(&ctx)?;
        }
        
        Ok(())
    }
}
```

#### 3.2.2 Key Features
- **Token-2022 Extensions**: Advanced token functionality
- **Transfer Hooks**: Real-time policy enforcement
- **Program Derived Addresses**: Deterministic account generation
- **Cross-Program Invocation**: Integration with other Solana programs
- **Compressed NFTs**: Efficient metadata storage

---

## 4. Business Rule Framework (BRF)

### 4.1 Architecture

```typescript
interface BRFEngine {
  // Core validation
  validateTransaction(params: TransactionParams): Promise<ValidationResult>;
  
  // Rule management
  addRule(rule: ComplianceRule): Promise<void>;
  updateRule(ruleId: string, rule: ComplianceRule): Promise<void>;
  
  // Policy evaluation
  evaluatePolicy(context: PolicyContext): Promise<PolicyDecision>;
}

// Rule types
enum RuleType {
  KYC_VERIFICATION = 'kyc_verification',
  TRANSACTION_LIMIT = 'transaction_limit',
  GEOGRAPHIC_RESTRICTION = 'geographic_restriction',
  SANCTIONS_SCREENING = 'sanctions_screening',
  VELOCITY_CHECK = 'velocity_check',
  MERCHANT_CATEGORY = 'merchant_category'
}
```

### 4.2 Rule Categories

#### 4.2.1 KYC/AML Rules
- Identity verification requirements
- Document validation
- Enhanced due diligence triggers
- Risk scoring algorithms

#### 4.2.2 Transaction Rules
- Daily/monthly limits
- Velocity controls
- Merchant category restrictions
- Geographic limitations

#### 4.2.3 Fraud Prevention
- Device fingerprinting
- Behavioral analysis
- Pattern recognition
- Real-time alerts

---

## 5. Wallet Orchestrator

### 5.1 Architecture

```typescript
class WalletOrchestrator {
  private evmAdapter: EVMRailAdapter;
  private solanaAdapter: SolanaRailAdapter;
  private brfEngine: BRFEngine;
  
  async routeTransaction(tx: Transaction): Promise<TransactionResult> {
    // Determine optimal rail based on:
    // - Transaction amount
    // - Compliance requirements
    // - Speed requirements
    // - Cost optimization
    
    const route = await this.determineOptimalRail(tx);
    
    switch (route.rail) {
      case 'enterprise':
        return this.evmAdapter.execute(tx);
      case 'consumer':
        return this.solanaAdapter.execute(tx);
      case 'cross-rail':
        return this.executeCrossRailSwap(tx);
    }
  }
}
```

### 5.2 Rail Selection Logic

| Criteria | Enterprise Rail | Consumer Rail |
|----------|----------------|---------------|
| Amount | > $10,000 | < $10,000 |
| Compliance | High KYC required | Standard KYC |
| Speed | 2-5 seconds | < 1 second |
| Cost | Higher gas fees | Lower fees |
| Features | Full audit trail | Fast settlement |

---

## 6. Payment Infrastructure

### 6.1 TilliPay Integration

```typescript
interface TilliPayService {
  // On-ramp (Fiat -> Crypto)
  createPayment(params: PaymentParams): Promise<PaymentIntent>;
  processACH(account: BankAccount, amount: number): Promise<ACHResult>;
  processCard(card: CardDetails, amount: number): Promise<CardResult>;
  
  // Off-ramp (Crypto -> Fiat)
  initiatePayout(params: PayoutParams): Promise<PayoutIntent>;
  processWire(account: BankAccount, amount: number): Promise<WireResult>;
}
```

### 6.2 Card Integration

#### 6.2.1 Virtual Card Issuance
```typescript
interface CardService {
  issueVirtualCard(userId: string): Promise<VirtualCard>;
  provisionToWallet(cardId: string, wallet: 'apple' | 'google'): Promise<void>;
  updateCardStatus(cardId: string, status: CardStatus): Promise<void>;
}
```

#### 6.2.2 POS Authorization
```typescript
interface AuthorizationEngine {
  authorizeTransaction(request: AuthRequest): Promise<AuthResponse>;
  
  // Real-time checks
  checkBalance(accountId: string): Promise<number>;
  validateMCC(merchantCode: string): Promise<boolean>;
  checkVelocityLimits(userId: string, amount: number): Promise<boolean>;
}
```

### 6.3 ATM Integration

#### 6.3.1 Cardless Withdrawal
```typescript
interface ATMService {
  generateWithdrawalToken(userId: string, amount: number): Promise<WithdrawalToken>;
  validateQRCode(qrData: string): Promise<ValidationResult>;
  processNFCTap(nfcData: string): Promise<ValidationResult>;
  verifyOTP(token: string, otp: string): Promise<boolean>;
}
```

---

## 7. Security Architecture

### 7.1 Key Management

```typescript
// Hierarchical Deterministic Wallet
interface HDWalletService {
  // Master key derivation
  deriveMasterKey(seed: string): Promise<MasterKey>;
  
  // Chain-specific key derivation
  deriveEVMKeys(masterKey: MasterKey, index: number): Promise<EVMKeyPair>;
  deriveSolanaKeys(masterKey: MasterKey, index: number): Promise<SolanaKeyPair>;
  
  // Multi-signature support
  createMultisigWallet(threshold: number, signers: PublicKey[]): Promise<MultisigWallet>;
}
```

### 7.2 Encryption Standards
- **At Rest**: AES-256-GCM
- **In Transit**: TLS 1.3, mTLS for service communication
- **Key Storage**: Hardware Security Modules (HSM)
- **Secrets Management**: HashiCorp Vault

### 7.3 Authentication & Authorization
- **User Auth**: OAuth 2.0, OIDC
- **API Auth**: JWT with short expiration
- **Service Auth**: mTLS certificates
- **Admin Auth**: MFA required

---

## 8. Compliance & Regulatory

### 8.1 Regulatory Framework

#### 8.1.1 US Compliance
- **FinCEN**: MSB registration
- **State Licenses**: Money transmission licenses
- **AML/KYC**: Customer identification program
- **OFAC**: Sanctions screening

#### 8.1.2 Data Privacy
- **GDPR**: EU data protection (if applicable)
- **CCPA**: California privacy compliance
- **SOC 2**: Security controls audit

### 8.2 Compliance Architecture

```typescript
interface ComplianceService {
  // KYC verification
  verifyIdentity(userId: string, documents: Document[]): Promise<KYCResult>;
  
  // AML screening
  screenTransaction(transaction: Transaction): Promise<AMLResult>;
  
  // Sanctions checking
  checkSanctions(entity: Entity): Promise<SanctionsResult>;
  
  // Reporting
  generateSAR(suspiciousActivity: SuspiciousActivity): Promise<SARReport>;
  generateCTR(cashTransaction: CashTransaction): Promise<CTRReport>;
}
```

---

## 9. Performance Requirements

### 9.1 Throughput Targets
- **Enterprise Rail**: 1,000 TPS
- **Consumer Rail**: 10,000 TPS
- **Cross-Rail Swaps**: 100 TPS
- **Payment Processing**: 5,000 TPS

### 9.2 Latency Requirements
- **Consumer Payments**: < 1 second
- **Enterprise Transactions**: < 5 seconds
- **Card Authorizations**: < 200ms
- **ATM Withdrawals**: < 3 seconds

### 9.3 Availability Targets
- **System Uptime**: 99.95%
- **API Availability**: 99.99%
- **Payment Processing**: 99.9%

---

## 10. Development Stack

### 10.1 Frontend
```json
{
  "framework": "Next.js 14+",
  "language": "TypeScript",
  "styling": "TailwindCSS",
  "state": "Zustand",
  "wallet": "WalletConnect, Phantom",
  "mobile": "React Native / Expo"
}
```

### 10.2 Backend
```json
{
  "runtime": "Node.js 20+",
  "framework": "Express.js / Fastify",
  "database": "PostgreSQL 15+",
  "cache": "Redis 7+",
  "queue": "Apache Kafka",
  "monitoring": "DataDog / Prometheus"
}
```

### 10.3 Blockchain
```json
{
  "evm": {
    "language": "Solidity 0.8.20+",
    "framework": "Hardhat",
    "library": "Ethers.js v6"
  },
  "solana": {
    "language": "Rust",
    "framework": "Anchor",
    "library": "@solana/web3.js"
  }
}
```

### 10.4 Infrastructure
```json
{
  "cloud": "AWS / GCP",
  "container": "Docker + Kubernetes",
  "iac": "Terraform",
  "cicd": "GitHub Actions",
  "secrets": "HashiCorp Vault"
}
```

---

## 11. Testing Strategy

### 11.1 Testing Pyramid

```
              /\
             /  \
            / UI \
           /______\
          /        \
         / API/INT  \
        /____________\
       /              \
      / UNIT/CONTRACT  \
     /____BLOCKCHAIN____\
```

### 11.2 Test Categories
- **Unit Tests**: 80% coverage minimum
- **Integration Tests**: API endpoints, database
- **Smart Contract Tests**: Solidity/Rust programs
- **End-to-End Tests**: Complete user flows
- **Performance Tests**: Load and stress testing
- **Security Tests**: Penetration testing, audits

---

## 12. Deployment Architecture

### 12.1 Environment Strategy
- **Local**: Docker Compose development
- **Staging**: Kubernetes cluster (testnet)
- **Production**: Multi-region Kubernetes (mainnet)

### 12.2 Network Topology

```
Internet
    |
┌───▼───┐
│  CDN  │ (CloudFront/CloudFlare)
└───┬───┘
    |
┌───▼───┐
│  WAF  │ (Web Application Firewall)
└───┬───┘
    |
┌───▼───┐
│  ALB  │ (Application Load Balancer)
└───┬───┘
    |
┌───▼───┐
│  API  │ (API Gateway)
└───┬───┘
    |
┌───▼───┐
│  K8s  │ (Kubernetes Services)
└───┬───┘
    |
┌───▼───┐
│  DB   │ (RDS/CloudSQL)
└───────┘
```

---

## 13. Monitoring & Observability

### 13.1 Metrics Collection
```typescript
interface MetricsService {
  // Business metrics
  trackTransaction(tx: Transaction): void;
  trackUserActivity(userId: string, action: string): void;
  
  // Technical metrics
  trackAPILatency(endpoint: string, duration: number): void;
  trackErrorRate(service: string, errorType: string): void;
  
  // Blockchain metrics
  trackGasUsage(chain: string, txHash: string, gasUsed: number): void;
  trackBlockConfirmation(chain: string, confirmations: number): void;
}
```

### 13.2 Alerting Rules
- **Critical**: System down, security breach
- **High**: High error rate, performance degradation
- **Medium**: Resource usage thresholds
- **Low**: Business metric anomalies

---

## 14. Migration Strategy

### 14.1 Phased Rollout
1. **Alpha**: Internal testing (100 transactions)
2. **Beta**: Limited users (1,000 transactions)
3. **Soft Launch**: Geographic limitation (10,000 users)
4. **General Availability**: Full rollout

### 14.2 Rollback Plan
- **Database**: Point-in-time recovery
- **Smart Contracts**: Pause functionality
- **Services**: Blue-green deployment
- **DNS**: Immediate failover capability

---

## 15. Next Steps

### 15.1 Immediate Actions
1. **EVM L2 Selection**: Base vs Polygon zkEVM evaluation
2. **KYC Provider**: Persona vs Alloy vs Onfido comparison
3. **Development Environment**: Local blockchain setup
4. **Team Assembly**: Core engineering team hiring

### 15.2 Week 1 Deliverables
- [ ] EVM L2 platform decision
- [ ] KYC provider selection
- [ ] Development environment documentation
- [ ] Security infrastructure requirements
- [ ] Banking partnership outreach

---

## Document Control

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Jan 2025 | Initial specification | Monay Engineering |

---

*This specification is a living document and will be updated as technical decisions are finalized and implementation progresses.*