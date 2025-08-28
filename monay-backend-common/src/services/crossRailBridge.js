import evmService from './evm.js';
import solanaService from './solana.js';
import { ethers } from 'ethers';
import { Connection, PublicKey, Keypair, Transaction, SystemProgram } from '@solana/web3.js';
import { v4 as uuidv4 } from 'uuid';

class CrossRailBridgeService {
  constructor() {
    this.pendingSwaps = new Map();
    this.completedSwaps = new Map();
    this.treasuryAddress = {
      evm: process.env.BASE_TREASURY_ADDRESS,
      solana: process.env.SOLANA_TREASURY_ADDRESS
    };
    this.bridgeOperatorKey = {
      evm: process.env.BRIDGE_OPERATOR_EVM_KEY,
      solana: process.env.BRIDGE_OPERATOR_SOLANA_KEY
    };
    this.swapStatus = {
      PENDING: 'pending',
      PROCESSING: 'processing',
      COMPLETED: 'completed',
      FAILED: 'failed',
      CANCELLED: 'cancelled'
    };
  }

  /**
   * Initiate a cross-rail swap from Base L2 to Solana
   */
  async initiateEVMToSolanaSwap({
    userPrivateKey,
    tokenAddress,
    amount,
    solanaRecipient,
    userId
  }) {
    try {
      const swapId = this.generateSwapId();
      const swap = {
        id: swapId,
        sourceChain: 'base',
        targetChain: 'solana',
        tokenAddress,
        amount,
        solanaRecipient,
        userId,
        status: this.swapStatus.PENDING,
        initiatedAt: new Date().toISOString(),
        evmTxHash: null,
        solanaTxSignature: null
      };

      this.pendingSwaps.set(swapId, swap);

      // Step 1: Lock tokens on Base L2 (send to treasury)
      const provider = await evmService.getProvider();
      const wallet = new ethers.Wallet(userPrivateKey, provider);
      
      // Get treasury contract instance
      const treasuryContract = new ethers.Contract(
        this.treasuryAddress.evm,
        [
          'function initiateSwapToSolana(address token, uint256 amount, string memory solanaAddress) returns (bytes32)'
        ],
        wallet
      );

      // Approve treasury to spend tokens
      const tokenContract = new ethers.Contract(
        tokenAddress,
        [
          'function approve(address spender, uint256 amount) returns (bool)',
          'function decimals() view returns (uint8)'
        ],
        wallet
      );

      const decimals = await tokenContract.decimals();
      const amountInUnits = ethers.parseUnits(amount.toString(), decimals);

      // Approve and initiate swap
      const approveTx = await tokenContract.approve(this.treasuryAddress.evm, amountInUnits);
      await approveTx.wait();

      const swapTx = await treasuryContract.initiateSwapToSolana(
        tokenAddress,
        amountInUnits,
        solanaRecipient
      );
      const receipt = await swapTx.wait();

      swap.evmTxHash = receipt.hash;
      swap.status = this.swapStatus.PROCESSING;
      
      // Step 2: Trigger Solana mint (in production, this would be done by an oracle/relayer)
      setTimeout(() => this.completeSolanaSwap(swapId), 5000);

      return {
        success: true,
        swapId,
        evmTxHash: receipt.hash,
        status: swap.status,
        estimatedCompletion: '60 seconds'
      };
    } catch (error) {
      console.error('Error initiating EVM to Solana swap:', error);
      throw error;
    }
  }

