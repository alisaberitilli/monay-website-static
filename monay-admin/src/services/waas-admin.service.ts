// WaaS (Wallet as a Service) Admin Service
// Comprehensive wallet and custody management

import axios from 'axios';
import { toast } from 'react-hot-toast';

export interface Wallet {
  id: string;
  userId: string;
  type: 'hd' | 'multi_sig' | 'smart_contract' | 'mpc';
  custodyType: 'self_custody' | 'assisted_custody' | 'managed_custody' | 'institutional_custody';
  status: 'active' | 'inactive' | 'suspended' | 'recovery';
  addresses: Record<string, string>;
  createdAt: string;
  lastActivity: string;
  securityFeatures: string[];
  riskScore: number;
}

export interface CustodyStats {
  totalWallets: number;
  activeWallets: number;
  custodyBreakdown: {
    self_custody: number;
    assisted_custody: number;
    managed_custody: number;
    institutional_custody: number;
  };
  securityIncidents: number;
  recoveryRequests: number;
}

export interface MultiSigWallet {
  id: string;
  address: string;
  threshold: number;
  signers: string[];
  pendingTransactions: number;
  totalTransactions: number;
  chainId: number;
  status: 'active' | 'paused' | 'deprecated';
  createdAt: string;
}

export interface SocialRecovery {
  id: string;
  walletId: string;
  userId: string;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  guardians: {
    email: string;
    verified: boolean;
    approvedAt?: string;
  }[];
  threshold: number;
  initiatedAt: string;
  expiresAt: string;
}

export interface KeyRotation {
  id: string;
  walletId: string;
  oldKeyId: string;
  newKeyId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  initiatedAt: string;
  completedAt?: string;
  reason: string;
}

