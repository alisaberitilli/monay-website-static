# Blockchain Implementation Guide
## Monay Dual-Rail Architecture

## Overview
This document provides instructions for deploying and using the Monay dual-rail blockchain architecture with Base L2 (Enterprise Rail) and Solana (Consumer Rail).

## Quick Start

### Prerequisites
- Node.js v20+
- npm or yarn
- Solana CLI tools (optional)
- MetaMask or similar wallet

### Installation

1. **Install dependencies:**
```bash
cd monay-backend-common
npm install

# Install Hardhat dependencies
npm install --save-dev @nomicfoundation/hardhat-toolbox hardhat
```

2. **Configure environment:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Test blockchain connections:**
```bash
npm run blockchain:test
```

## Base L2 (Enterprise Rail)

### Deploy Smart Contracts

1. **Compile contracts:**
```bash
npm run contracts:compile
```

2. **Deploy to testnet:**
```bash
npm run contracts:deploy:testnet
```

3. **Verify contracts on Basescan:**
```bash
npx hardhat verify --network base-goerli <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

### Using EVM Service

```javascript
// Generate wallet
const wallet = await evmService.generateWallet();

// Check balance
const balance = await evmService.getBalance(address);

// Transfer tokens
const result = await evmService.transfer(
  privateKey,
  toAddress,
  amount,
  tokenAddress // optional, for ERC20
);

// Deploy compliance token
const token = await evmService.deployERC3643Token(
  privateKey,
  'Token Name',
  'SYMBOL',
  18,
  identityRegistry,
  compliance
);
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/evm/generate-wallet` | POST | Generate new wallet |
| `/api/evm/balance/:address` | GET | Get balance |
| `/api/evm/transfer` | POST | Transfer tokens |
| `/api/evm/deploy-token` | POST | Deploy compliance token |
| `/api/evm/business-rule` | POST | Create business rule |
| `/api/evm/spend-limits` | POST | Set spend limits |
| `/api/evm/kyc-data` | POST | Update KYC data |
| `/api/evm/network-status` | GET | Get network status |

## Solana (Consumer Rail)

### Deploy Anchor Program

1. **Install Anchor CLI:**
```bash
cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked
```

2. **Build program:**
```bash
npm run solana:build
```

3. **Deploy to devnet:**
```bash
npm run solana:deploy
```

4. **Run tests:**
```bash
npm run solana:test
```

### Using Solana Service

```javascript
// Generate wallet
const wallet = await solanaService.generateWallet();

// Check balance
const balance = await solanaService.getBalance(address);

// Transfer SOL
const result = await solanaService.transferSOL(
  secretKey,
  toAddress,
  amount
);

// Transfer SPL tokens
const result = await solanaService.transferToken(
  secretKey,
  toAddress,
  tokenMintAddress,
  amount,
  decimals
);
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/solana/generate-wallet` | POST | Generate new wallet |
| `/api/solana/balance/:address` | GET | Get SOL balance |
| `/api/solana/token-balance/:address/:mint` | GET | Get token balance |
| `/api/solana/transfer-sol` | POST | Transfer SOL |
| `/api/solana/transfer-token` | POST | Transfer SPL token |
| `/api/solana/transactions/:address` | GET | Get transaction history |
| `/api/solana/validate-address` | POST | Validate address |

## Cross-Rail Bridge

### Initiate Swaps

**EVM to Solana:**
```javascript
const swap = await crossRailBridge.initiateEVMToSolanaSwap({
  userPrivateKey: '0x...',
  tokenAddress: '0x...',
  amount: 100,
  solanaRecipient: '11111...',
  userId: 'user_123'
});
```

**Solana to EVM:**
```javascript
const swap = await crossRailBridge.initiateSolanaToEVMSwap({
  userSecretKey: '...',
  tokenMintAddress: '11111...',
  amount: 100,
  evmRecipient: '0x...',
  userId: 'user_123'
});
```

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/bridge/swap/evm-to-solana` | POST | Initiate EVM→Solana swap |
| `/api/bridge/swap/solana-to-evm` | POST | Initiate Solana→EVM swap |
| `/api/bridge/swap/status/:swapId` | GET | Get swap status |
| `/api/bridge/swaps/user/:userId` | GET | Get user swaps |
| `/api/bridge/stats` | GET | Get bridge statistics |
| `/api/bridge/config` | GET | Get bridge configuration |

