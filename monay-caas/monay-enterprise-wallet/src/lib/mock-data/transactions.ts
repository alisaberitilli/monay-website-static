export interface Transaction {
  id: string
  type: 'payment' | 'transfer' | 'deposit' | 'withdrawal' | 'swap' | 'mint' | 'burn'
  status: 'pending' | 'completed' | 'failed' | 'reversed'
  amount: number
  currency: string
  from: string
  to: string
  timestamp: string
  hash?: string
  network: 'base' | 'solana' | 'ethereum' | 'polygon'
  fee: number
  description: string
  metadata?: {
    invoiceId?: string
    cardId?: string
    tokenAddress?: string
    gasUsed?: string
    blockNumber?: number
  }
}

export const mockTransactions: Transaction[] = [
  {
    id: 'TXN-001',
    type: 'payment',
    status: 'completed',
    amount: 2500.00,
    currency: 'USDM',
    from: 'enterprise-wallet.eth',
    to: 'vendor-001.eth',
    timestamp: '2024-01-26T10:30:00Z',
    hash: '0xabc123def456789...',
    network: 'base',
    fee: 0.50,
    description: 'Payment for cloud services',
    metadata: {
      invoiceId: 'INV-2024-001',
      blockNumber: 12345678
    }
  },
  {
    id: 'TXN-002',
    type: 'transfer',
    status: 'pending',
    amount: 10000.00,
    currency: 'USDM',
    from: 'treasury.eth',
    to: 'enterprise-wallet.eth',
    timestamp: '2024-01-26T09:15:00Z',
    network: 'base',
    fee: 1.00,
    description: 'Treasury allocation',
  },
  {
    id: 'TXN-003',
    type: 'swap',
    status: 'completed',
    amount: 5000.00,
    currency: 'USDM',
    from: 'enterprise-wallet.sol',
    to: 'enterprise-wallet.eth',
    timestamp: '2024-01-26T08:45:00Z',
    hash: '0xdef789abc123456...',
    network: 'solana',
    fee: 2.50,
    description: 'Cross-rail swap: Solana to Base',
    metadata: {
      tokenAddress: '0x1234567890abcdef...'
    }
  },
  {
    id: 'TXN-004',
    type: 'deposit',
    status: 'completed',
    amount: 50000.00,
    currency: 'USD',
    from: 'Chase Bank ****1234',
    to: 'enterprise-wallet.eth',
    timestamp: '2024-01-25T16:20:00Z',
    network: 'base',
    fee: 25.00,
    description: 'ACH deposit from bank account',
  },
  {
    id: 'TXN-005',
    type: 'mint',
    status: 'completed',
    amount: 100000.00,
    currency: 'USDM',
    from: 'minter.eth',
    to: 'treasury.eth',
    timestamp: '2024-01-25T14:30:00Z',
    hash: '0x789abc123def456...',
    network: 'base',
    fee: 5.00,
    description: 'USDM token minting',
    metadata: {
      tokenAddress: '0xUSDM...',
      gasUsed: '150000'
    }
  },
  {
    id: 'TXN-006',
    type: 'payment',
    status: 'failed',
    amount: 750.00,
    currency: 'USDM',
    from: 'enterprise-wallet.eth',
    to: 'merchant-002.eth',
    timestamp: '2024-01-25T11:00:00Z',
    network: 'base',
    fee: 0.50,
    description: 'Payment failed - Insufficient funds',
  },
  {
    id: 'TXN-007',
    type: 'withdrawal',
    status: 'completed',
    amount: 3000.00,
    currency: 'USD',
    from: 'enterprise-wallet.eth',
    to: 'Wells Fargo ****5678',
    timestamp: '2024-01-24T15:45:00Z',
    network: 'base',
    fee: 10.00,
    description: 'Wire transfer withdrawal',
  },
  {
    id: 'TXN-008',
    type: 'burn',
    status: 'completed',
    amount: 25000.00,
    currency: 'USDM',
    from: 'treasury.eth',
    to: '0x0000000000000000000000000000000000000000',
    timestamp: '2024-01-24T10:30:00Z',
    hash: '0xabc456def789123...',
    network: 'base',
    fee: 3.00,
    description: 'Token burn for supply adjustment',
    metadata: {
      tokenAddress: '0xUSDM...',
      gasUsed: '100000'
    }
  }
]

export const getTransactionById = (id: string): Transaction | undefined => {
  return mockTransactions.find(tx => tx.id === id)
}

export const getTransactionsByType = (type: Transaction['type']): Transaction[] => {
  return mockTransactions.filter(tx => tx.type === type)
}

export const getTransactionsByStatus = (status: Transaction['status']): Transaction[] => {
  return mockTransactions.filter(tx => tx.status === status)
}

export const getRecentTransactions = (limit: number = 5): Transaction[] => {
  return [...mockTransactions]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)
}