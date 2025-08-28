# Base L2 (EVM) Integration Documentation
## Monay Enterprise Rail Implementation

## Overview
Base L2 serves as the **Enterprise Rail** in Monay's dual-rail blockchain architecture, providing institutional-grade stablecoin issuance with comprehensive compliance features. This document outlines the current implementation status, architecture, and roadmap for Base L2 EVM integration.

## Architecture Role
- **Purpose**: Enterprise and institutional operations with regulatory compliance
- **Target Performance**: 1,000 TPS with <5 second confirmations
- **Network**: Base Goerli Testnet (targeting Base Mainnet for production)
- **Standards**: ERC-3643 compliant tokens for permissioned transfers
- **Integration**: Cross-rail bridge to Solana (Consumer Rail) via treasury model

## Current Implementation Status

### 1. Dependencies & Setup
**Package Dependencies**:
```json
{
  "ethers": "^6.8.0",
  "web3": "^4.2.0",
  "@solana/web3.js": "^1.98.4"
}
```

### 2. API Endpoints
**Location**: `/monay-backend-common/src/routes/blockchain.js`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/blockchain/base/status` | GET | Base L2 network status |
| `/api/blockchain/bridge/status` | GET | Cross-rail bridge status |
| `/api/blockchain/health` | GET | Overall blockchain health |

### 3. Network Configuration

#### Current Mock Configuration:
```javascript
{
  chain: 'Base L2',
  type: 'EVM',
  network: 'testnet',
  chainId: 84531, // Base Goerli
  rpcUrl: 'https://goerli.base.org',
  gasPrice: '0.001 gwei'
}
```

#### Environment Variables Required:
- `BASE_RPC_URL`: Base L2 RPC endpoint
- `BASE_CHAIN_ID`: Network chain ID
- `BASE_PRIVATE_KEY`: Deployer private key (production: HSM)
- `BASE_TREASURY_ADDRESS`: Treasury contract address
- `BASE_COMPLIANCE_REGISTRY`: Compliance registry address

## Smart Contract Architecture

### 1. ERC-3643 Compliance Token
**Location**: `/old/archive/.../contracts/ERC3643ComplianceToken.sol`

#### Core Features:
- **Token Standards**: ERC-3643 (T-REX) compliant
- **Identity Registry**: On-chain identity management
- **Compliance Rules**: Modular compliance framework
- **Access Control**: Role-based permissions

#### Contract Components:
```solidity
MonayComplianceToken:
├── Business Rule Management
│   ├── Rule creation and priority
│   ├── User-rule assignments
│   └── Category-based rules (KYC, Spend, etc.)
├── Spend Limit Controls
│   ├── Daily/Monthly/Transaction limits
│   ├── Automatic spend tracking
│   └── Time-based resets
├── KYC/AML Integration
│   ├── KYC levels (Basic/Enhanced/Premium)
│   ├── Risk scoring (0-100)
│   └── Provider integration
└── Transfer Controls
    ├── Pre-transfer compliance checks
    ├── Rule violation events
    └── Transaction blocking
```

### 2. Planned Smart Contracts

#### Treasury Contract:
```solidity
Features:
- Multi-signature controls
- Cross-rail swap initiation
- Liquidity management
- Fee collection
```

#### Token Factory:
```solidity
Features:
- Enterprise token deployment
- Compliance rule templates
- Upgrade mechanisms
- Registry management
```

#### PolicyHook Contract:
```solidity
Features:
- Business rule enforcement
- Transfer validation
- Compliance attestations
- Event logging
```

## Database Schema Integration

### Supported Tables:
- **crypto_wallets**: EVM address storage
- **crypto_transactions**: EVM transaction records
- **smart_contracts**: Deployed contract tracking
- **compliance_rules**: On-chain rule references
- **token_registry**: ERC-3643 token metadata

### Key Fields:
```sql
- blockchain_type: 'ethereum' / 'base'
- address_format: '0x' prefixed, checksummed
- transaction_hash: '0x' + 64 hex chars
- block_number: Integer block height
- gas_used: Wei units
```

## ERC-3643 Token Implementation

### Core Components:

#### 1. Identity Registry:
- On-chain identity storage
- Claims and attestations
- Identity verification status
- Trusted claim issuers

#### 2. Compliance Module:
- Transfer restrictions
- Country-based restrictions
- Time-based restrictions
- Amount-based restrictions

#### 3. Token Lifecycle:
```
Deploy → Configure → Issue → Transfer → Burn
   ↓         ↓         ↓        ↓        ↓
