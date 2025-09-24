/**
 * Blockchain Integration Service for Invoice-First Wallets
 * Manages real connections to Base L2 and Solana networks
 *
 * @module BlockchainIntegration
 */

import { ethers } from 'ethers';
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import logger from '../logger';
import auditLogger from './AuditLogger';

class BlockchainIntegration {
  constructor() {
    this.initialized = false;
    this.baseNetwork = null;
    this.solanaNetwork = null;
  }

  /**
   * Initialize network connections
   */
  async initializeNetworks() {
    // Initialize Base L2 (EVM) connection
    this.initializeBaseL2();

    // Initialize Solana connection
    this.initializeSolana();
  }

  /**
   * Initialize Base L2 connection
   */
  initializeBaseL2() {
    try {
      // Network selection based on environment
      const network = process.env.NODE_ENV === 'production'
        ? 'base-mainnet'
        : 'base-sepolia';

      const rpcUrls = {
        'base-mainnet': 'https://mainnet.base.org',
        'base-sepolia': 'https://sepolia.base.org',
        'base-goerli': 'https://goerli.base.org' // Deprecated but kept for compatibility
      };

      const chainIds = {
        'base-mainnet': 8453,
        'base-sepolia': 84532,
        'base-goerli': 84531
      };

      this.baseNetwork = {
        name: network,
        chainId: chainIds[network],
        rpcUrl: process.env.BASE_RPC_URL || rpcUrls[network],
        provider: new ethers.JsonRpcProvider(
          process.env.BASE_RPC_URL || rpcUrls[network],
          {
            name: network,
            chainId: chainIds[network]
          }
        )
      };

      logger.info(`Base L2 connection initialized: ${network}`);
    } catch (error) {
      logger.error('Failed to initialize Base L2:', error);
      throw error;
    }
  }

  /**
   * Initialize Solana connection
   */
  initializeSolana() {
    try {
      // Network selection based on environment
      const cluster = process.env.NODE_ENV === 'production'
        ? 'mainnet-beta'
        : 'devnet';

      const rpcUrls = {
        'mainnet-beta': 'https://api.mainnet-beta.solana.com',
        'devnet': 'https://api.devnet.solana.com',
        'testnet': 'https://api.testnet.solana.com'
      };

      this.solanaNetwork = {
        cluster,
        rpcUrl: process.env.SOLANA_RPC_URL || rpcUrls[cluster],
        connection: new Connection(
          process.env.SOLANA_RPC_URL || rpcUrls[cluster],
          'confirmed'
        )
      };

      logger.info(`Solana connection initialized: ${cluster}`);
    } catch (error) {
      logger.error('Failed to initialize Solana:', error);
      throw error;
    }
  }

  /**
   * Generate blockchain addresses with network connectivity
   * @returns {Promise<Object>} Generated addresses and keys
   */
  async generateBlockchainAddresses() {
    // Initialize networks if not already done
    if (!this.initialized) {
      await this.initializeNetworks();
      this.initialized = true;
    }
    try {
      // Generate Base L2 (EVM) wallet
      const evmWallet = ethers.Wallet.createRandom();
      const connectedEvmWallet = evmWallet.connect(this.baseNetwork.provider);

      // Generate Solana wallet
      const solanaKeypair = Keypair.generate();

      const addresses = {
        base: evmWallet.address,
        solana: solanaKeypair.publicKey.toString(),
        evmPrivateKey: evmWallet.privateKey,
        solanaPrivateKey: Buffer.from(solanaKeypair.secretKey).toString('hex'),
        networks: {
          base: {
            network: this.baseNetwork.name,
            chainId: this.baseNetwork.chainId,
            explorer: `https://basescan.org/address/${evmWallet.address}`
          },
          solana: {
            cluster: this.solanaNetwork.cluster,
            explorer: `https://explorer.solana.com/address/${solanaKeypair.publicKey.toString()}?cluster=${this.solanaNetwork.cluster}`
          }
        }
      };

      // Log wallet creation for audit
      await auditLogger.logEvent({
        eventType: 'WALLET_GENERATED',
        description: 'Blockchain addresses generated for invoice wallet',
        metadata: {
          baseAddress: addresses.base,
          solanaAddress: addresses.solana,
          networks: addresses.networks
        }
      });

      return addresses;
    } catch (error) {
      logger.error('Failed to generate blockchain addresses:', error);
      throw error;
    }
  }

