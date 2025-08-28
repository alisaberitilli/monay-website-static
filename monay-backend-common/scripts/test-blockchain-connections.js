#!/usr/bin/env node

import solanaService from '../src/services/solana.js';
import evmService from '../src/services/evm.js';
import crossRailBridge from '../src/services/crossRailBridge.js';

async function testSolanaConnection() {
  console.log('\n🔗 Testing Solana Connection...');
  try {
    const connection = await solanaService.getConnection();
    if (connection) {
      const slot = await connection.getSlot();
      console.log('✅ Solana connected successfully');
      console.log(`   Network: ${process.env.SOLANA_NETWORK || 'devnet'}`);
      console.log(`   Current slot: ${slot}`);
      
      // Test wallet generation
      const wallet = await solanaService.generateWallet();
      console.log('✅ Wallet generation successful');
      console.log(`   Sample address: ${wallet.publicKey}`);
    } else {
      console.log('❌ Failed to connect to Solana');
    }
  } catch (error) {
    console.log('❌ Solana connection error:', error.message);
  }
}

async function testEVMConnection() {
  console.log('\n🔗 Testing Base L2 (EVM) Connection...');
  try {
    const status = await evmService.getNetworkStatus();
    if (status.isConnected) {
      console.log('✅ Base L2 connected successfully');
      console.log(`   Network: ${status.name || process.env.BASE_NETWORK}`);
      console.log(`   Chain ID: ${status.chainId}`);
      console.log(`   Current block: ${status.blockNumber}`);
      console.log(`   Gas price: ${status.gasPrice} gwei`);
      
      // Test wallet generation
      const wallet = await evmService.generateWallet();
      console.log('✅ Wallet generation successful');
      console.log(`   Sample address: ${wallet.address}`);
    } else {
      console.log('❌ Failed to connect to Base L2');
      console.log(`   Error: ${status.error}`);
    }
  } catch (error) {
    console.log('❌ Base L2 connection error:', error.message);
  }
}

async function testCrossRailBridge() {
  console.log('\n🌉 Testing Cross-Rail Bridge...');
  try {
    const stats = crossRailBridge.getBridgeStats();
    console.log('✅ Bridge service operational');
    console.log(`   Total swaps: ${stats.totalSwaps}`);
    console.log(`   Pending swaps: ${stats.pendingSwaps}`);
    console.log(`   Completed swaps: ${stats.completedSwaps}`);
    
    // Test swap validation
    const isValid = crossRailBridge.validateSwapParams('base', 'solana', 1);
    console.log('✅ Swap validation working');
  } catch (error) {
    console.log('❌ Bridge service error:', error.message);
  }
}

async function main() {
  console.log('====================================');
  console.log('Monay Blockchain Connection Tests');
  console.log('====================================');
  
  await testSolanaConnection();
  await testEVMConnection();
  await testCrossRailBridge();
  
  console.log('\n====================================');
  console.log('Test Complete');
  console.log('====================================\n');
  
  process.exit(0);
}

// Run tests
main().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});