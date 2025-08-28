import { Connection, PublicKey, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getOrCreateAssociatedTokenAccount, transfer, createTransferInstruction, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as bip39 from 'bip39';
import { derivePath } from 'ed25519-hd-key';
import nacl from 'tweetnacl';

class SolanaService {
  constructor() {
    this.connection = null;
    this.network = process.env.SOLANA_NETWORK || 'devnet';
    this.rpcUrl = process.env.SOLANA_RPC_URL || `https://api.${this.network}.solana.com`;
    this.initConnection();
  }

  initConnection() {
    try {
      this.connection = new Connection(this.rpcUrl, 'confirmed');
      console.log(`Solana service initialized on ${this.network}`);
    } catch (error) {
      console.error('Failed to initialize Solana connection:', error);
      this.connection = null;
    }
  }

  async getConnection() {
    if (!this.connection) {
      this.initConnection();
    }
    return this.connection;
  }

  async generateWallet() {
    try {
      const mnemonic = bip39.generateMnemonic();
      const seed = await bip39.mnemonicToSeed(mnemonic);
      const derivedSeed = derivePath("m/44'/501'/0'/0'", seed.toString('hex')).key;
      const keypair = Keypair.fromSeed(derivedSeed);
      
      return {
        publicKey: keypair.publicKey.toString(),
        secretKey: Buffer.from(keypair.secretKey).toString('hex'),
        mnemonic: mnemonic
      };
    } catch (error) {
      console.error('Error generating Solana wallet:', error);
      throw error;
    }
  }

  async getBalance(address) {
    try {
      const connection = await this.getConnection();
      if (!connection) {
        throw new Error('Solana connection not available');
      }
      
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error getting Solana balance:', error);
      throw error;
    }
  }

  async getTokenBalance(walletAddress, tokenMintAddress) {
    try {
      const connection = await this.getConnection();
      if (!connection) {
        throw new Error('Solana connection not available');
      }
      
      const walletPublicKey = new PublicKey(walletAddress);
      const mintPublicKey = new PublicKey(tokenMintAddress);
      
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        walletPublicKey,
        { mint: mintPublicKey }
      );
      
      if (tokenAccounts.value.length === 0) {
        return 0;
      }
      
      const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
      return balance;
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  }

  async transferSOL(fromSecretKey, toAddress, amount) {
    try {
      const connection = await this.getConnection();
      if (!connection) {
        throw new Error('Solana connection not available');
      }
      
      const fromKeypair = Keypair.fromSecretKey(Buffer.from(fromSecretKey, 'hex'));
      const toPublicKey = new PublicKey(toAddress);
      
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: fromKeypair.publicKey,
          toPubkey: toPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );
      
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [fromKeypair]
      );
      
      return {
        success: true,
        signature,
        explorer: `https://explorer.solana.com/tx/${signature}?cluster=${this.network}`
      };
    } catch (error) {
      console.error('Error transferring SOL:', error);
      throw error;
    }
  }

  async transferToken(fromSecretKey, toAddress, tokenMintAddress, amount, decimals = 9) {
    try {
      const connection = await this.getConnection();
      if (!connection) {
        throw new Error('Solana connection not available');
      }
      
      const fromKeypair = Keypair.fromSecretKey(Buffer.from(fromSecretKey, 'hex'));
      const toPublicKey = new PublicKey(toAddress);
      const mintPublicKey = new PublicKey(tokenMintAddress);
      
      const fromTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromKeypair,
        mintPublicKey,
        fromKeypair.publicKey
      );
      
      const toTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        fromKeypair,
        mintPublicKey,
        toPublicKey
      );
      
      const signature = await transfer(
        connection,
        fromKeypair,
        fromTokenAccount.address,
        toTokenAccount.address,
        fromKeypair.publicKey,
        amount * Math.pow(10, decimals)
      );
      
      return {
        success: true,
        signature,
        explorer: `https://explorer.solana.com/tx/${signature}?cluster=${this.network}`
      };
    } catch (error) {
      console.error('Error transferring token:', error);
      throw error;
    }
  }

  async getTransactionHistory(address, limit = 10) {
    try {
      const connection = await this.getConnection();
      if (!connection) {
        throw new Error('Solana connection not available');
      }
      
      const publicKey = new PublicKey(address);
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit });
      
      const transactions = [];
      for (const sig of signatures) {
        const tx = await connection.getParsedTransaction(sig.signature);
        if (tx) {
          transactions.push({
            signature: sig.signature,
            slot: sig.slot,
            timestamp: tx.blockTime,
            success: !sig.err,
            fee: tx.meta?.fee || 0,
            explorer: `https://explorer.solana.com/tx/${sig.signature}?cluster=${this.network}`
          });
        }
      }
      
      return transactions;
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }

  async validateAddress(address) {
    try {
      const publicKey = new PublicKey(address);
      return PublicKey.isOnCurve(publicKey);
    } catch {
      return false;
    }
  }

  async estimateTransactionFee() {
    try {
      const connection = await this.getConnection();
      if (!connection) {
        throw new Error('Solana connection not available');
      }
      
      const recentBlockhash = await connection.getRecentBlockhash();
      const feeCalculator = recentBlockhash.feeCalculator;
      return feeCalculator.lamportsPerSignature / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Error estimating transaction fee:', error);
      return 0.000005; // Default fee
    }
  }
}

export default new SolanaService();