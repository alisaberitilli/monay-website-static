# Coin-as-a-Service (CaaS) Platform

A compliant, white-label CaaS platform with dual rail support for Base (EVM) and Solana, featuring WaaS, admin console, APIs, and UIs.

## 🚀 Overview

This platform enables enterprises to create their own branded stablecoins with full compliance controls, custodial and non-custodial wallet options, and cross-rail treasury management.

## 🏗️ Architecture

- **Dual Rail Support**: Base (EVM) + Solana
- **Smart Contracts**: Upgradeable ERC-20 + Solana programs
- **Backend Services**: Microservices architecture with event-driven design
- **Frontend**: Consumer Wallet (PWA + React Native) + Enterprise Console (Next.js)
- **Compliance**: Business Rules Framework (BRF) with real-time decisioning

## 📁 Project Structure

```
monay-caas/
├── contracts/           # Smart contracts (EVM + Solana)
├── services/           # Backend microservices
├── apps/              # Frontend applications
├── infra/             # Infrastructure & deployment
├── docs/              # Documentation & specifications
└── tools/             # Development tools & scripts
```

## 🛠️ Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Foundry (for EVM contracts)
- Solana CLI (for Solana programs)

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository>
   cd monay-caas
   npm install
   ```

2. **Start local development environment:**
   ```bash
   docker-compose up -d
   npm run dev
   ```

3. **Deploy contracts to testnet:**
   ```bash
   npm run deploy:testnet
   ```

## 📚 Documentation

- [API Specification](./docs/api/openapi.yaml)
- [Smart Contract Specifications](./docs/contracts/)
- [System Architecture](./docs/architecture/)
- [Compliance Framework](./docs/compliance/)

## 🔒 Security & Compliance

- SOC2-ready controls
- HSM-secured custodial keys
- Full audit trails
- KYC/KYB integration
- OFAC screening

## 📊 Key Metrics

- T+0 issuance/redeem latency < 5s
- 99.9% API availability
- P95 API latency < 250ms
- Full double-entry ledger reconciliation

## 🤝 Contributing

Please read our [Contributing Guidelines](./CONTRIBUTING.md) before submitting pull requests.

## 📄 License

[License details to be determined]

---

**Built with ❤️ by the Monay/Tilli team**