  /**
   * Check wallet balance on both networks
   * @param {string} baseAddress - Base L2 address
   * @param {string} solanaAddress - Solana address
   * @returns {Promise<Object>} Balances on both networks
   */
  async getWalletBalances(baseAddress, solanaAddress) {
    // Initialize networks if not already done
    if (!this.initialized) {
      await this.initializeNetworks();
      this.initialized = true;
    }
    try {
      // Get Base L2 balance
      const baseBalance = await this.baseNetwork.provider.getBalance(baseAddress);
      const baseBalanceETH = ethers.formatEther(baseBalance);

      // Get Solana balance
      const solanaPublicKey = new PublicKey(solanaAddress);
      const solanaBalance = await this.solanaNetwork.connection.getBalance(solanaPublicKey);
      const solanaBalanceSOL = solanaBalance / LAMPORTS_PER_SOL;

      return {
        base: {
          wei: baseBalance.toString(),
          eth: baseBalanceETH,
          usd: await this.getUSDValue('ETH', baseBalanceETH)
        },
        solana: {
          lamports: solanaBalance,
          sol: solanaBalanceSOL,
          usd: await this.getUSDValue('SOL', solanaBalanceSOL)
        }
      };
    } catch (error) {
      logger.error('Failed to get wallet balances:', error);
      throw error;
    }
  }