## Testing

### Run All Tests
```bash
npm test
```

### Test Specific Components
```bash
# Test blockchain connections
npm run blockchain:test

# Test wallet services
npm run wallet:test

# Test bridge
npm run bridge:test
```

### Manual Testing with cURL

**Generate EVM Wallet:**
```bash
curl -X POST http://localhost:3001/api/evm/generate-wallet \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Check Solana Balance:**
```bash
curl http://localhost:3001/api/solana/balance/11111111111111111111111111111111 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Initiate Cross-Rail Swap:**
```bash
curl -X POST http://localhost:3001/api/bridge/swap/evm-to-solana \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userPrivateKey": "0x...",
    "tokenAddress": "0x...",
    "amount": 100,
    "solanaRecipient": "11111..."
  }'
```

## Security Considerations

### Private Key Management
- **Never** commit private keys to version control
- Use environment variables for sensitive data
- In production, use HSM or secure key management service
- Rotate keys regularly

### Smart Contract Security
- All contracts should be audited before mainnet deployment
- Use multi-signature wallets for admin functions
- Implement time locks for critical operations
- Enable emergency pause mechanisms

### API Security
- All endpoints require JWT authentication
- Implement rate limiting
- Use HTTPS in production
- Validate all inputs
- Log all transactions

## Monitoring

### Health Checks
```bash
# Check blockchain health
curl http://localhost:3001/api/blockchain/health

# Check bridge status
curl http://localhost:3001/api/bridge/health

# Check individual chain status
curl http://localhost:3001/api/blockchain/base/status
curl http://localhost:3001/api/blockchain/solana/status
```

### Metrics to Monitor
- Transaction success rate
- Average confirmation time
- Gas prices and fees
- Bridge swap completion rate
- Wallet creation rate
- Error rates by endpoint

## Troubleshooting

### Common Issues

1. **Connection Failed:**
   - Check RPC URLs in .env
   - Verify network status
   - Check firewall settings

2. **Transaction Failed:**
   - Check wallet balance
   - Verify gas settings
   - Check contract state

3. **Bridge Timeout:**
   - Check both chains status
   - Verify treasury balance
   - Review transaction logs

4. **Deployment Failed:**
   - Check deployer balance
   - Verify contract compilation
   - Check network configuration

### Debug Commands
```bash
# Check logs
tail -f logs/*.log

# Test RPC connection
curl https://goerli.base.org \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Check Solana cluster
solana cluster-list
```

## Production Deployment

### Checklist
- [ ] Update all RPC URLs to mainnet
- [ ] Configure production private keys
- [ ] Deploy and verify smart contracts
- [ ] Deploy Solana program to mainnet
- [ ] Configure monitoring and alerts
- [ ] Set up backup RPC providers
- [ ] Enable rate limiting
- [ ] Configure CORS properly
- [ ] Set up SSL certificates
- [ ] Implement key rotation
- [ ] Complete security audit
- [ ] Set up incident response plan

### Environment Variables (Production)
```env
NODE_ENV=production
SOLANA_NETWORK=mainnet-beta
SOLANA_RPC_URL=https://your-dedicated-rpc.com
BASE_NETWORK=base-mainnet
BASE_RPC_URL=https://your-dedicated-base-rpc.com
# Use HSM or KMS for keys in production
```

## Support

- Documentation: See `/SOLANA.md` and `/BASEL2.md`
- Issues: `blockchain-team@monay.com`
- Emergency: Follow incident response procedure

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2025-01 | Initial implementation |

## License
PROPRIETARY - Monay Inc.