  /**
   * Initiate a cross-rail swap from Solana to Base L2
   */
  async initiateSolanaToEVMSwap({
    userSecretKey,
    tokenMintAddress,
    amount,
    evmRecipient,
    userId
  }) {
    try {
      const swapId = this.generateSwapId();
      const swap = {
        id: swapId,
        sourceChain: 'solana',
        targetChain: 'base',
        tokenMintAddress,
        amount,
        evmRecipient,
        userId,
        status: this.swapStatus.PENDING,
        initiatedAt: new Date().toISOString(),
        solanaTxSignature: null,
        evmTxHash: null
      };

      this.pendingSwaps.set(swapId, swap);

      // Step 1: Burn tokens on Solana (send to treasury program)
      const connection = await solanaService.getConnection();
      const userKeypair = Keypair.fromSecretKey(Buffer.from(userSecretKey, 'hex'));
      
      // In production, this would interact with the Solana program
      // For now, we'll simulate by transferring to treasury
      const treasuryPubkey = new PublicKey(this.treasuryAddress.solana || '11111111111111111111111111111111');
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: userKeypair.publicKey,
          toPubkey: treasuryPubkey,
          lamports: amount * 1000000000 // Convert to lamports
        })
      );

      const signature = await connection.sendTransaction(transaction, [userKeypair]);
      await connection.confirmTransaction(signature, 'confirmed');

      swap.solanaTxSignature = signature;
      swap.status = this.swapStatus.PROCESSING;

      // Step 2: Trigger EVM mint (in production, this would be done by an oracle/relayer)
      setTimeout(() => this.completeEVMSwap(swapId), 5000);

      return {
        success: true,
        swapId,
        solanaTxSignature: signature,
        status: swap.status,
        estimatedCompletion: '60 seconds'
      };
    } catch (error) {
      console.error('Error initiating Solana to EVM swap:', error);
      throw error;
    }
  }

  /**
   * Complete the Solana side of an EVM->Solana swap
   */
  async completeSolanaSwap(swapId) {
    try {
      const swap = this.pendingSwaps.get(swapId);
      if (!swap || swap.targetChain !== 'solana') {
        throw new Error('Invalid swap ID or wrong target chain');
      }

      // In production, this would mint tokens on Solana
      // For now, we'll simulate completion
      const connection = await solanaService.getConnection();
      const operatorKeypair = Keypair.fromSecretKey(
        Buffer.from(this.bridgeOperatorKey.solana || '0'.repeat(64), 'hex')
      );

      // Simulate minting tokens to recipient
      const recipientPubkey = new PublicKey(swap.solanaRecipient);
      
      // Mock transaction (in production, would call token program)
      const mockSignature = 'mock_' + uuidv4().replace(/-/g, '');
      
      swap.solanaTxSignature = mockSignature;
      swap.status = this.swapStatus.COMPLETED;
      swap.completedAt = new Date().toISOString();

      this.completedSwaps.set(swapId, swap);
      this.pendingSwaps.delete(swapId);

      return {
        success: true,
        solanaTxSignature: mockSignature
      };
    } catch (error) {
      console.error('Error completing Solana swap:', error);
      const swap = this.pendingSwaps.get(swapId);
      if (swap) {
        swap.status = this.swapStatus.FAILED;
        swap.error = error.message;
      }
      throw error;
    }
  }

  /**
   * Complete the EVM side of a Solana->EVM swap
   */
  async completeEVMSwap(swapId) {
    try {
      const swap = this.pendingSwaps.get(swapId);
      if (!swap || swap.targetChain !== 'base') {
        throw new Error('Invalid swap ID or wrong target chain');
      }

      // In production, this would mint tokens on Base L2
      const provider = await evmService.getProvider();
      const operatorWallet = new ethers.Wallet(
        this.bridgeOperatorKey.evm || '0x' + '0'.repeat(64),
        provider
      );

      // Get treasury contract instance
      const treasuryContract = new ethers.Contract(
        this.treasuryAddress.evm,
        [
          'function completeSwapFromSolana(address recipient, address token, uint256 amount, bytes32 solanaSignature)'
        ],
        operatorWallet
      );

      // Mock token address (in production, would map Solana mint to EVM token)
      const tokenAddress = '0x' + '0'.repeat(40);
      const amountInUnits = ethers.parseEther(swap.amount.toString());
      const solanaSignatureBytes = ethers.id(swap.solanaTxSignature || 'mock');

      // Complete swap on EVM side
      const tx = await treasuryContract.completeSwapFromSolana(
        swap.evmRecipient,
        tokenAddress,
        amountInUnits,
        solanaSignatureBytes
      );
      const receipt = await tx.wait();

      swap.evmTxHash = receipt.hash;
      swap.status = this.swapStatus.COMPLETED;
      swap.completedAt = new Date().toISOString();

      this.completedSwaps.set(swapId, swap);
      this.pendingSwaps.delete(swapId);

      return {
        success: true,
        evmTxHash: receipt.hash
      };
    } catch (error) {
      console.error('Error completing EVM swap:', error);
      const swap = this.pendingSwaps.get(swapId);
      if (swap) {
        swap.status = this.swapStatus.FAILED;
        swap.error = error.message;
      }
      throw error;
    }
  }

  /**
   * Get swap status
   */
  getSwapStatus(swapId) {
    const swap = this.pendingSwaps.get(swapId) || this.completedSwaps.get(swapId);
    if (!swap) {
      return null;
    }

    return {
      id: swap.id,
      status: swap.status,
      sourceChain: swap.sourceChain,
      targetChain: swap.targetChain,
      amount: swap.amount,
      initiatedAt: swap.initiatedAt,
      completedAt: swap.completedAt,
      evmTxHash: swap.evmTxHash,
      solanaTxSignature: swap.solanaTxSignature,
      error: swap.error
    };
  }

  /**
   * Get all swaps for a user
   */
  getUserSwaps(userId) {
    const allSwaps = [...this.pendingSwaps.values(), ...this.completedSwaps.values()];
    return allSwaps.filter(swap => swap.userId === userId);
  }

  /**
   * Cancel a pending swap
   */
  async cancelSwap(swapId, operatorKey) {
    try {
      const swap = this.pendingSwaps.get(swapId);
      if (!swap) {
        throw new Error('Swap not found or already completed');
      }

      if (swap.status !== this.swapStatus.PENDING) {
        throw new Error('Can only cancel pending swaps');
      }

      // In production, would trigger refund on source chain
      swap.status = this.swapStatus.CANCELLED;
      swap.cancelledAt = new Date().toISOString();

      this.completedSwaps.set(swapId, swap);
      this.pendingSwaps.delete(swapId);

      return {
        success: true,
        status: swap.status
      };
    } catch (error) {
      console.error('Error cancelling swap:', error);
      throw error;
    }
  }

  /**
   * Get bridge statistics
   */
  getBridgeStats() {
    const pending = Array.from(this.pendingSwaps.values());
    const completed = Array.from(this.completedSwaps.values());

    return {
      totalSwaps: pending.length + completed.length,
      pendingSwaps: pending.length,
      completedSwaps: completed.filter(s => s.status === this.swapStatus.COMPLETED).length,
      failedSwaps: completed.filter(s => s.status === this.swapStatus.FAILED).length,
      cancelledSwaps: completed.filter(s => s.status === this.swapStatus.CANCELLED).length,
      volumeByChain: {
        evmToSolana: completed
          .filter(s => s.sourceChain === 'base' && s.status === this.swapStatus.COMPLETED)
          .reduce((sum, s) => sum + parseFloat(s.amount), 0),
        solanaToEvm: completed
          .filter(s => s.sourceChain === 'solana' && s.status === this.swapStatus.COMPLETED)
          .reduce((sum, s) => sum + parseFloat(s.amount), 0)
      },
      averageCompletionTime: this.calculateAverageCompletionTime(completed),
      lastSwapTime: completed.length > 0 ? 
        completed[completed.length - 1].completedAt : null
    };
  }

  /**
   * Generate unique swap ID
   */
  generateSwapId() {
    return `swap_${Date.now()}_${uuidv4()}`;
  }

  /**
   * Calculate average completion time
   */
  calculateAverageCompletionTime(swaps) {
    const completedSwaps = swaps.filter(s => 
      s.status === this.swapStatus.COMPLETED && s.completedAt
    );

    if (completedSwaps.length === 0) return 0;

    const totalTime = completedSwaps.reduce((sum, swap) => {
      const initiated = new Date(swap.initiatedAt).getTime();
      const completed = new Date(swap.completedAt).getTime();
      return sum + (completed - initiated);
    }, 0);

    return Math.round(totalTime / completedSwaps.length / 1000); // Return in seconds
  }

  /**
   * Validate swap parameters
   */
  validateSwapParams(sourceChain, targetChain, amount) {
    const minAmount = 0.001;
    const maxAmount = 1000000;

    if (!['base', 'solana'].includes(sourceChain)) {
      throw new Error('Invalid source chain');
    }

    if (!['base', 'solana'].includes(targetChain)) {
      throw new Error('Invalid target chain');
    }

    if (sourceChain === targetChain) {
      throw new Error('Source and target chains must be different');
    }

    if (amount < minAmount) {
      throw new Error(`Amount must be at least ${minAmount}`);
    }

    if (amount > maxAmount) {
      throw new Error(`Amount must not exceed ${maxAmount}`);
    }

    return true;
  }
}

export default new CrossRailBridgeService();