# Monay Platform - Complete Pricing Structure
*Last Updated: January 2025*

## Table of Contents
1. [Payment Processing Costs](#payment-processing-costs)
2. [Platform Package Pricing](#platform-package-pricing)
3. [Infrastructure Costs](#infrastructure-costs)
4. [Compliance & KYC Costs](#compliance--kyc-costs)
5. [Blockchain Transaction Costs](#blockchain-transaction-costs)
6. [Third-Party Service Costs](#third-party-service-costs)
7. [Total Cost Analysis](#total-cost-analysis)

---

## 1. Payment Processing Costs

### A. Dwolla (FedNow/RTP/ACH)
**Primary payment rails provider for instant and ACH payments**

#### Pricing Tiers
| Service | Cost | Details |
|---------|------|---------|
| **FedNow** | $0.045/transaction | Instant settlement (<20 seconds) |
| **RTP (Real-Time Payments)** | $0.045/transaction | Instant settlement (<15 seconds) |
| **Same-Day ACH** | $0.30/transaction | Same business day settlement |
| **Standard ACH** | $0.25/transaction | 2-3 business days settlement |
| **Account Verification** | $0.50/verification | Micro-deposit or instant verification |
| **Balance Check** | $0.005/check | Real-time balance verification |

#### Volume Discounts
- 10,000+ transactions/month: 15% discount
- 50,000+ transactions/month: 25% discount
- 100,000+ transactions/month: Custom pricing

#### Monthly Minimums
- Sandbox: Free
- Production: $250/month minimum

### B. Stripe
**Card processing and international payments**

#### Transaction Fees
| Service | Cost | Details |
|---------|------|---------|
| **Domestic Cards** | 2.9% + $0.30 | US-issued cards |
| **International Cards** | 3.9% + $0.30 | Non-US cards |
| **ACH Direct Debit** | 0.8% (capped at $5) | Bank account payments |
| **Wire Transfers** | $15/wire | Domestic wires |
| **International Wires** | $35/wire | International transfers |
| **Instant Payouts** | 1% (min $0.50) | Instant to debit cards |
| **Currency Conversion** | 2% | Foreign exchange markup |
| **Dispute/Chargeback** | $15/dispute | Refunded if won |

#### Stripe Connect (Platform)
- **Standard Connect**: 0.25% + $0.25 per payout
- **Express Connect**: 0.25% on volume
- **Custom Connect**: 2% of platform fee

### C. TilliPay
**Alternative payment processor (backup)**

#### Account Types & Fees
| Account Type | Transaction Fee | Monthly Fee |
|--------------|----------------|-------------|
| **MAIN Account** | 2.5% + $0.25 | $99/month |
| **CARD Account** | 2.8% + $0.30 | $49/month |
| **ACH/ICA Account** | 0.5% (min $0.50) | $149/month |
| **CBP Account** | 3.5% + $0.50 | $199/month |

---

## 2. Platform Package Pricing

### A. Monay CaaS (Coin-as-a-Service)

#### Enterprise Packages
| Package | Monthly Fee | Transaction Fee | Features |
|---------|------------|-----------------|----------|
| **Starter** | $2,500 | 0.5% | Up to 10,000 transactions/month, Basic compliance |
| **Growth** | $7,500 | 0.3% | Up to 100,000 transactions/month, Advanced compliance |
| **Enterprise** | $25,000 | 0.15% | Unlimited transactions, Full compliance suite |
| **Custom** | Contact Sales | Negotiable | White-label, dedicated support |

#### Additional Features
- **Token Deployment**: $5,000 one-time
- **Smart Contract Audit**: $15,000 - $50,000
- **Custom Compliance Rules**: $500/rule
- **Dedicated Support**: $2,500/month

### B. Monay WaaS (Wallet-as-a-Service)

#### Consumer Tiers
| Tier | Monthly Fee | Daily Limits | Features |
|------|------------|--------------|----------|
| **Basic** | Free | $1,000 | Prepaid card, basic wallet |
| **Verified** | $4.99 | $50,000 | Full features, standard card |
| **Premium** | $19.99 | $250,000 | Metal card, DeFi access, priority support |
| **Business** | $99.99 | Custom | Multiple users, expense management |

#### Transaction Fees (Consumer)
- **Peer-to-Peer**: Free
- **Bill Payment**: $0.50
- **ATM Withdrawal**: $2.50 (AllPoint network free)
- **International Transfer**: 1.5%
- **Crypto Exchange**: 1%

### C. Government Services (GENIUS Act Compliant)

#### Program Pricing
| Service | Setup Fee | Per-Transaction | Monthly Platform |
|---------|-----------|-----------------|------------------|
| **SNAP Distribution** | $50,000 | $0.10 | $5,000 |
| **TANF Management** | $50,000 | $0.15 | $5,000 |
| **Emergency Disbursement** | $25,000 | $0.25 | $2,500 |
| **Benefits Portal** | $100,000 | $0.05 | $10,000 |
| **Fraud Detection** | $35,000 | $0.02 | $3,500 |

---

## 3. Infrastructure Costs

### A. Cloud Services (AWS/GCP)

#### Monthly Estimates
| Service | Cost | Details |
|---------|------|---------|
| **Compute (EC2/GCE)** | $2,500 | Auto-scaling instances |
| **Database (RDS/CloudSQL)** | $1,500 | Multi-AZ PostgreSQL |
| **Storage (S3/GCS)** | $500 | 10TB with CDN |
| **Load Balancing** | $250 | Application load balancers |
| **CDN (CloudFront/Cloud CDN)** | $350 | Global content delivery |
| **Monitoring (DataDog)** | $750 | APM and logging |
| **Backup & DR** | $400 | Cross-region replication |

**Total Infrastructure**: ~$6,250/month

### B. Security & Compliance

| Service | Cost | Details |
|---------|------|---------|
| **PCI-DSS Compliance** | $1,200/month | Certification & scanning |
| **SOC 2 Type II** | $2,500/month | Annual audit amortized |
| **SSL Certificates** | $100/month | Wildcard certificates |
| **DDoS Protection** | $500/month | CloudFlare Enterprise |
| **Security Monitoring** | $800/month | 24/7 SOC |

---

## 4. Compliance & KYC Costs

### A. KYC/AML Providers

#### Persona (Primary)
| Service | Cost | Volume |
|---------|------|--------|
| **Identity Verification** | $1.50/verification | 0-10k/month |
| **Document Verification** | $0.75/document | All volumes |
| **Database Check** | $0.25/check | Sanctions, PEP |
| **Ongoing Monitoring** | $0.10/user/month | Continuous |

#### Alloy (Secondary)
| Service | Cost | Details |
|---------|------|---------|
| **Basic KYC** | $2.00/check | Identity + documents |
| **Enhanced Due Diligence** | $5.00/check | Deep verification |
| **Business Verification** | $10.00/check | KYB checks |

#### ComplyAdvantage
| Service | Cost | Details |
|---------|------|---------|
| **Sanctions Screening** | $0.15/check | Real-time |
| **Transaction Monitoring** | $0.02/transaction | ML-powered |
| **Case Management** | $500/month | Platform access |

---

## 5. Blockchain Transaction Costs

### A. Base (EVM L2)

#### Gas Fees (Estimated)
| Operation | Cost (USD) | Details |
|-----------|------------|---------|
| **Token Deploy** | $5-10 | One-time |
| **Token Transfer** | $0.01-0.05 | Per transaction |
| **Mint/Burn** | $0.02-0.08 | Supply management |
| **Compliance Check** | $0.01-0.03 | On-chain verification |
| **Multi-sig Operation** | $0.05-0.15 | Governance transactions |

### B. Solana

#### Transaction Fees
| Operation | Cost (USD) | Details |
|-----------|------------|---------|
| **Program Deploy** | $2-5 | One-time |
| **Token Transfer** | $0.00025 | Per transaction |
| **Token Mint** | $0.001 | New token creation |
| **Account Creation** | $0.002 | Rent-exempt account |
| **Metadata Update** | $0.0005 | Token metadata |

### C. Cross-Chain Bridge

| Operation | Cost | Details |
|-----------|------|---------|
| **Bridge Transfer** | 0.1% + gas | Cross-rail movement |
| **Liquidity Provider** | 0.05% APY | Incentive costs |
| **Oracle Updates** | $50/month | Chainlink price feeds |

---

## 6. Third-Party Service Costs

### A. Banking Partners

| Service | Cost | Provider |
|---------|------|----------|
| **FBO Account** | $500/month | Cross River Bank |
| **Virtual Account Issuance** | $0.50/account | Banking partner |
| **Wire Processing** | $10/wire | Partner bank |
| **Check Processing** | $3/check | Partner bank |

### B. Card Issuance

| Service | Cost | Details |
|---------|------|---------|
| **Virtual Card** | $1/card | Instant issuance |
| **Physical Card (Standard)** | $5/card | 5-7 day delivery |
| **Physical Card (Metal)** | $25/card | Premium tier |
| **Card Replacement** | $10/card | Lost/stolen |
| **International ATM** | $3/withdrawal | Outside network |

### C. Communication Services

| Service | Cost | Provider |
|---------|------|----------|
| **SMS (Twilio)** | $0.0075/message | US numbers |
| **International SMS** | $0.05/message | Varies by country |
| **Email (SendGrid)** | $100/month | 100k emails |
| **Push Notifications** | $50/month | Firebase |

---

## 7. Total Cost Analysis

### A. Cost Per User (Average)

#### Consumer User
| Component | Monthly Cost |
|-----------|-------------|
| **KYC Verification** | $1.50 (one-time amortized) |
| **Account Maintenance** | $0.25 |
| **Transaction Processing** | $2.50 (avg 10 txns) |
| **Infrastructure** | $0.15 |
| **Support** | $0.35 |
| **Total CAC** | ~$4.75/user/month |

#### Enterprise Client
| Component | Monthly Cost |
|-----------|-------------|
| **Onboarding** | $500 (amortized) |
| **Platform Fee** | $7,500 |
| **Transaction Fees** | $1,500 (avg volume) |
| **Support & Compliance** | $1,000 |
| **Infrastructure** | $250 |
| **Total** | ~$10,750/client/month |

### B. Unit Economics

#### Revenue Streams
1. **Platform Fees**: 40% of revenue
2. **Transaction Fees**: 35% of revenue
3. **Value-Added Services**: 15% of revenue
4. **Interest/Float**: 10% of revenue

#### Cost Structure
1. **Payment Processing**: 30% of costs
2. **Infrastructure**: 20% of costs
3. **Compliance/KYC**: 15% of costs
4. **Personnel**: 25% of costs
5. **Marketing/Sales**: 10% of costs

### C. Margin Analysis

| Metric | Target | Current |
|--------|--------|---------|
| **Gross Margin** | 70% | 65% |
| **Contribution Margin** | 45% | 40% |
| **EBITDA Margin** | 25% | -5% (growth phase) |
| **CAC Payback** | 12 months | 14 months |
| **LTV:CAC Ratio** | 3:1 | 2.5:1 |

---

## Pricing Strategy Recommendations

### 1. **Volume-Based Discounts**
- Implement tiered pricing with automatic upgrades
- Offer 10-30% discounts for high-volume users
- Annual prepayment discounts (15-20%)

### 2. **Bundling Opportunities**
- CaaS + WaaS bundle: 20% discount
- Full compliance package: $5,000/month (save 25%)
- Government services suite: Custom pricing

### 3. **Cost Optimization Targets**
- Reduce payment processing by 15% through rail optimization
- Lower KYC costs by 20% through batching
- Decrease infrastructure costs by 25% through auto-scaling

### 4. **Revenue Growth Levers**
- Increase transaction volume by 50% YoY
- Upsell 30% of Basic to Verified tier
- Add 5 enterprise clients per quarter
- Launch 3 new industry verticals per year

### 5. **Competitive Positioning**
- Price 15-20% below traditional banks
- Match fintech competitors on features
- Premium pricing for compliance/security
- Government contracts at cost + 20%

---

## Implementation Timeline

### Q1 2025
- Launch FedNow/RTP with Dwolla ✅
- Implement tiered pricing structure
- Optimize payment routing for cost

### Q2 2025
- Add volume discount automation
- Launch government pricing packages
- Implement dynamic pricing engine

### Q3 2025
- Introduce enterprise bundles
- Launch loyalty/retention pricing
- Add usage-based billing options

### Q4 2025
- Review and adjust pricing
- Implement AI-based price optimization
- Launch partner/reseller pricing

---

## Contact for Custom Pricing
- **Enterprise Sales**: enterprise@monay.com
- **Government Sales**: gov@monay.com
- **Partner Programs**: partners@monay.com
- **Support**: support@monay.com

---

*Note: All prices subject to change. Volume discounts and custom pricing available for qualified customers. Government and non-profit discounts available upon request.*