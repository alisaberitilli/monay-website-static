#!/usr/bin/env node

import hre from 'hardhat';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('====================================');
  console.log('Local Hardhat Deployment (Testing)');
  console.log('====================================\n');

  // Start local hardhat node in memory
  console.log('📦 Deploying to local Hardhat network...\n');

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying with account:', deployer.address);

  // Deploy MonayComplianceToken
  console.log('Deploying MonayComplianceToken...');
  const MonayComplianceToken = await hre.ethers.getContractFactory('MonayComplianceToken');
  const token = await MonayComplianceToken.deploy(
    'Monay USD Test',
    'MUSD',
    18
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log('✅ Token deployed to:', tokenAddress);

  // Deploy MonayTreasury
  console.log('\nDeploying MonayTreasury...');
  const MonayTreasury = await hre.ethers.getContractFactory('MonayTreasury');
  const treasury = await MonayTreasury.deploy();
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log('✅ Treasury deployed to:', treasuryAddress);

  // Setup roles
  console.log('\n🔐 Setting up roles...');
  const MINTER_ROLE = await token.MINTER_ROLE();
  await token.grantRole(MINTER_ROLE, treasuryAddress);
  console.log('✅ Granted MINTER_ROLE to treasury');

  const BURNER_ROLE = await token.BURNER_ROLE();
  await token.grantRole(BURNER_ROLE, treasuryAddress);
  console.log('✅ Granted BURNER_ROLE to treasury');

  // Test compliance features FIRST
  console.log('\n📋 Setting up compliance...');
  
  // Set KYC data before minting
  await token.updateKYCData(
    deployer.address,
    2, // Enhanced KYC level
    true, // Verified
    0, // No expiry
    10 // Low risk score
  );
  console.log('✅ KYC data updated');
  
  // Now test minting
  console.log('\n🧪 Testing token operations...');
  await token.mint(deployer.address, hre.ethers.parseEther('1000'));
  const balance = await token.balanceOf(deployer.address);
  console.log('✅ Minted 1000 MUSD, balance:', hre.ethers.formatEther(balance));

  // Set spend limits
  await token.setSpendLimits(
    deployer.address,
    hre.ethers.parseEther('100'), // Daily
    hre.ethers.parseEther('1000'), // Monthly
    hre.ethers.parseEther('50') // Per transaction
  );
  console.log('✅ Spend limits set');

  // Create a business rule
  await token.createBusinessRule(
    'Test Rule',
    hre.ethers.id('SPEND_MANAGEMENT'),
    1, // Priority
    '0x', // Conditions (empty for test)
    '0x' // Actions (empty for test)
  );
  console.log('✅ Business rule created');

  // Save deployment info
  const deploymentInfo = {
    network: 'local-hardhat',
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      MonayComplianceToken: {
        address: tokenAddress,
        name: 'Monay USD Test',
        symbol: 'MUSD',
        decimals: 18,
        totalSupply: '1000.0'
      },
      MonayTreasury: {
        address: treasuryAddress
      }
    },
    tests: {
      minting: '✅ Success',
      kyc: '✅ Success',
      spendLimits: '✅ Success',
      businessRules: '✅ Success'
    }
  };

  console.log('\n====================================');
  console.log('Deployment Summary:');
  console.log('====================================');
  console.log(JSON.stringify(deploymentInfo, null, 2));

  const deploymentPath = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath);
  }

  const filename = `deployment-local-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentPath, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('\n✅ Local deployment successful!');
  console.log('📁 Deployment saved to:', filename);
  
  console.log('\n📝 Next Steps:');
  console.log('1. Get Base Sepolia ETH from faucets');
  console.log('2. Run: npm run contracts:deploy:testnet');
  console.log('3. Test cross-rail bridge with deployed contracts');
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });