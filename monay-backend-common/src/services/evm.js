import { ethers } from 'ethers';
import * as bip39 from 'bip39';

class EVMService {
  constructor() {
    this.provider = null;
    this.network = process.env.BASE_NETWORK || 'base-sepolia';
    this.chainId = process.env.BASE_CHAIN_ID || 84532; // Base Sepolia
    this.rpcUrl = process.env.BASE_RPC_URL || 'https://sepolia.base.org';
    this.explorerUrl = process.env.BASE_EXPLORER_URL || 'https://sepolia.basescan.org';
    this.contracts = {
      treasury: process.env.BASE_TREASURY_ADDRESS,
      complianceRegistry: process.env.BASE_COMPLIANCE_ADDRESS,
      tokenFactory: process.env.BASE_TOKEN_FACTORY_ADDRESS
    };
    this.initProvider();
  }

  initProvider() {
    try {
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl, {
        name: this.network,
        chainId: parseInt(this.chainId)
      });
      console.log(`EVM service initialized on ${this.network} (chainId: ${this.chainId})`);
    } catch (error) {
      console.error('Failed to initialize EVM provider:', error);
      this.provider = null;
    }
  }

  async getProvider() {
    if (!this.provider) {
      this.initProvider();
    }
    return this.provider;
  }

  async generateWallet() {
    try {
      const mnemonic = bip39.generateMnemonic();
      const wallet = ethers.Wallet.fromPhrase(mnemonic);
      
      return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: mnemonic,
        publicKey: wallet.publicKey
      };
    } catch (error) {
      console.error('Error generating EVM wallet:', error);
      throw error;
    }
  }

  async importWallet(privateKeyOrMnemonic) {
    try {
      let wallet;
      
      if (privateKeyOrMnemonic.includes(' ')) {
        // It's a mnemonic phrase
        wallet = ethers.Wallet.fromPhrase(privateKeyOrMnemonic);
      } else {
        // It's a private key
        wallet = new ethers.Wallet(privateKeyOrMnemonic);
      }
      
      return {
        address: wallet.address,
        publicKey: wallet.publicKey
      };
    } catch (error) {
      console.error('Error importing wallet:', error);
      throw error;
    }
  }

  async getBalance(address, tokenAddress = null) {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        throw new Error('EVM provider not available');
      }

      if (!tokenAddress) {
        // Get native token balance (ETH on Base)
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
      } else {
        // Get ERC20 token balance
        const tokenContract = new ethers.Contract(
          tokenAddress,
          [
            'function balanceOf(address) view returns (uint256)',
            'function decimals() view returns (uint8)',
            'function symbol() view returns (string)'
          ],
          provider
        );
        
        const [balance, decimals, symbol] = await Promise.all([
          tokenContract.balanceOf(address),
          tokenContract.decimals(),
          tokenContract.symbol()
        ]);
        
        return {
          balance: ethers.formatUnits(balance, decimals),
          symbol: symbol,
          raw: balance.toString()
        };
      }
    } catch (error) {
      console.error('Error getting balance:', error);
      throw error;
    }
  }

  async transfer(privateKey, toAddress, amount, tokenAddress = null) {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        throw new Error('EVM provider not available');
      }

      const wallet = new ethers.Wallet(privateKey, provider);
      
      if (!tokenAddress) {
        // Transfer native token (ETH)
        const tx = await wallet.sendTransaction({
          to: toAddress,
          value: ethers.parseEther(amount.toString())
        });
        
        const receipt = await tx.wait();
        
        return {
          success: true,
          hash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          explorer: `${this.explorerUrl}/tx/${receipt.hash}`
        };
      } else {
        // Transfer ERC20 token
        const tokenContract = new ethers.Contract(
          tokenAddress,
          [
            'function transfer(address to, uint256 amount) returns (bool)',
            'function decimals() view returns (uint8)'
          ],
          wallet
        );
        
        const decimals = await tokenContract.decimals();
        const amountInUnits = ethers.parseUnits(amount.toString(), decimals);
        
        const tx = await tokenContract.transfer(toAddress, amountInUnits);
        const receipt = await tx.wait();
        
        return {
          success: true,
          hash: receipt.hash,
          blockNumber: receipt.blockNumber,
          gasUsed: receipt.gasUsed.toString(),
          explorer: `${this.explorerUrl}/tx/${receipt.hash}`
        };
      }
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw error;
    }
  }

  async deployERC3643Token(privateKey, name, symbol, decimals, identityRegistry, compliance) {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        throw new Error('EVM provider not available');
      }

      const wallet = new ethers.Wallet(privateKey, provider);
      
      // Simplified ERC20 with compliance hooks (full ERC3643 requires more complex setup)
      const contractABI = [
        'constructor(string name, string symbol, uint8 decimals, address identityRegistry, address compliance)'
      ];
      
      const contractBytecode = '0x608060405234801561001057600080fd5b506040516200...'; // Placeholder bytecode
      
      const factory = new ethers.ContractFactory(contractABI, contractBytecode, wallet);
      const contract = await factory.deploy(name, symbol, decimals, identityRegistry, compliance);
      await contract.waitForDeployment();
      
      const address = await contract.getAddress();
      
      return {
        success: true,
        address: address,
        deploymentHash: contract.deploymentTransaction().hash,
        explorer: `${this.explorerUrl}/address/${address}`
      };
    } catch (error) {
      console.error('Error deploying ERC3643 token:', error);
      throw error;
    }
  }

  async createBusinessRule(privateKey, tokenAddress, ruleName, category, conditions, actions, priority = 0) {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        throw new Error('EVM provider not available');
      }

      const wallet = new ethers.Wallet(privateKey, provider);
      
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function createBusinessRule(string name, bytes32 category, uint256 priority, bytes conditions, bytes actions) returns (uint256)'
        ],
        wallet
      );
      
      const categoryHash = ethers.id(category);
      const tx = await tokenContract.createBusinessRule(
        ruleName,
        categoryHash,
        priority,
        ethers.toUtf8Bytes(JSON.stringify(conditions)),
        ethers.toUtf8Bytes(JSON.stringify(actions))
      );
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        explorer: `${this.explorerUrl}/tx/${receipt.hash}`
      };
    } catch (error) {
      console.error('Error creating business rule:', error);
      throw error;
    }
  }

  async setSpendLimits(privateKey, tokenAddress, userAddress, dailyLimit, monthlyLimit, transactionLimit) {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        throw new Error('EVM provider not available');
      }

      const wallet = new ethers.Wallet(privateKey, provider);
      
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function setSpendLimits(address user, uint256 daily, uint256 monthly, uint256 transaction)'
        ],
        wallet
      );
      
      const tx = await tokenContract.setSpendLimits(
        userAddress,
        ethers.parseEther(dailyLimit.toString()),
        ethers.parseEther(monthlyLimit.toString()),
        ethers.parseEther(transactionLimit.toString())
      );
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        explorer: `${this.explorerUrl}/tx/${receipt.hash}`
      };
    } catch (error) {
      console.error('Error setting spend limits:', error);
      throw error;
    }
  }

  async updateKYCData(privateKey, tokenAddress, userAddress, kycLevel, isVerified, expiresAt, riskScore) {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        throw new Error('EVM provider not available');
      }

      const wallet = new ethers.Wallet(privateKey, provider);
      
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function updateKYCData(address user, uint8 level, bool verified, uint256 expires, uint8 risk)'
        ],
        wallet
      );
      
      const tx = await tokenContract.updateKYCData(
        userAddress,
        kycLevel,
        isVerified,
        expiresAt || 0,
        riskScore
      );
      
      const receipt = await tx.wait();
      
      return {
        success: true,
        hash: receipt.hash,
        blockNumber: receipt.blockNumber,
        explorer: `${this.explorerUrl}/tx/${receipt.hash}`
      };
    } catch (error) {
      console.error('Error updating KYC data:', error);
      throw error;
    }
  }

  async getTransactionHistory(address, limit = 10) {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        throw new Error('EVM provider not available');
      }

      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 10000); // Last ~10000 blocks
      
      // Get incoming transactions
      const incomingFilter = {
        to: address,
        fromBlock: fromBlock,
        toBlock: 'latest'
      };
      
      // Get outgoing transactions
      const outgoingFilter = {
        from: address,
        fromBlock: fromBlock,
        toBlock: 'latest'
      };
      
      // Note: getLogs requires indexed parameters, using a simplified approach
      const history = await provider.getHistory(address);
      
      const transactions = history.slice(0, limit).map(tx => ({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value || 0),
        blockNumber: tx.blockNumber,
        timestamp: tx.timestamp,
        gasUsed: tx.gasUsed?.toString(),
        status: tx.status === 1 ? 'success' : 'failed',
        explorer: `${this.explorerUrl}/tx/${tx.hash}`
      }));
      
      return transactions;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }

  async estimateGas(from, to, amount, tokenAddress = null) {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        throw new Error('EVM provider not available');
      }

      let gasEstimate;
      
      if (!tokenAddress) {
        // Estimate gas for native token transfer
        gasEstimate = await provider.estimateGas({
          from: from,
          to: to,
          value: ethers.parseEther(amount.toString())
        });
      } else {
        // Estimate gas for ERC20 transfer
        const tokenContract = new ethers.Contract(
          tokenAddress,
          ['function transfer(address to, uint256 amount)'],
          provider
        );
        
        const decimals = 18; // Default decimals
        const amountInUnits = ethers.parseUnits(amount.toString(), decimals);
        
        gasEstimate = await tokenContract.transfer.estimateGas(to, amountInUnits, { from });
      }
      
      const gasPrice = await provider.getFeeData();
      
      return {
        gasLimit: gasEstimate.toString(),
        gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'),
        maxFeePerGas: ethers.formatUnits(gasPrice.maxFeePerGas || 0, 'gwei'),
        maxPriorityFeePerGas: ethers.formatUnits(gasPrice.maxPriorityFeePerGas || 0, 'gwei'),
        estimatedCost: ethers.formatEther(gasEstimate * (gasPrice.gasPrice || 0n))
      };
    } catch (error) {
      console.error('Error estimating gas:', error);
      throw error;
    }
  }

  async validateAddress(address) {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }

  async getBlockNumber() {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        throw new Error('EVM provider not available');
      }
      
      return await provider.getBlockNumber();
    } catch (error) {
      console.error('Error getting block number:', error);
      throw error;
    }
  }

  async getNetworkStatus() {
    try {
      const provider = await this.getProvider();
      if (!provider) {
        throw new Error('EVM provider not available');
      }
      
      const [network, blockNumber, gasPrice] = await Promise.all([
        provider.getNetwork(),
        provider.getBlockNumber(),
        provider.getFeeData()
      ]);
      
      return {
        name: network.name,
        chainId: Number(network.chainId),
        blockNumber: blockNumber,
        gasPrice: ethers.formatUnits(gasPrice.gasPrice || 0, 'gwei'),
        maxFeePerGas: ethers.formatUnits(gasPrice.maxFeePerGas || 0, 'gwei'),
        isConnected: true
      };
    } catch (error) {
      console.error('Error getting network status:', error);
      return {
        isConnected: false,
        error: error.message
      };
    }
  }
}

export default new EVMService();