#!/usr/bin/env node

import { ethers } from 'ethers';
import { Keypair } from '@solana/web3.js';
import * as bip39 from 'bip39';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('====================================');
console.log('Creating Deployment Wallets');
console.log('====================================\n');

// Generate mnemonic (same for both chains for simplicity)
const mnemonic = bip39.generateMnemonic();

// Create EVM wallet
const evmWallet = ethers.Wallet.fromPhrase(mnemonic);
console.log('🔷 EVM (Base Sepolia) Wallet:');
console.log('Address:', evmWallet.address);
console.log('Private Key:', evmWallet.privateKey);

// Create Solana wallet
const solanaKeypair = Keypair.generate();
console.log('\n☀️ Solana (Devnet) Wallet:');
console.log('Public Key:', solanaKeypair.publicKey.toString());
console.log('Secret Key:', Buffer.from(solanaKeypair.secretKey).toString('hex'));

// Save to .env.local file (never commit this!)
const envContent = `
# ============================================
# DEPLOYMENT WALLETS - TESTNET ONLY
# Generated: ${new Date().toISOString()}
# ============================================

# Shared mnemonic phrase (KEEP SECURE!)
DEPLOYER_MNEMONIC="${mnemonic}"

# EVM (Base Sepolia)
DEPLOYER_ADDRESS="${evmWallet.address}"
DEPLOYER_PRIVATE_KEY="${evmWallet.privateKey}"

# Solana (Devnet)
SOLANA_DEPLOYER_PUBKEY="${solanaKeypair.publicKey.toString()}"
SOLANA_DEPLOYER_SECRET="${Buffer.from(solanaKeypair.secretKey).toString('hex')}"

# Bridge Operator Keys (for cross-rail operations)
BRIDGE_OPERATOR_EVM_KEY="${evmWallet.privateKey}"
BRIDGE_OPERATOR_SOLANA_KEY="${Buffer.from(solanaKeypair.secretKey).toString('hex')}"
`;

// Save to file
const envPath = path.join(__dirname, '..', '.env.deployment');
fs.writeFileSync(envPath, envContent);

console.log('\n✅ Wallets created and saved to .env.deployment');
console.log('\n⚠️  IMPORTANT: Never commit the .env.deployment file!');

// Create funding instructions
const fundingInstructions = `
# Funding Instructions for Testnet Deployment

## Base Sepolia ETH
1. Go to: https://www.alchemy.com/faucets/base-sepolia
2. Enter address: ${evmWallet.address}
3. Request 0.1 ETH (should be enough for deployment)

Alternative faucets:
- https://faucet.quicknode.com/base/sepolia
- https://bridge.base.org/ (bridge from Sepolia)

## Solana Devnet SOL
Run this command:
\`\`\`bash
solana airdrop 2 ${solanaKeypair.publicKey.toString()} --url devnet
\`\`\`

Or use web faucet:
1. Go to: https://faucet.solana.com/
2. Enter address: ${solanaKeypair.publicKey.toString()}
3. Request 2 SOL

## Check Balances

### Base Sepolia:
https://sepolia.basescan.org/address/${evmWallet.address}

### Solana Devnet:
https://explorer.solana.com/address/${solanaKeypair.publicKey.toString()}?cluster=devnet

## Next Steps
After funding, run:
\`\`\`bash
# Deploy EVM contracts
npm run contracts:deploy:testnet

# Deploy Solana program
npm run solana:deploy
\`\`\`
`;

const instructionsPath = path.join(__dirname, '..', 'FUNDING_INSTRUCTIONS.md');
fs.writeFileSync(instructionsPath, fundingInstructions);

console.log('\n📋 Funding instructions saved to FUNDING_INSTRUCTIONS.md');
console.log('\n🎯 Next Steps:');
console.log('1. Fund the EVM wallet with Base Sepolia ETH');
console.log('2. Fund the Solana wallet with Devnet SOL');
console.log('3. Run deployment scripts');

process.exit(0);