// WaaS Consumer Service
// Comprehensive wallet services for end users

import axios from 'axios';
import { toast } from 'react-hot-toast';
import CryptoJS from 'crypto-js';

export interface UserWallet {
  id: string;
  userId: string;
  custodyType: 'self_custody' | 'assisted_custody' | 'managed_custody';
  status: 'active' | 'inactive' | 'recovery' | 'locked';
  addresses: Record<string, string>;
  balances: Record<string, { balance: string; usdValue: number; }>;
  createdAt: string;
  lastActivity: string;
  securityLevel: 'basic' | 'standard' | 'enhanced';
  recoveryMethods: string[];
}

export interface Transaction {
  id: string;
  walletId: string;
  type: 'send' | 'receive' | 'swap' | 'bridge';
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled';
  chainId: number;
  hash: string;
  from: string;
  to: string;
  amount: string;
  currency: string;
  gasUsed?: string;
  gasPrice?: string;
  timestamp: string;
  confirmations: number;
  metadata?: any;
}

export interface Guardian {
  id: string;
  email?: string;
  phone?: string;
  name: string;
  status: 'pending' | 'verified' | 'active';
  addedAt: string;
  verifiedAt?: string;
}

export interface RecoveryRequest {
  id: string;
  walletId: string;
  type: 'social' | 'email' | 'seed_phrase';
  status: 'initiated' | 'pending_approvals' | 'approved' | 'completed' | 'rejected';
  requiredApprovals: number;
  receivedApprovals: number;
  guardians: Guardian[];
  expiresAt: string;
  createdAt: string;
}