  /**
   * Fund wallet with test tokens (for testnet only)
   * @param {string} address - Wallet address
   * @param {string} network - 'base' or 'solana'
   * @returns {Promise<Object>} Transaction result
   */
  async fundTestWallet(address, network = 'solana') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Test funding not available in production');
    }

    try {
      if (network === 'solana') {
        // Request airdrop for Solana devnet
        const publicKey = new PublicKey(address);
        const signature = await this.solanaNetwork.connection.requestAirdrop(
          publicKey,
          LAMPORTS_PER_SOL // 1 SOL
        );

        // Wait for confirmation
        await this.solanaNetwork.connection.confirmTransaction(signature);

        logger.info(`Funded Solana wallet with 1 SOL: ${address}`);
        return {
          success: true,
          network: 'solana',
          amount: '1 SOL',
          signature,
          explorer: `https://explorer.solana.com/tx/${signature}?cluster=${this.solanaNetwork.cluster}`
        };
      } else if (network === 'base') {
        // For Base testnet, would need faucet integration
        logger.info('Base testnet funding requires faucet integration');
        return {
          success: false,
          network: 'base',
          message: 'Please use Base Sepolia faucet: https://www.coinbase.com/faucets/base-sepolia'
        };
      }
    } catch (error) {
      logger.error(`Failed to fund test wallet on ${network}:`, error);
      throw error;
    }
  }

  /**
   * Create invoice payment transaction
   * @param {Object} wallet - Wallet object
   * @param {Object} invoice - Invoice object
   * @param {string} network - Which network to use
   * @returns {Promise<Object>} Transaction details
   */
  async createInvoicePaymentTransaction(wallet, invoice, network = 'base') {
    try {
      if (network === 'base') {
        // Create EVM transaction
        const tx = {
          to: invoice.recipientAddress,
          value: ethers.parseEther(invoice.amount.toString()),
          data: ethers.hexlify(ethers.toUtf8Bytes(`Invoice #${invoice.id}`))
        };

        // Estimate gas
        const gasEstimate = await this.baseNetwork.provider.estimateGas(tx);
        tx.gasLimit = gasEstimate;

        return {
          network: 'base',
          transaction: tx,
          estimated_fee: ethers.formatEther(gasEstimate * BigInt(20000000000)) // 20 gwei
        };
      } else if (network === 'solana') {
        // Create Solana transaction
        const fromPubkey = new PublicKey(wallet.solana_address);
        const toPubkey = new PublicKey(invoice.recipientAddress);

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: invoice.amount * LAMPORTS_PER_SOL
          })
        );

        // Get recent blockhash
        const { blockhash } = await this.solanaNetwork.connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;

        // Estimate fee
        const fee = await transaction.getEstimatedFee(this.solanaNetwork.connection);

        return {
          network: 'solana',
          transaction: transaction,
          estimated_fee: fee / LAMPORTS_PER_SOL + ' SOL'
        };
      }
    } catch (error) {
      logger.error('Failed to create payment transaction:', error);
      throw error;
    }
  }

  /**
   * Monitor wallet for incoming payments
   * @param {string} address - Wallet address
   * @param {string} network - Network to monitor
   * @param {Function} callback - Callback for new transactions
   */
  async monitorWalletTransactions(address, network, callback) {
    try {
      if (network === 'base') {
        // Monitor Base L2 transactions
        this.baseNetwork.provider.on('block', async (blockNumber) => {
          const block = await this.baseNetwork.provider.getBlock(blockNumber, true);
          if (block && block.transactions) {
            for (const tx of block.transactions) {
              if (tx.to && tx.to.toLowerCase() === address.toLowerCase()) {
                callback({
                  network: 'base',
                  transaction: tx,
                  blockNumber
                });
              }
            }
          }
        });
      } else if (network === 'solana') {
        // Monitor Solana transactions
        const publicKey = new PublicKey(address);
        this.solanaNetwork.connection.onAccountChange(
          publicKey,
          (accountInfo) => {
            callback({
              network: 'solana',
              accountInfo,
              address
            });
          }
        );
      }

      logger.info(`Started monitoring ${network} wallet: ${address}`);
    } catch (error) {
      logger.error('Failed to monitor wallet:', error);
      throw error;
    }
  }

  /**
   * Get USD value (mock implementation - would use price oracle in production)
   * @param {string} token - Token symbol
   * @param {number} amount - Amount
   * @returns {Promise<number>} USD value
   */
  async getUSDValue(token, amount) {
    // Mock prices - in production would use Chainlink or other oracle
    const prices = {
      'ETH': 2500,
      'SOL': 100
    };
    return (prices[token] || 0) * amount;
  }

  /**
   * Verify wallet ownership
   * @param {string} address - Wallet address
   * @param {string} signature - Signature to verify
   * @param {string} message - Original message
   * @param {string} network - Network type
   * @returns {Promise<boolean>} Verification result
   */
  async verifyWalletOwnership(address, signature, message, network = 'base') {
    try {
      if (network === 'base') {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        return recoveredAddress.toLowerCase() === address.toLowerCase();
      } else if (network === 'solana') {
        // Solana signature verification would go here
        // This requires the @solana/web3.js nacl functions
        return true; // Placeholder
      }
    } catch (error) {
      logger.error('Failed to verify wallet ownership:', error);
      return false;
    }
  }

  /**
   * Get network status
   * @returns {Promise<Object>} Network status
   */
  async getNetworkStatus() {
    // Initialize networks if not already done
    if (!this.initialized) {
      await this.initializeNetworks();
      this.initialized = true;
    }
    try {
      // Check Base L2 status
      const baseBlock = await this.baseNetwork.provider.getBlockNumber();
      const baseGasPrice = await this.baseNetwork.provider.getFeeData();

      // Check Solana status
      const solanaSlot = await this.solanaNetwork.connection.getSlot();
      const solanaVersion = await this.solanaNetwork.connection.getVersion();

      return {
        base: {
          connected: true,
          network: this.baseNetwork.name,
          chainId: this.baseNetwork.chainId,
          blockNumber: baseBlock,
          gasPrice: ethers.formatUnits(baseGasPrice.gasPrice, 'gwei') + ' gwei'
        },
        solana: {
          connected: true,
          cluster: this.solanaNetwork.cluster,
          slot: solanaSlot,
          version: solanaVersion['solana-core']
        }
      };
    } catch (error) {
      logger.error('Failed to get network status:', error);
      throw error;
    }
  }
}

export default new BlockchainIntegration();