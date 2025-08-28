e# Monay Blockchain Dual-Rail Specification
## Coin-as-a-Service (CaaS) and Wallet-as-a-Service (WaaS)

**Version:** 1.0  
**Date:** January 2025  
**Status:** Draft

---

## Executive Summary

This specification outlines the implementation of a dual-rail blockchain architecture for Monay, enabling both enterprise-grade stablecoin issuance and consumer-facing payment services. The system leverages:

- **Primary Rail (Enterprise):** EVM L2 (Base or Polygon zkEVM) with ERC-3643 for permissioned token issuance
- **Consumer Rail:** Solana with Token Extensions for ultra-low-cost, high-throughput transactions
- **Cross-Rail Integration:** Seamless value movement between chains via treasury swap model
- **Compliance Framework:** Unified Business Rule Framework (BRF) across both rails

---

## 1. Architecture Overview

### 1.1 Dual-Rail System Design

```
┌─────────────────────────────────────────────────────────────┐
│                    MONAY DUAL-RAIL ARCHITECTURE             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────────┐    ┌──────────────────────┐     │
│  │   ENTERPRISE RAIL    │    │    CONSUMER RAIL     │     │
│  │  EVM L2 + ERC-3643   │◄──►│  Solana + Token Ext  │     │
│  └──────────────────────┘    └──────────────────────┘     │
│           ▲                            ▲                    │
│           │                            │                    │
│           ▼                            ▼                    │
│  ┌──────────────────────────────────────────────┐         │
│  │         WALLET ORCHESTRATOR & BRF            │         │
│  └──────────────────────────────────────────────┘         │
│                          ▲                                 │
│                          │                                 │
│                          ▼                                 │
│  ┌──────────────────────────────────────────────┐         │
│  │      ON-RAMP / OFF-RAMP (TilliPay)          │         │
│  └──────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Why Dual Rails?

#### Primary Rail: EVM L2 (Enterprise)
- **Purpose:** Enterprise issuance, permissioned transfers, regulatory compliance
- **Benefits:** 
  - Composability with Ethereum ecosystem
  - ERC-3643 compliance framework
  - Smart contract flexibility
  - DeFi integration capability

#### Consumer Rail: Solana
- **Purpose:** High-speed, low-cost consumer transactions
- **Benefits:**
  - <$0.001 transaction fees
  - 65,000 TPS capability
  - Real-time settlement
  - Transfer Hooks for embedded compliance

---

## 2. Technical Components

### 2.1 Smart Contracts & Programs

#### EVM L2 Contracts
```solidity
// MonayToken.sol - ERC-3643 Implementation
contract MonayToken {
    - ERC-20 core functionality
    - ERC-3643 permissioning
    - AccessControl (ISSUER, COMPLIANCE, CONTROLLER)
    - Pausable, Freezable, optional Clawback
    - PolicyHook integration for BRF
}

// PolicyHook.sol
contract PolicyHook {
    - preTransfer validation
    - BRF attestation verification
    - Merkle allowlist checking
    - Real-time compliance enforcement
}
```

#### Solana Programs
```rust
// policy_adapter.rs
- TransferHook implementation
- PDA-based decision state
- Oracle integration for BRF
- Real-time policy enforcement
```

### 2.2 Business Rule Framework (BRF)

```yaml
Components:
  - Rule Engine Core
  - Decision Service
  - Compliance Evaluator
  - Fraud Detection
  
Rule Categories:
  - Eligibility Rules
  - KYC/AML Rules
  - Spend Management Rules
  - Fraud Prevention Rules
  
Integration Points:
  - EVM: PolicyHook contract
  - Solana: TransferHook adapter
  - API: REST/GraphQL endpoints
```

### 2.3 Cross-Rail Integration

```javascript
// Treasury Swap Model
{
  "flow": "EVM → Solana",
  "steps": [
    "1. Initiate cross-rail intent",
    "2. BRF pre-transfer check",
    "3. Burn tokens on source rail (EVM)",
    "4. Update treasury ledger",
    "5. Mint tokens on destination rail (Solana)",
    "6. Confirm settlement"
  ],
  "guarantees": {
    "atomicity": true,
    "idempotency": true,
    "reconciliation": "real-time"
  }
}
```

---

## 3. API Specifications

### 3.1 Core APIs

#### Wallet Management
```typescript
POST /api/wallet/create
GET  /api/wallet/balance
POST /api/wallet/transfer

// Cross-rail operations
POST /api/xrail/swap
GET  /api/xrail/status/{correlationId}
```

#### BRF Integration
```typescript
POST /api/brf/pre-transfer-check
{
  "userId": "uuid",
  "amount": 1000,
  "rail": "EVM|SOL",
  "recipient": "address",
  "metadata": {
    "mcc": "5411",
    "geo": "US-CA",
    "device": "device-id"
  }
}

Response: {
  "decision": "ALLOW|DENY|REVIEW",
  "reasons": ["KYC_TIER", "VELOCITY"],
  "attestation": "jwt-token",
  "ttl": 60000
}
```

#### On-Ramp/Off-Ramp
```typescript
POST /api/payments/on-ramp
{
  "amount": 100.00,
  "currency": "USD",
  "paymentMethod": "card|ach|wire",
  "destinationRail": "EVM|SOL"
}

POST /api/payments/off-ramp
{
  "amount": 100.00,
  "sourceRail": "EVM|SOL",
  "payoutMethod": "ach|wire",
  "bankAccount": "encrypted-ref"
}
```

---

## 4. Compliance & Security

### 4.1 KYC/AML Integration

```yaml
Providers:
  - Persona
  - Alloy
  - Onfido
  - Trulioo

Tiers:
  Lite:
    - Phone verification
    - Email verification
    - Basic info
    - Limits: $1,000/day
  
  Full:
    - Government ID
    - Selfie/liveness
    - Address verification
    - Limits: $10,000/day
```

### 4.2 Transaction Monitoring

```javascript
// Real-time monitoring rules
{
  "velocity": {
    "1min": 5,
    "1hour": 20,
    "24hour": 50
  },
  "limits": {
    "single": 5000,
    "daily": 10000,
    "monthly": 50000
  },
  "geo_restrictions": ["restricted-countries"],
  "mcc_blacklist": ["7995", "7800"], // Gambling
  "fraud_signals": {
    "device_mismatch": true,
    "ip_anomaly": true,
    "pattern_detection": true
  }
}
```

### 4.3 Data Security

- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Key Management:** HSM/KMS for signing keys
- **Audit Logs:** Immutable WORM storage, 7-year retention
- **PII Handling:** Tokenization, field-level encryption

---

## 5. Integration Services

### 5.1 Payment Partners

```yaml
Primary:
  - TilliPay (primary on/off-ramp)
  
Secondary:
  - Circle
  - MoonPay
  - Wyre
  - Zero Hash
  
Banking:
  - ACH integration
  - FedNow support
  - Wire transfers
  - Card networks (Visa/Mastercard)
```

### 5.2 Blockchain Infrastructure

```yaml
EVM L2:
  Networks:
    - Base (Coinbase L2)
    - Polygon zkEVM
  
  RPCs:
    - Primary: Dedicated nodes
    - Backup: Alchemy/Infura
  
  Gas Management:
    - Paymaster for gasless transactions
    - Dynamic gas pricing

Solana:
  Cluster: mainnet-beta
  
  RPCs:
    - Primary: Dedicated RPC
    - Backup: Helius/QuickNode
  
  Priority Fees:
    - Dynamic compute units
    - MEV protection
