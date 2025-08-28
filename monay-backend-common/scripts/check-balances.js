#!/usr/bin/env node

import { ethers } from 'ethers';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load deployment env
const deploymentEnvPath = path.join(__dirname, '..', '.env.deployment');
if (fs.existsSync(deploymentEnvPath)) {
  dotenv.config({ path: deploymentEnvPath });
}

console.log('====================================');
console.log('Checking Deployment Wallet Balances');
console.log('====================================\n');

async function checkBaseSepoliaBalance() {
  console.log('🔷 Base Sepolia:');
  console.log('Address:', process.env.DEPLOYER_ADDRESS);
  
  try {
    const provider = new ethers.JsonRpcProvider('https://sepolia.base.org');
    const balance = await provider.getBalance(process.env.DEPLOYER_ADDRESS);
    const balanceInEth = ethers.formatEther(balance);
    
    console.log('Balance:', balanceInEth, 'ETH');
    
    if (parseFloat(balanceInEth) === 0) {
      console.log('❌ No balance! Fund this address:');
      console.log('   https://www.alchemy.com/faucets/base-sepolia');
      console.log('   https://faucet.quicknode.com/base/sepolia');
      return false;
    } else {
      console.log('✅ Sufficient balance for deployment');
      return true;
    }
  } catch (error) {
    console.error('Error checking Base balance:', error.message);
    return false;
  }
}

async function checkSolanaBalance() {
  console.log('\n☀️ Solana Devnet:');
  console.log('Address:', process.env.SOLANA_DEPLOYER_PUBKEY);
  
  try {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const publicKey = new PublicKey(process.env.SOLANA_DEPLOYER_PUBKEY);
    const balance = await connection.getBalance(publicKey);
    const balanceInSol = balance / LAMPORTS_PER_SOL;
    
    console.log('Balance:', balanceInSol, 'SOL');
    
    if (balanceInSol === 0) {
      console.log('❌ No balance! Run:');
      console.log(`   solana airdrop 2 ${process.env.SOLANA_DEPLOYER_PUBKEY} --url devnet`);
      return false;
    } else if (balanceInSol < 1) {
      console.log('⚠️ Low balance, consider getting more SOL');
      return true;
    } else {
      console.log('✅ Sufficient balance for deployment');
      return true;
    }
  } catch (error) {
    console.error('Error checking Solana balance:', error.message);
    return false;
  }
}

async function main() {
  const baseReady = await checkBaseSepoliaBalance();
  const solanaReady = await checkSolanaBalance();
  
  console.log('\n====================================');
  console.log('Deployment Readiness:');
  console.log('====================================');
  
  if (baseReady && solanaReady) {
    console.log('✅ Both chains are funded and ready for deployment!');
    console.log('\nNext steps:');
    console.log('1. Deploy EVM contracts: npm run contracts:deploy:testnet');
    console.log('2. Deploy Solana program: npm run solana:deploy');
  } else {
    if (!baseReady) {
      console.log('❌ Base Sepolia needs funding');
    }
    if (!solanaReady) {
      console.log('❌ Solana Devnet needs funding');
    }
    console.log('\n📋 See FUNDING_INSTRUCTIONS.md for details');
  }
  
  process.exit(0);
}

main().catch(console.error);