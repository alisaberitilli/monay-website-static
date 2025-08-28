# Solana Integration Documentation
## Monay Consumer Rail Implementation

## Overview
Solana serves as the **Consumer Rail** in Monay's dual-rail blockchain architecture, optimized for high-speed, low-cost consumer transactions. This document outlines the current implementation status, architecture, and roadmap for Solana integration.

## Architecture Role
- **Purpose**: Consumer-facing payment rail for ultra-fast, low-cost transactions
- **Target Performance**: 10,000 TPS with sub-1 second confirmations
- **Network**: Currently on Devnet, targeting Mainnet-Beta for production
- **Integration**: Cross-rail bridge to Base L2 (Enterprise Rail) via treasury swap model

## Current Implementation

### 1. Core Service Layer
**Location**: `/monay-backend-common/src/services/solana.js`

#### Features Implemented:
- **Wallet Management**
  - BIP39 mnemonic generation
  - HD wallet derivation (m/44'/501'/0'/0')
  - Ed25519 keypair generation
  - Address validation

- **Transaction Operations**
  - Native SOL transfers
  - SPL token transfers
  - Balance queries (SOL and SPL tokens)
  - Transaction history retrieval
  - Fee estimation

- **Token Support**
  - SPL token standard
  - Token account creation
  - Associated token account management
  - Token balance tracking

#### Technical Stack:
```javascript
Dependencies:
- @solana/web3.js: ^1.98.4
- @solana/spl-token: ^0.4.13
- bip39: ^3.1.0
- tweetnacl: ^1.0.3
- ed25519-hd-key: For HD wallet derivation
```