class WaaSConsumerService {
  private baseURL: string;
  private userId?: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL + '/waas';
    this.userId = this.getUserId();
  }

  private getUserId(): string | undefined {
    // Get user ID from localStorage/session storage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId') || undefined;
    }
    return undefined;
  }

  // Wallet Management
  async createWallet(options: {
    custodyType: string;
    chains: string[];
    name?: string;
    recoveryEmail?: string;
  }): Promise<{ walletId: string; seedPhrase?: string; addresses: Record<string, string> }> {
    try {
      const response = await axios.post(`${this.baseURL}/wallet/create`, {
        ...options,
        userId: this.userId
      });
      
      if (options.custodyType === 'self_custody' && response.data.data.seedPhrase) {
        toast.success('Wallet created! Please save your seed phrase securely.');
      } else {
        toast.success('Wallet created successfully!');
      }
      
      return response.data.data;
    } catch (error) {
      toast.error('Failed to create wallet');
      throw error;
    }
  }

  async getWallet(walletId: string): Promise<UserWallet> {
    try {
      const response = await axios.get(`${this.baseURL}/wallet/${walletId}`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch wallet details');
      throw error;
    }
  }

  async getWallets(): Promise<UserWallet[]> {
    try {
      const response = await axios.get(`${this.baseURL}/wallets`, {
        params: { userId: this.userId }
      });
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch wallets');
      throw error;
    }
  }

  async updateWalletName(walletId: string, name: string): Promise<void> {
    try {
      await axios.patch(`${this.baseURL}/wallet/${walletId}`, { name });
      toast.success('Wallet name updated');
    } catch (error) {
      toast.error('Failed to update wallet name');
      throw error;
    }
  }

  // Balance & Portfolio
  async getBalances(walletId: string): Promise<Record<string, { balance: string; usdValue: number; }>> {
    try {
      const response = await axios.get(`${this.baseURL}/wallet/${walletId}/balances`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch balances');
      throw error;
    }
  }

  async refreshBalances(walletId: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/wallet/${walletId}/refresh-balances`);
      toast.success('Balances refreshed');
    } catch (error) {
      toast.error('Failed to refresh balances');
      throw error;
    }
  }

  async getPortfolioSummary(walletId: string): Promise<{
    totalValue: number;
    change24h: number;
    topAssets: Array<{ symbol: string; value: number; percentage: number; }>;
    chartData: Array<{ timestamp: string; value: number; }>;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/wallet/${walletId}/portfolio`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch portfolio summary');
      throw error;
    }
  }

  // Transactions
  async sendTransaction(data: {
    walletId: string;
    chainId: number;
    to: string;
    amount: string;
    currency: string;
    gasPrice?: string;
    memo?: string;
  }): Promise<{ txHash: string; transactionId: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/transaction/send`, data);
      toast.success('Transaction sent successfully');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to send transaction');
      throw error;
    }
  }

  async getTransactions(walletId: string, params: {
    limit?: number;
    offset?: number;
    type?: string;
    status?: string;
  } = {}): Promise<{
    transactions: Transaction[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/wallet/${walletId}/transactions`, {
        params
      });
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch transaction history');
      throw error;
    }
  }

  async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      const response = await axios.get(`${this.baseURL}/transaction/${transactionId}`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch transaction details');
      throw error;
    }
  }

  async cancelTransaction(transactionId: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/transaction/${transactionId}/cancel`);
      toast.success('Transaction cancelled');
    } catch (error) {
      toast.error('Failed to cancel transaction');
      throw error;
    }
  }

  // Security & Recovery
  async setupSocialRecovery(walletId: string, guardians: Array<{
    email?: string;
    phone?: string;
    name: string;
  }>): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/wallet/${walletId}/recovery/social/setup`, {
        guardians
      });
      toast.success('Social recovery setup complete');
    } catch (error) {
      toast.error('Failed to setup social recovery');
      throw error;
    }
  }

  async getGuardians(walletId: string): Promise<Guardian[]> {
    try {
      const response = await axios.get(`${this.baseURL}/wallet/${walletId}/recovery/guardians`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch guardians');
      throw error;
    }
  }

  async addGuardian(walletId: string, guardian: {
    email?: string;
    phone?: string;
    name: string;
  }): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/wallet/${walletId}/recovery/guardian`, guardian);
      toast.success('Guardian added successfully');
    } catch (error) {
      toast.error('Failed to add guardian');
      throw error;
    }
  }

  async removeGuardian(walletId: string, guardianId: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/wallet/${walletId}/recovery/guardian/${guardianId}`);
      toast.success('Guardian removed');
    } catch (error) {
      toast.error('Failed to remove guardian');
      throw error;
    }
  }

  async initiateRecovery(walletId: string, type: 'social' | 'email'): Promise<{ recoveryId: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/wallet/${walletId}/recovery/initiate`, { type });
      toast.success('Recovery process initiated');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to initiate recovery');
      throw error;
    }
  }

  async getRecoveryStatus(recoveryId: string): Promise<RecoveryRequest> {
    try {
      const response = await axios.get(`${this.baseURL}/recovery/${recoveryId}`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch recovery status');
      throw error;
    }
  }

  // Backup & Export
  async exportSeedPhrase(walletId: string, password: string): Promise<{ seedPhrase: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/wallet/${walletId}/export/seed`, {
        password
      });
      toast.success('Seed phrase exported - keep it safe!');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to export seed phrase');
      throw error;
    }
  }

  async verifyBackup(walletId: string, seedPhraseWords: string[]): Promise<{ verified: boolean }> {
    try {
      const response = await axios.post(`${this.baseURL}/wallet/${walletId}/verify-backup`, {
        seedPhraseWords
      });
      
      if (response.data.data.verified) {
        toast.success('Backup verified successfully');
      } else {
        toast.error('Backup verification failed');
      }
      
      return response.data.data;
    } catch (error) {
      toast.error('Failed to verify backup');
      throw error;
    }
  }

  async createBackup(walletId: string): Promise<{ backupData: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/wallet/${walletId}/backup/create`);
      toast.success('Backup created successfully');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to create backup');
      throw error;
    }
  }

  // Multi-Signature Wallets
  async createMultiSigWallet(data: {
    name: string;
    threshold: number;
    signers: string[];
    chainId: number;
  }): Promise<{ walletId: string; address: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/multisig/create`, {
        ...data,
        creator: this.userId
      });
      toast.success('Multi-signature wallet created');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to create multi-sig wallet');
      throw error;
    }
  }

  async getMultiSigProposals(walletId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/multisig/${walletId}/proposals`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch multi-sig proposals');
      throw error;
    }
  }

  async signMultiSigTransaction(proposalId: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/multisig/proposal/${proposalId}/sign`);
      toast.success('Transaction signed');
    } catch (error) {
      toast.error('Failed to sign transaction');
      throw error;
    }
  }

  // Hardware Wallet Integration
  async connectHardwareWallet(type: 'ledger' | 'trezor'): Promise<{
    connected: boolean;
    addresses: Record<string, string>;
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/hardware/connect`, { type });
      toast.success(`${type} connected successfully`);
      return response.data.data;
    } catch (error) {
      toast.error(`Failed to connect ${type}`);
      throw error;
    }
  }

  async signWithHardwareWallet(data: {
    walletId: string;
    transaction: any;
    derivationPath: string;
  }): Promise<{ signature: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/hardware/sign`, data);
      toast.success('Transaction signed with hardware wallet');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to sign with hardware wallet');
      throw error;
    }
  }

  // Notifications & Alerts
  async getNotifications(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/notifications`, {
        params: { userId: this.userId }
      });
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch notifications');
      throw error;
    }
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    try {
      await axios.patch(`${this.baseURL}/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async updateNotificationSettings(settings: {
    transactions: boolean;
    security: boolean;
    updates: boolean;
    marketing: boolean;
  }): Promise<void> {
    try {
      await axios.patch(`${this.baseURL}/notifications/settings`, settings);
      toast.success('Notification settings updated');
    } catch (error) {
      toast.error('Failed to update notification settings');
      throw error;
    }
  }

  // Utility Functions
  generateQRCode(address: string): string {
    // Return QR code data URL or use external library
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${address}`;
  }

  validateAddress(address: string, chainId: number): boolean {
    // Basic address validation - implement proper validation
    if (chainId === 1 || chainId === 8453 || chainId === 137) {
      // Ethereum-based chains
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    } else if (chainId === 101) {
      // Solana
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    }
    return false;
  }

  formatBalance(balance: string, decimals: number = 18): string {
    const balanceNumber = parseFloat(balance) / Math.pow(10, decimals);
    if (balanceNumber < 0.001) return '< 0.001';
    if (balanceNumber < 1) return balanceNumber.toFixed(6);
    if (balanceNumber < 1000) return balanceNumber.toFixed(4);
    return balanceNumber.toLocaleString();
  }

  formatUSD(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}

export default new WaaSConsumerService();