Registry  Rules    Mint    Comply   Redeem
```

### Business Rules Framework

#### Rule Categories:
1. **KYC_ELIGIBILITY**: Identity verification requirements
2. **SPEND_MANAGEMENT**: Transaction limits and controls
3. **FRAUD_PREVENTION**: Risk-based restrictions
4. **COMPLIANCE**: Regulatory requirements

#### Rule Processing:
```javascript
Pre-Transfer Check:
1. Load user rules
2. Sort by priority
3. Evaluate conditions
4. Apply actions
5. Generate attestation
```

## Cross-Rail Integration

### Treasury Swap Architecture:
```
Base L2 (Enterprise) ←→ Treasury ←→ Solana (Consumer)
```

### Swap Process:
1. **Initiation**: User requests cross-rail transfer
2. **Validation**: Smart contract validates request
3. **Lock/Burn**: Tokens locked/burned on Base
4. **Treasury Update**: Central ledger reconciliation
5. **Mint/Unlock**: Tokens minted/unlocked on Solana
6. **Confirmation**: Transaction finalized

### Bridge Status:
- Currently mock implementation
- Planned atomic swap guarantees
- Target <60 second completion

## Security Implementation

### Current Security Measures:
- Role-based access control (RBAC)
- Re-entrancy guards
- Overflow protection
- Input validation

### Production Requirements:
- [ ] Multi-signature wallet deployment
- [ ] Time-locked operations
- [ ] Emergency pause mechanism
- [ ] Upgrade proxy patterns
- [ ] Formal verification
- [ ] Security audits (3+ firms)

## Gas Optimization

### Strategies:
1. **Batch Operations**: Multiple transfers in one transaction
2. **Storage Optimization**: Packed structs and mappings
3. **Event Logging**: Off-chain data with on-chain proofs
4. **Proxy Patterns**: Upgradeable contracts

### Estimated Costs:
| Operation | Gas Units | Cost (USD) |
|-----------|-----------|------------|
| Deploy Token | 3,000,000 | ~$30 |
| Transfer | 65,000 | ~$0.65 |
| Mint/Burn | 50,000 | ~$0.50 |
| Update Rules | 45,000 | ~$0.45 |

## Development Roadmap

### Phase 1: Foundation (Pending)
- [ ] Ethers.js service implementation
- [ ] Wallet management service
- [ ] Basic ERC-20 operations
- [ ] RPC connection management

### Phase 2: Smart Contract Deployment
- [ ] Deploy ERC-3643 token contract
- [ ] Deploy compliance registry
- [ ] Deploy treasury contract
- [ ] Verify contracts on Basescan

### Phase 3: Integration
- [ ] Connect smart contracts to backend
- [ ] Implement transaction monitoring
- [ ] Build compliance rule engine
- [ ] Create admin interfaces

### Phase 4: Cross-Rail Bridge
- [ ] Deploy bridge contracts
- [ ] Implement swap logic
- [ ] Treasury reconciliation
- [ ] Event synchronization

### Phase 5: Production
- [ ] Mainnet deployment
- [ ] Gas optimization
- [ ] Security audits
- [ ] Performance testing

## Testing Strategy

### Contract Testing:
```bash
# Unit tests
npx hardhat test

# Coverage
npx hardhat coverage

