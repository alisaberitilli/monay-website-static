
# Funding Instructions for Testnet Deployment

## Base Sepolia ETH
1. Go to: https://www.alchemy.com/faucets/base-sepolia
2. Enter address: 0xd6f48D6b7eFCCb07720Ae36ce86e30C00f032F2E
3. Request 0.1 ETH (should be enough for deployment)

Alternative faucets:
- https://faucet.quicknode.com/base/sepolia
- https://bridge.base.org/ (bridge from Sepolia)

## Solana Devnet SOL
Run this command:
```bash
solana airdrop 2 7S4UvsUysXZcJMi4X2ctHi38EUqscHG9diuHdjFZ4zxX --url devnet
```

Or use web faucet:
1. Go to: https://faucet.solana.com/
2. Enter address: 7S4UvsUysXZcJMi4X2ctHi38EUqscHG9diuHdjFZ4zxX
3. Request 2 SOL

## Check Balances

### Base Sepolia:
https://sepolia.basescan.org/address/0xd6f48D6b7eFCCb07720Ae36ce86e30C00f032F2E

### Solana Devnet:
https://explorer.solana.com/address/7S4UvsUysXZcJMi4X2ctHi38EUqscHG9diuHdjFZ4zxX?cluster=devnet

## Next Steps
After funding, run:
```bash
# Deploy EVM contracts
npm run contracts:deploy:testnet

# Deploy Solana program
npm run solana:deploy
```