class WaaSAdminService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL + '/waas';
  }

  // Wallet Management
  async getWallets(params: {
    custodyType?: string;
    status?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    wallets: Wallet[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/wallets`, { params });
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch wallets');
      throw error;
    }
  }

  async getWalletDetails(walletId: string): Promise<Wallet & {
    transactions: any[];
    balances: Record<string, { balance: string; usdValue: number }>;
    securityAudit: any[];
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/wallet/${walletId}`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch wallet details');
      throw error;
    }
  }

  async suspendWallet(walletId: string, reason: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/wallet/${walletId}/suspend`, { reason });
      toast.success('Wallet suspended successfully');
    } catch (error) {
      toast.error('Failed to suspend wallet');
      throw error;
    }
  }

  async reactivateWallet(walletId: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/wallet/${walletId}/reactivate`);
      toast.success('Wallet reactivated successfully');
    } catch (error) {
      toast.error('Failed to reactivate wallet');
      throw error;
    }
  }

  // Custody Management
  async getCustodyStats(timeframe = '24h'): Promise<CustodyStats> {
    try {
      const response = await axios.get(`${this.baseURL}/custody/stats`, {
        params: { timeframe }
      });
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch custody statistics');
      throw error;
    }
  }

  async changeCustodyType(walletId: string, newCustodyType: string, reason: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/wallet/${walletId}/custody/change`, {
        custodyType: newCustodyType,
        reason
      });
      toast.success('Custody type change initiated');
    } catch (error) {
      toast.error('Failed to change custody type');
      throw error;
    }
  }

  async getCustodyAuditTrail(walletId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/wallet/${walletId}/custody/audit`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch custody audit trail');
      throw error;
    }
  }

  // Multi-Signature Wallet Management
  async getMultiSigWallets(params: {
    chainId?: number;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    wallets: MultiSigWallet[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/multisig`, { params });
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch multi-sig wallets');
      throw error;
    }
  }

  async createMultiSigWallet(data: {
    threshold: number;
    signers: string[];
    chainId: number;
    name: string;
  }): Promise<{ walletId: string; address: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/multisig/create`, data);
      toast.success('Multi-sig wallet created successfully');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to create multi-sig wallet');
      throw error;
    }
  }

  async getMultiSigTransactions(walletId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/multisig/${walletId}/transactions`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch multi-sig transactions');
      throw error;
    }
  }

  async updateMultiSigThreshold(walletId: string, threshold: number): Promise<void> {
    try {
      await axios.patch(`${this.baseURL}/multisig/${walletId}/threshold`, { threshold });
      toast.success('Multi-sig threshold updated successfully');
    } catch (error) {
      toast.error('Failed to update multi-sig threshold');
      throw error;
    }
  }

  // Social Recovery Management
  async getSocialRecoveries(params: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    recoveries: SocialRecovery[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/recovery/social`, { params });
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch social recoveries');
      throw error;
    }
  }

  async approveSocialRecovery(recoveryId: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/recovery/social/${recoveryId}/approve`);
      toast.success('Social recovery approved');
    } catch (error) {
      toast.error('Failed to approve social recovery');
      throw error;
    }
  }

  async rejectSocialRecovery(recoveryId: string, reason: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/recovery/social/${recoveryId}/reject`, { reason });
      toast.success('Social recovery rejected');
    } catch (error) {
      toast.error('Failed to reject social recovery');
      throw error;
    }
  }

  // Hardware Wallet Integration
  async getHardwareWallets(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/hardware`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch hardware wallets');
      throw error;
    }
  }

  async verifyHardwareWallet(deviceId: string): Promise<{ verified: boolean; deviceInfo: any }> {
    try {
      const response = await axios.post(`${this.baseURL}/hardware/${deviceId}/verify`);
      toast.success('Hardware wallet verification completed');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to verify hardware wallet');
      throw error;
    }
  }

  // Key Management
  async getKeyRotations(params: {
    walletId?: string;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    rotations: KeyRotation[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/keys/rotations`, { params });
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch key rotations');
      throw error;
    }
  }

  async initiateKeyRotation(walletId: string, reason: string): Promise<{ rotationId: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/keys/rotate`, { walletId, reason });
      toast.success('Key rotation initiated');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to initiate key rotation');
      throw error;
    }
  }

  async getKeyAuditLog(walletId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/keys/${walletId}/audit`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch key audit log');
      throw error;
    }
  }

  // MPC Wallet Management
  async getMPCWallets(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/mpc`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch MPC wallets');
      throw error;
    }
  }

  async createMPCWallet(data: {
    threshold: number;
    parties: number;
    chains: number[];
    name: string;
  }): Promise<{ walletId: string; keyShares: string[] }> {
    try {
      const response = await axios.post(`${this.baseURL}/mpc/create`, data);
      toast.success('MPC wallet created successfully');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to create MPC wallet');
      throw error;
    }
  }

  // Institutional Custody
  async getInstitutionalWallets(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/institutional`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch institutional wallets');
      throw error;
    }
  }

  async createInstitutionalWallet(data: {
    institutionId: string;
    complianceLevel: string;
    insuranceCoverage: string;
    coldStorageRatio: number;
  }): Promise<{ walletId: string; vaultId: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/institutional/create`, data);
      toast.success('Institutional wallet created successfully');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to create institutional wallet');
      throw error;
    }
  }

  // Security & Compliance
  async getSecurityAlerts(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/security/alerts`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch security alerts');
      throw error;
    }
  }

  async runSecurityScan(walletId: string): Promise<{
    riskScore: number;
    vulnerabilities: any[];
    recommendations: string[];
  }> {
    try {
      const response = await axios.post(`${this.baseURL}/security/scan`, { walletId });
      toast.success('Security scan completed');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to run security scan');
      throw error;
    }
  }

  async generateComplianceReport(params: {
    startDate: string;
    endDate: string;
    walletId?: string;
    custodyType?: string;
  }): Promise<{ reportId: string; downloadUrl: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/compliance/report`, params);
      toast.success('Compliance report generated');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to generate compliance report');
      throw error;
    }
  }

  // Analytics & Insights
  async getWalletAnalytics(timeframe = '30d'): Promise<{
    totalValue: string;
    growthRate: number;
    transactionVolume: string;
    activeWallets: number;
    newWallets: number;
    topChains: Array<{ chainId: number; volume: string; count: number }>;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/analytics`, {
        params: { timeframe }
      });
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch wallet analytics');
      throw error;
    }
  }
}

export default new WaaSAdminService();