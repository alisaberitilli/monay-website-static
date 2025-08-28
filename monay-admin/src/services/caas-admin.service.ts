// CaaS (Crypto as a Service) Admin Service
// Comprehensive blockchain infrastructure management

import axios from 'axios';
import { toast } from 'react-hot-toast';

export interface BlockchainNetwork {
  chainId: number;
  name: string;
  symbol: string;
  rpcUrl: string;
  explorerUrl: string;
  enabled: boolean;
  testnet: boolean;
  health: 'healthy' | 'degraded' | 'down';
  latency: number;
  gasPrice?: string;
  blockHeight?: number;
}

export interface TransactionStats {
  total: number;
  pending: number;
  confirmed: number;
  failed: number;
  volume24h: string;
  gasSpent24h: string;
}

export interface SmartContract {
  id: string;
  address: string;
  name: string;
  chainId: number;
  abi: any[];
  status: 'active' | 'paused' | 'deprecated';
  version: string;
  deployedAt: string;
  transactions: number;
}

export interface GasTracker {
  chainId: number;
  standard: string;
  fast: string;
  instant: string;
  timestamp: string;
}

class CaaSAdminService {
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL + '/caas';
  }

  // Blockchain Network Management
  async getNetworks(): Promise<BlockchainNetwork[]> {
    try {
      const response = await axios.get(`${this.baseURL}/chains`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch blockchain networks');
      throw error;
    }
  }

  async getNetworkHealth(chainId: number): Promise<{
    status: string;
    latency: number;
    blockHeight: number;
    nodeCount: number;
    syncStatus: string;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/chains/${chainId}/health`);
      return response.data.data;
    } catch (error) {
      toast.error(`Failed to get network health for chain ${chainId}`);
      throw error;
    }
  }

  async updateNetworkStatus(chainId: number, enabled: boolean): Promise<void> {
    try {
      await axios.patch(`${this.baseURL}/chains/${chainId}`, { enabled });
      toast.success(`Network ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to update network status');
      throw error;
    }
  }

  // Transaction Management
  async getTransactionStats(chainId?: number, timeframe = '24h'): Promise<TransactionStats> {
    try {
      const params = chainId ? { chainId, timeframe } : { timeframe };
      const response = await axios.get(`${this.baseURL}/transactions/stats`, { params });
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch transaction statistics');
      throw error;
    }
  }

  async getTransactions(params: {
    chainId?: number;
    status?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    transactions: any[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/transactions`, { params });
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch transactions');
      throw error;
    }
  }

  async retryTransaction(txHash: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/transaction/${txHash}/retry`);
      toast.success('Transaction retry initiated');
    } catch (error) {
      toast.error('Failed to retry transaction');
      throw error;
    }
  }

  async cancelTransaction(txHash: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/transaction/${txHash}/cancel`);
      toast.success('Transaction cancellation initiated');
    } catch (error) {
      toast.error('Failed to cancel transaction');
      throw error;
    }
  }

  // Smart Contract Management
  async getSmartContracts(chainId?: number): Promise<SmartContract[]> {
    try {
      const params = chainId ? { chainId } : {};
      const response = await axios.get(`${this.baseURL}/contracts`, { params });
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch smart contracts');
      throw error;
    }
  }

  async deploySmartContract(data: {
    chainId: number;
    bytecode: string;
    abi: any[];
    constructorParams: any[];
    name: string;
  }): Promise<{ contractAddress: string; txHash: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/contract/deploy`, data);
      toast.success('Smart contract deployment initiated');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to deploy smart contract');
      throw error;
    }
  }

  async updateContractStatus(contractId: string, status: 'active' | 'paused' | 'deprecated'): Promise<void> {
    try {
      await axios.patch(`${this.baseURL}/contract/${contractId}`, { status });
      toast.success(`Contract status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update contract status');
      throw error;
    }
  }

  // Gas Management
  async getGasTracker(chainId?: number): Promise<GasTracker[]> {
    try {
      const params = chainId ? { chainId } : {};
      const response = await axios.get(`${this.baseURL}/gas/tracker`, { params });
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch gas tracker data');
      throw error;
    }
  }

  async optimizeGasSettings(chainId: number, settings: {
    maxGasPrice: string;
    gasLimitMultiplier: number;
    enableDynamicFees: boolean;
  }): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/gas/${chainId}/optimize`, settings);
      toast.success('Gas optimization settings updated');
    } catch (error) {
      toast.error('Failed to update gas optimization settings');
      throw error;
    }
  }

  // Token Management
  async getTokens(params: {
    chainId?: number;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    tokens: any[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/tokens`, { params });
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch tokens');
      throw error;
    }
  }

  async addToken(tokenData: {
    chainId: number;
    address: string;
    name: string;
    symbol: string;
    decimals: number;
  }): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/tokens`, tokenData);
      toast.success('Token added successfully');
    } catch (error) {
      toast.error('Failed to add token');
      throw error;
    }
  }

  async removeToken(chainId: number, address: string): Promise<void> {
    try {
      await axios.delete(`${this.baseURL}/tokens/${chainId}/${address}`);
      toast.success('Token removed successfully');
    } catch (error) {
      toast.error('Failed to remove token');
      throw error;
    }
  }

  // Bridge Management
  async getBridgeOperations(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/bridge/operations`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch bridge operations');
      throw error;
    }
  }

  async initiateBridge(data: {
    fromChainId: number;
    toChainId: number;
    amount: string;
    tokenAddress: string;
    recipient: string;
  }): Promise<{ bridgeId: string; txHash: string }> {
    try {
      const response = await axios.post(`${this.baseURL}/bridge/initiate`, data);
      toast.success('Bridge operation initiated');
      return response.data.data;
    } catch (error) {
      toast.error('Failed to initiate bridge operation');
      throw error;
    }
  }

  // DeFi Integration Management
  async getDeFiProtocols(chainId?: number): Promise<any[]> {
    try {
      const params = chainId ? { chainId } : {};
      const response = await axios.get(`${this.baseURL}/defi/protocols`, { params });
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch DeFi protocols');
      throw error;
    }
  }

  async updateProtocolStatus(protocolId: string, enabled: boolean): Promise<void> {
    try {
      await axios.patch(`${this.baseURL}/defi/protocol/${protocolId}`, { enabled });
      toast.success(`Protocol ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      toast.error('Failed to update protocol status');
      throw error;
    }
  }

  // Monitoring & Analytics
  async getBlockchainMetrics(chainId: number, timeframe = '24h'): Promise<{
    transactions: number;
    volume: string;
    gasUsed: string;
    averageGasPrice: string;
    blockTime: number;
    networkUtilization: number;
  }> {
    try {
      const response = await axios.get(`${this.baseURL}/metrics/${chainId}`, {
        params: { timeframe }
      });
      return response.data.data;
    } catch (error) {
      toast.error(`Failed to fetch metrics for chain ${chainId}`);
      throw error;
    }
  }

  async getSystemAlerts(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseURL}/alerts`);
      return response.data.data;
    } catch (error) {
      toast.error('Failed to fetch system alerts');
      throw error;
    }
  }

  async acknowledgeAlert(alertId: string): Promise<void> {
    try {
      await axios.post(`${this.baseURL}/alerts/${alertId}/acknowledge`);
      toast.success('Alert acknowledged');
    } catch (error) {
      toast.error('Failed to acknowledge alert');
      throw error;
    }
  }
}

export default new CaaSAdminService();