### 2. API Endpoints
**Location**: `/monay-backend-common/src/routes/solana.js`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/solana/generate-wallet` | POST | Generate new Solana wallet |
| `/api/solana/balance/:address` | GET | Get SOL balance |
| `/api/solana/token-balance/:address/:mint` | GET | Get SPL token balance |
| `/api/solana/transfer-sol` | POST | Transfer native SOL |
| `/api/solana/transfer-token` | POST | Transfer SPL tokens |
| `/api/solana/transactions/:address` | GET | Get transaction history |
| `/api/solana/validate-address` | POST | Validate Solana address |
| `/api/solana/estimate-fee` | GET | Estimate transaction fee |

### 3. Solana Program (Smart Contract)
**Location**: `/old/archive/monay-wallet-web-react-admin/monay-backend-next/solana/spend-management-program.rs`

#### Anchor Program Features:
- **Program ID**: `MonaySpendMgmt11111111111111111111111111111`
- **Business Rule Enforcement**
  - Rule creation and management
  - User-rule assignments
  - Priority-based rule execution
- **Spend Management**
  - Daily/monthly/per-transaction limits
  - Real-time spend tracking
  - Automatic limit resets
- **KYC/Compliance Integration**
  - KYC level management (Basic, Enhanced, Premium)
  - Risk scoring (0-100)
  - Verification tracking
- **Token-2022 Extensions** (Planned)
  - Transfer hooks for compliance
  - Metadata extensions
  - Interest-bearing tokens
  - Confidential transfers

### 4. Network Configuration

#### Current Settings:
```javascript
{
  network: 'devnet',
  rpcUrl: 'https://api.devnet.solana.com',
  chainType: 'Consumer Rail',
  confirmation: 'confirmed'
}
```

#### Environment Variables:
- `SOLANA_NETWORK`: Network selection (devnet/testnet/mainnet-beta)
- `SOLANA_RPC_URL`: Custom RPC endpoint
- `SOLANA_PROGRAM_ID`: Deployed program address

## Database Schema Integration

### Supported Tables:
- **crypto_wallets**: Solana address storage
- **crypto_transactions**: Transaction records
- **crypto_assets**: SPL token definitions
- **crypto_wallet_config**: Multi-sig and security settings
- **business_rules**: On-chain rule references

### Key Fields:
```sql
- blockchain_type: 'solana'
- address_format: Base58 encoded
- transaction_hash: Signature format
- block_number: Slot number
- gas_fee: Lamports (0.000000001 SOL)
```

## Cross-Rail Integration

### Treasury Swap Model:
1. **Initiation**: User requests cross-rail transfer
2. **Validation**: BRF compliance check
3. **Lock**: Assets locked on source rail
4. **Mint/Burn**: Corresponding action on destination
5. **Settlement**: Treasury reconciliation
6. **Confirmation**: User notification

### Bridge Endpoints:
- `/api/blockchain/bridge/status`: Bridge operational status
- `/api/xrail/swap`: Initiate cross-rail transfer
- `/api/xrail/status/:correlationId`: Track transfer status

## Security Implementation

### Current Measures:
- JWT authentication on all endpoints
- Private key handling in memory only
- Address validation before operations
- Rate limiting on transaction endpoints

### Production Requirements:
- [ ] HSM integration for key management
- [ ] Multi-signature wallet support
- [ ] Hardware wallet integration
- [ ] Cold storage implementation
- [ ] Audit trail logging

## Performance Metrics

### Current Capabilities:
- **Transaction Speed**: ~400ms confirmation (devnet)
- **Throughput**: Limited by RPC rate limits
- **Cost**: ~0.000005 SOL per transaction

### Production Targets:
- **Speed**: <1 second confirmation
- **Throughput**: 10,000 TPS capability
- **Cost**: <$0.001 per transaction
- **Availability**: 99.95% uptime

## Token Standards

### SPL Token Support:
- Standard SPL tokens
- Associated token accounts
- Metadata program integration

### Token-2022 Extensions (Planned):
- **Transfer Hooks**: Compliance checks
- **Permanent Delegate**: Treasury control
- **Transfer Fees**: Platform revenue
- **Interest-Bearing**: Yield generation
- **Confidential Transfers**: Privacy features

## Development Roadmap

### Phase 1: Foundation (Completed)
- ✅ Basic Solana service implementation
- ✅ Wallet generation and management
- ✅ SOL and SPL token transfers
- ✅ API endpoint structure

### Phase 2: Program Deployment (In Progress)
- [ ] Deploy Anchor program to devnet
- [ ] Integration testing
- [ ] Program verification
- [ ] IDL generation and publication

### Phase 3: Token-2022 Integration
- [ ] Implement Token-2022 extensions
- [ ] Transfer hook adapters
- [ ] Metadata extensions
- [ ] Compliance rule integration

### Phase 4: Cross-Rail Bridge
- [ ] Implement treasury swap logic
- [ ] Atomic swap guarantees
- [ ] Settlement reconciliation
- [ ] Event monitoring

### Phase 5: Production Readiness
- [ ] Mainnet deployment
- [ ] Performance optimization
- [ ] Security audit
- [ ] Monitoring and alerting

## Testing Strategy

### Unit Tests:
```bash
npm test src/services/solana.test.js
npm test src/routes/solana.test.js
```

### Integration Tests:
```bash
npm run test:solana:integration
```

### Load Testing:
```bash
npm run test:solana:load
```

## Monitoring & Observability

### Key Metrics:
- Transaction success rate
- Average confirmation time
- RPC endpoint availability
- Program execution errors
- Cross-rail transfer completion

### Logging:
- Transaction signatures
- Error traces
- Performance metrics
- Compliance events

## Common Operations

### Generate Wallet:
```javascript
const wallet = await solanaService.generateWallet();
// Returns: { publicKey, secretKey, mnemonic }
```

### Transfer SOL:
```javascript
const result = await solanaService.transferSOL(
  secretKey,
  recipientAddress,
  amount
);
// Returns: { success, signature, explorer }
```

### Check Balance:
```javascript
const balance = await solanaService.getBalance(address);
// Returns: Balance in SOL
```

## Troubleshooting

### Common Issues:
1. **RPC Rate Limits**: Implement retry logic
2. **Transaction Failures**: Check account balance and fees
3. **Program Errors**: Review program logs
4. **Network Congestion**: Adjust priority fees

### Debug Commands:
```bash
# Check Solana status
curl http://localhost:3001/api/blockchain/solana/status

# Test wallet generation
curl -X POST http://localhost:3001/api/solana/generate-wallet

# View recent transactions
solana confirm -v <signature>
```

## Resources

### Documentation:
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [Token-2022 Program Guide](https://spl.solana.com/token-2022)
- [Anchor Framework](https://www.anchor-lang.com/)

### Tools:
- [Solana Explorer](https://explorer.solana.com/)
- [Phantom Wallet](https://phantom.app/)
- [Solana CLI](https://docs.solana.com/cli)

## Support

For Solana-related issues:
- Internal: `blockchain-team@monay.com`
- Documentation: See `/monay-caas/CAAS_IMPLEMENTATION_SPEC.md`
- Monitoring: DataDog dashboard `solana-consumer-rail`

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01 | Initial implementation |
| 1.1.0 | 2024-06 | SPL token support |
| 1.2.0 | 2024-12 | Anchor program draft |
| 2.0.0 | 2025-01 | Current version |