#!/usr/bin/env node

import { Connection, Keypair, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load deployment env
const deploymentEnvPath = path.join(__dirname, '..', '.env.deployment');
if (existsSync(deploymentEnvPath)) {
  dotenv.config({ path: deploymentEnvPath });
}

console.log('====================================');
console.log('Solana Program Deployment');
console.log('====================================\n');

async function deploySolanaProgram() {
  try {
    // Connect to devnet
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    
    // Create keypair from secret key
    const secretKeyHex = process.env.SOLANA_DEPLOYER_SECRET;
    const secretKey = Buffer.from(secretKeyHex, 'hex');
    const deployerKeypair = Keypair.fromSecretKey(secretKey);
    
    console.log('🔑 Deployer:', deployerKeypair.publicKey.toString());
    
    // Check balance
    const balance = await connection.getBalance(deployerKeypair.publicKey);
    const balanceInSol = balance / LAMPORTS_PER_SOL;
    console.log('💰 Balance:', balanceInSol, 'SOL');
    
    if (balanceInSol < 0.5) {
      console.log('❌ Insufficient balance for deployment');
      console.log('   Run: solana airdrop 2', deployerKeypair.publicKey.toString());
      return;
    }
    
    // Note: Actual Anchor deployment requires Anchor CLI and Rust setup
    console.log('\n📦 Deployment Process:');
    console.log('Since Anchor requires Rust and CLI setup, here are the steps:');
    console.log('\n1. Install Anchor CLI:');
    console.log('   curl -sSfL https://release.anza.xyz/stable/install | sh');
    console.log('   cargo install --git https://github.com/coral-xyz/anchor anchor-cli --locked');
    
    console.log('\n2. Set up Solana keypair:');
    console.log('   Create file ~/.config/solana/deployer.json with this content:');
    console.log('   [' + Array.from(secretKey).join(',') + ']');
    
    console.log('\n3. Configure Solana CLI:');
    console.log('   solana config set --url devnet');
    console.log('   solana config set --keypair ~/.config/solana/deployer.json');
    
    console.log('\n4. Deploy the program:');
    console.log('   cd solana-programs');
    console.log('   anchor build');
    console.log('   anchor deploy');
    
    // For now, we'll create a mock deployment
    const programId = 'MonaySpendMgmt' + deployerKeypair.publicKey.toString().substring(0, 20);
    
    console.log('\n✅ Mock Program ID for testing:');
    console.log('   ', programId);
    
    // Update the deployment info
    const deploymentInfo = {
      network: 'devnet',
      deployedAt: new Date().toISOString(),
      deployer: deployerKeypair.publicKey.toString(),
      programId: programId,
      balance: balanceInSol,
      explorerUrl: `https://explorer.solana.com/address/${deployerKeypair.publicKey.toString()}?cluster=devnet`
    };
    
    console.log('\n📊 Deployment Summary:');
    console.log(JSON.stringify(deploymentInfo, null, 2));
    
    console.log('\n✅ Solana wallet is funded and ready!');
    console.log('   Follow the Anchor CLI steps above to deploy the actual program.');
    
    return deploymentInfo;
  } catch (error) {
    console.error('❌ Deployment error:', error.message);
    throw error;
  }
}

// Test transaction function
async function testSolanaTransaction() {
  console.log('\n🧪 Testing Solana Transaction...');
  
  try {
    const connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    const secretKeyHex = process.env.SOLANA_DEPLOYER_SECRET;
    const secretKey = Buffer.from(secretKeyHex, 'hex');
    const keypair = Keypair.fromSecretKey(secretKey);
    
    // Get latest blockhash
    const { blockhash } = await connection.getLatestBlockhash();
    console.log('   Latest blockhash:', blockhash.substring(0, 20) + '...');
    
    // Check if we can simulate a transaction
    const slot = await connection.getSlot();
    console.log('   Current slot:', slot);
    
    console.log('✅ Solana connection verified and working!');
    
  } catch (error) {
    console.error('❌ Test transaction failed:', error.message);
  }
}

async function main() {
  await deploySolanaProgram();
  await testSolanaTransaction();
  process.exit(0);
}

main().catch(console.error);