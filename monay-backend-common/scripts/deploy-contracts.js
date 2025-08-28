const hre = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Starting contract deployment...\n');

  // Get the deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', hre.ethers.formatEther(balance), 'ETH\n');

  // Deploy MonayComplianceToken
  console.log('Deploying MonayComplianceToken...');
  const MonayComplianceToken = await hre.ethers.getContractFactory('MonayComplianceToken');
  const token = await MonayComplianceToken.deploy(
    'Monay USD',     // name
    'MUSD',          // symbol
    18               // decimals
  );
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log('MonayComplianceToken deployed to:', tokenAddress);

  // Deploy MonayTreasury
  console.log('\nDeploying MonayTreasury...');
  const MonayTreasury = await hre.ethers.getContractFactory('MonayTreasury');
  const treasury = await MonayTreasury.deploy();
  await treasury.waitForDeployment();
  const treasuryAddress = await treasury.getAddress();
  console.log('MonayTreasury deployed to:', treasuryAddress);

  // Grant roles
  console.log('\nSetting up roles...');
  
  // Grant MINTER_ROLE to treasury
  const MINTER_ROLE = await token.MINTER_ROLE();
  await token.grantRole(MINTER_ROLE, treasuryAddress);
  console.log('Granted MINTER_ROLE to treasury');

  // Grant BURNER_ROLE to treasury
  const BURNER_ROLE = await token.BURNER_ROLE();
  await token.grantRole(BURNER_ROLE, treasuryAddress);
  console.log('Granted BURNER_ROLE to treasury');

  // Save deployment addresses
  const deploymentInfo = {
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      MonayComplianceToken: {
        address: tokenAddress,
        name: 'Monay USD',
        symbol: 'MUSD',
        decimals: 18
      },
      MonayTreasury: {
        address: treasuryAddress
      }
    }
  };

  const deploymentPath = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath);
  }

  const filename = `deployment-${hre.network.name}-${Date.now()}.json`;
  fs.writeFileSync(
    path.join(deploymentPath, filename),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log('\nDeployment info saved to:', filename);

  // Verify contracts on Basescan if not on localhost
  if (hre.network.name !== 'hardhat' && hre.network.name !== 'localhost') {
    console.log('\nWaiting for Basescan to index contracts...');
    await new Promise(resolve => setTimeout(resolve, 60000)); // Wait 60 seconds

    console.log('Verifying MonayComplianceToken...');
    try {
      await hre.run('verify:verify', {
        address: tokenAddress,
        constructorArguments: ['Monay USD', 'MUSD', 18]
      });
      console.log('MonayComplianceToken verified');
    } catch (error) {
      console.error('Error verifying MonayComplianceToken:', error.message);
    }

    console.log('Verifying MonayTreasury...');
    try {
      await hre.run('verify:verify', {
        address: treasuryAddress,
        constructorArguments: []
      });
      console.log('MonayTreasury verified');
    } catch (error) {
      console.error('Error verifying MonayTreasury:', error.message);
    }
  }

  console.log('\n✅ Deployment complete!');
  console.log('Token Address:', tokenAddress);
  console.log('Treasury Address:', treasuryAddress);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });