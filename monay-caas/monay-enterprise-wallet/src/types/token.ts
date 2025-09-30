/**
 * TypeScript Type Definitions for Token Management
 * Enterprise Wallet Token Operations
 */

// Token Standards
export type TokenStandard = 'ERC-20' | 'ERC-721' | 'ERC-1155' | 'ERC-3643' | 'SPL' | 'Token-2022';

// Token Types
export type TokenType = 'fungible' | 'non-fungible' | 'semi-fungible';

// Token Status
export type TokenStatus = 'active' | 'paused' | 'frozen' | 'deprecated';

// Chain Types
export type ChainType = 'ethereum' | 'polygon' | 'base' | 'solana' | 'avalanche';

// Distribution Types
export type DistributionType = 'airdrop' | 'vesting' | 'staking' | 'manual' | 'automated';

// Compliance Level
export type ComplianceLevel = 'none' | 'basic' | 'enhanced' | 'institutional';

// Token Metadata
export interface TokenMetadata {
  name: string;
  symbol: string;
  decimals: number;
  description?: string;
  logo?: string;
  website?: string;
  whitepaper?: string;
  social?: {
    twitter?: string;
    telegram?: string;
    discord?: string;
  };
  tags?: string[];
}

// Token Configuration
export interface TokenConfig {
  standard: TokenStandard;
  type: TokenType;
  chain: ChainType;
  complianceLevel: ComplianceLevel;

  // Supply Configuration
  supply: {
    initial: bigint;
    max?: bigint;
    mintable: boolean;
    burnable: boolean;
    pausable: boolean;
    freezable: boolean;
  };

  // Access Control
  roles: {
    minter?: string[];
    burner?: string[];
    pauser?: string[];
    freezer?: string[];
    admin?: string[];
  };

  // Compliance Settings
  compliance?: {
    kycRequired: boolean;
    accreditationRequired: boolean;
    jurisdictionRestrictions?: string[];
    transferRestrictions?: {
      minHoldPeriod?: number;
      maxTransferAmount?: bigint;
      whitelistRequired?: boolean;
    };
  };
}

// Main Token Interface
export interface Token {
  id: string;
  contractAddress: string;
  chainId: number;
  metadata: TokenMetadata;
  config: TokenConfig;
  status: TokenStatus;

  // Supply Data
  supply: {
    total: bigint;
    circulating: bigint;
    locked: bigint;
    burned: bigint;
    reserved: bigint;
  };

  // Metrics
  metrics: {
    holders: number;
    transactions: number;
    volume24h: bigint;
    marketCap?: bigint;
    price?: number;
  };

  // Timestamps
  createdAt: Date;
  deployedAt: Date;
  updatedAt: Date;
  lastActivityAt?: Date;
}

// Mint Request
export interface MintRequest {
  tokenId: string;
  recipient: string;
  amount: bigint;
  reason: string;
  metadata?: Record<string, any>;

  // Approval
  requiresApproval: boolean;
  approvals?: Array<{
    approver: string;
    approved: boolean;
    timestamp: Date;
    comment?: string;
  }>;

  // Execution
  status: 'pending' | 'approved' | 'executed' | 'rejected' | 'cancelled';
  txHash?: string;
  executedAt?: Date;
}

// Burn Request
export interface BurnRequest {
  tokenId: string;
  source: string;
  amount: bigint;
  reason: string;

  // Approval
  requiresApproval: boolean;
  approvals?: Array<{
    approver: string;
    approved: boolean;
    timestamp: Date;
    comment?: string;
  }>;

  // Execution
  status: 'pending' | 'approved' | 'executed' | 'rejected' | 'cancelled';
  txHash?: string;
  executedAt?: Date;
}

// Distribution Campaign
export interface DistributionCampaign {
  id: string;
  tokenId: string;
  name: string;
  type: DistributionType;

  // Recipients
  recipients: Array<{
    address: string;
    amount: bigint;
    claimed?: boolean;
    claimedAt?: Date;
  }>;

  // Configuration
  config: {
    totalAmount: bigint;
    startDate: Date;
    endDate?: Date;
    claimDeadline?: Date;

    // Vesting specific
    vesting?: {
      cliff?: number; // months
      duration: number; // months
      releasePeriod: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    };
  };

  // Status
  status: 'draft' | 'scheduled' | 'active' | 'completed' | 'cancelled';
  stats: {
    distributed: bigint;
    claimed: bigint;
    remaining: bigint;
    recipientsClaimed: number;
    recipientsTotal: number;
  };

  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// Bridge Transfer
export interface BridgeTransfer {
  id: string;
  tokenId: string;

  // Transfer Details
  sourceChain: ChainType;
  targetChain: ChainType;
  amount: bigint;
  sender: string;
  recipient: string;

  // Status
  status: 'initiated' | 'locked' | 'minted' | 'completed' | 'failed';

  // Transaction Details
  sourceTxHash?: string;
  targetTxHash?: string;
  bridgeFee: bigint;
  estimatedTime: number; // seconds

  // Timestamps
  initiatedAt: Date;
  lockedAt?: Date;
  mintedAt?: Date;
  completedAt?: Date;

  // Error Handling
  error?: {
    code: string;
    message: string;
    timestamp: Date;
  };
}

// Token Analytics
export interface TokenAnalytics {
  tokenId: string;
  period: 'day' | 'week' | 'month' | 'year' | 'all';

  // Supply Metrics
  supplyMetrics: Array<{
    date: Date;
    total: bigint;
    circulating: bigint;
    locked: bigint;
    burned: bigint;
  }>;

  // Holder Metrics
  holderMetrics: Array<{
    date: Date;
    totalHolders: number;
    newHolders: number;
    activeHolders: number;
  }>;

  // Transaction Metrics
  transactionMetrics: Array<{
    date: Date;
    count: number;
    volume: bigint;
    avgSize: bigint;
    uniqueSenders: number;
  }>;

  // Distribution Metrics
  distributionMetrics: {
    topHolders: Array<{
      address: string;
      balance: bigint;
      percentage: number;
    }>;
    giniCoefficient: number;
    concentrationRisk: 'low' | 'medium' | 'high';
  };
}

// Token Creation Request
export interface CreateTokenRequest {
  metadata: TokenMetadata;
  config: TokenConfig;
  initialDistribution?: Array<{
    address: string;
    amount: bigint;
    lockPeriod?: number; // days
  }>;
  deployImmediately: boolean;
  testnet: boolean;
}

// Token Operation Response
export interface TokenOperationResponse {
  success: boolean;
  tokenId?: string;
  contractAddress?: string;
  txHash?: string;
  blockNumber?: number;
  gasUsed?: bigint;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

// Token List Filter
export interface TokenListFilter {
  chains?: ChainType[];
  standards?: TokenStandard[];
  status?: TokenStatus[];
  complianceLevels?: ComplianceLevel[];
  search?: string;
  sortBy?: 'name' | 'created' | 'supply' | 'holders' | 'activity';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Token Permission
export interface TokenPermission {
  tokenId: string;
  address: string;
  role: 'minter' | 'burner' | 'pauser' | 'admin';
  grantedBy: string;
  grantedAt: Date;
  expiresAt?: Date;
  active: boolean;
}