```

---

## 6. Development Roadmap

### Phase 0: Foundations (Weeks 1-3)
- [ ] Finalize architecture design
- [ ] Select L2 (Base vs Polygon zkEVM)
- [ ] Set up development environment
- [ ] Provision security infrastructure

### Phase 1: Core Development (Weeks 4-9)
- [ ] Deploy ERC-3643 contracts on testnet
- [ ] Implement Solana policy adapter
- [ ] Build BRF service
- [ ] Create wallet orchestrator

### Phase 2: Integration (Weeks 10-14)
- [ ] Integrate KYC/AML providers
- [ ] Connect TilliPay for on/off-ramp
- [ ] Implement cross-rail swaps
- [ ] Build admin portal

### Phase 3: Testing & Compliance (Weeks 15-18)
- [ ] Security audits (smart contracts)
- [ ] Load testing (10,000 TPS target)
- [ ] Compliance review
- [ ] Penetration testing

### Phase 4: Pilot Launch (Weeks 19-22)
- [ ] Limited beta with select users
- [ ] Monitor performance metrics
- [ ] Gather feedback
- [ ] Bug fixes and optimizations

### Phase 5: Production Launch (Weeks 23-28)
- [ ] Gradual rollout
- [ ] 24/7 monitoring setup
- [ ] Support team training
- [ ] Documentation completion

---

## 7. Technical Requirements

### 7.1 Performance Targets

```yaml
Latency:
  - API response: < 200ms P95
  - BRF decision: < 150ms P99
  - Cross-rail swap: < 30 seconds
  
Throughput:
  - EVM L2: 1,000 TPS
  - Solana: 10,000 TPS
  - API Gateway: 50,000 RPS
  
Availability:
  - Core services: 99.95%
  - Wallet access: 99.9%
  - Support response: < 4 hours
```

### 7.2 Infrastructure

```yaml
Cloud Provider: AWS/GCP (multi-region)

Services:
  - Kubernetes (EKS/GKE)
  - PostgreSQL (RDS/CloudSQL)
  - Redis (ElastiCache)
  - Kafka (MSK/Confluent)
  - S3/GCS (WORM storage)
  
Security:
  - WAF protection
  - DDoS mitigation
  - VPN access
  - Bastion hosts
```

---

## 8. Monitoring & Observability

### 8.1 Metrics

```yaml
Business Metrics:
  - Transaction volume by rail
  - Cross-rail swap volume
  - KYC conversion rates
  - Fraud detection rates
  
Technical Metrics:
  - API latency percentiles
  - Error rates by service
  - Database query performance
  - Blockchain confirmation times
  
Compliance Metrics:
  - KYC completion rates
  - Sanctions screening hits
  - Rule trigger frequencies
  - Manual review queue depth
```

### 8.2 Dashboards

- **Operations Dashboard:** Real-time system health
- **Compliance Dashboard:** KYC status, rule triggers
- **Finance Dashboard:** Transaction volumes, fees
- **Support Dashboard:** User issues, response times

---

## 9. Risk Management

### 9.1 Technical Risks

| Risk | Mitigation |
|------|------------|
| Blockchain congestion | Multi-RPC strategy, fallback chains |
| Smart contract bugs | Formal verification, audits |
| Oracle failures | Redundant oracles, fail-closed design |
| Key compromise | HSM usage, key rotation protocols |

### 9.2 Operational Risks

| Risk | Mitigation |
|------|------------|
| Regulatory changes | Flexible BRF, compliance monitoring |
| Partner outages | Multiple provider redundancy |
| Fraud attempts | Real-time monitoring, ML detection |
| Data breaches | Encryption, access controls, SOC2 |

---

## 10. Appendices

### A. Glossary

- **BRF:** Business Rule Framework
- **CaaS:** Coin-as-a-Service
- **ERC-3643:** Enterprise token standard with compliance
- **PDA:** Program Derived Address (Solana)
- **WaaS:** Wallet-as-a-Service

### B. References

- ERC-3643 Specification
- Solana Token Extensions Documentation
- KYC/AML Best Practices Guide
- PCI-DSS Compliance Standards

### C. Contact Information

- **Technical Lead:** [technical@monay.com]
- **Compliance:** [compliance@monay.com]
- **Support:** [support@monay.com]

---

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Jan 2025 | Ali Saberi | Initial specification |

---

*This document is proprietary and confidential. All rights reserved by Monay/Utilli LLC.*