# Gas reporting
REPORT_GAS=true npx hardhat test
```

### Integration Testing:
```javascript
// Test compliance rules
await token.createBusinessRule(...)
await token.transferWithRules(...)

// Test cross-rail
await bridge.initiateSwap(...)
await bridge.confirmSwap(...)
```

## Deployment Guide

### 1. Environment Setup:
```bash
export BASE_RPC_URL="https://goerli.base.org"
export PRIVATE_KEY="your-private-key"
export ETHERSCAN_API_KEY="your-api-key"
```

### 2. Deploy Contracts:
```bash
npx hardhat run scripts/deploy.js --network base-goerli
```

### 3. Verify Contracts:
```bash
npx hardhat verify --network base-goerli CONTRACT_ADDRESS
```

### 4. Configure Registry:
```javascript
await registry.addIdentity(userAddress, identity);
await compliance.addRule(ruleData);
```

## Monitoring & Analytics

### Key Metrics:
- Transaction volume and value
- Gas usage patterns
- Compliance rule triggers
- Cross-rail swap success rate
- Contract interaction frequency

### Event Monitoring:
```javascript
Events to track:
- Transfer
- Mint/Burn
- RuleViolation
- ComplianceCheck
- CrossRailSwap
```

## Common Operations

### Deploy Token:
```javascript
const token = await ethers.deployContract("MonayComplianceToken", [
  name,
  symbol,
  decimals,
  identityRegistry,
  complianceModule
]);
```

### Create Business Rule:
```javascript
await token.createBusinessRule(
  "Daily Limit",
  "SPEND_MANAGEMENT",
  priority,
  conditions,
  actions
);
```

### Transfer with Compliance:
```javascript
const attestation = await brf.preTransferCheck(user, amount, recipient);
await token.transferWithAttestation(recipient, amount, attestation);
```

## Troubleshooting

### Common Issues:

1. **Gas Estimation Failed**:
   - Check account balance
   - Verify contract state
   - Review compliance rules

2. **Transaction Reverted**:
   - Check compliance requirements
   - Verify identity registry
   - Review spend limits

3. **Bridge Timeout**:
   - Check both chain statuses
   - Verify treasury balance
   - Review event logs

### Debug Tools:
```bash
# Check network status
curl http://localhost:3001/api/blockchain/base/status

# View transaction
cast tx <txhash> --rpc-url $BASE_RPC_URL

# Call contract method
cast call <contract> "balanceOf(address)" <address> --rpc-url $BASE_RPC_URL
```

## Compliance Considerations

### Regulatory Requirements:
- KYC/AML verification before token issuance
- Transaction monitoring and reporting
- Sanctions list checking
- Geographic restrictions
- Audit trail maintenance

### Compliance Features:
- On-chain identity management
- Transfer restrictions
- Automated compliance checks
- Immutable audit logs
- Regulatory reporting tools

## Resources

### Documentation:
- [Base Documentation](https://docs.base.org/)
- [ERC-3643 Specification](https://erc3643.org/)
- [Ethers.js v6 Docs](https://docs.ethers.org/v6/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/)

### Tools:
- [Basescan Explorer](https://goerli.basescan.org/)
- [Hardhat Framework](https://hardhat.org/)
- [Foundry Toolkit](https://book.getfoundry.sh/)

## Support

For Base L2/EVM related issues:
- Internal: `blockchain-team@monay.com`
- Documentation: See `/monay-caas/CAAS_IMPLEMENTATION_SPEC.md`
- Monitoring: DataDog dashboard `base-enterprise-rail`

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2024-01 | Initial planning |
| 0.2.0 | 2024-06 | Contract drafts |
| 0.3.0 | 2024-12 | Mock endpoints |
| 1.0.0 | 2025-01 | Current version |

## Notes

⚠️ **Important**: Base L2 implementation is currently in planning phase with mock endpoints. Full EVM service implementation, smart contract deployment, and cross-rail bridge development are pending. The ERC-3643 contract exists in archives but has not been deployed or integrated with the current system.