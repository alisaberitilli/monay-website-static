'use client'

import { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'

const API_URL = 'http://localhost:3001/api'

interface Transaction {
  id: string
  type: 'payment' | 'transfer' | 'mint' | 'burn' | 'cross-rail' | 'invoice'
  direction: 'inbound' | 'outbound'
  amount: number
  currency: string
  from: string
  to: string
  chain: string
  status: 'completed' | 'pending' | 'processing' | 'failed'
  timestamp: string
  fee: number
  hash?: string
  metadata?: any
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    chain: 'all',
    direction: 'all',
    dateRange: '30d'
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)

  // Mock transactions data
  useEffect(() => {
    const mockTransactions: Transaction[] = [
      {
        id: 'tx-001',
        type: 'payment',
        direction: 'outbound',
        amount: 125000,
        currency: 'USDM',
        from: '0x1234...abcd',
        to: 'Acme Corporation',
        chain: 'Base',
        status: 'completed',
        timestamp: '2024-01-30T14:23:00Z',
        fee: 25,
        hash: '0xabc123...def456'
      },
      {
        id: 'tx-002',
        type: 'cross-rail',
        direction: 'outbound',
        amount: 50000,
        currency: 'USDM',
        from: 'Base',
        to: 'Solana',
        chain: 'Cross-Chain',
        status: 'processing',
        timestamp: '2024-01-30T12:15:00Z',
        fee: 50,
        metadata: { bridgeTime: '45s' }
      },
      {
        id: 'tx-003',
        type: 'mint',
        direction: 'inbound',
        amount: 100000,
        currency: 'USDM',
        from: 'Treasury',
        to: '0x1234...abcd',
        chain: 'Base',
        status: 'completed',
        timestamp: '2024-01-29T16:45:00Z',
        fee: 10,
        hash: '0xdef789...ghi012'
      },
      {
        id: 'tx-004',
        type: 'invoice',
        direction: 'inbound',
        amount: 7085,
        currency: 'USD',
        from: 'CloudTech Solutions',
        to: 'Monay Enterprise',
        chain: 'Traditional',
        status: 'pending',
        timestamp: '2024-01-29T10:30:00Z',
        fee: 0,
        metadata: { invoiceNumber: 'INV-2024-001' }
      },
      {
        id: 'tx-005',
        type: 'transfer',
        direction: 'outbound',
        amount: 25000,
        currency: 'USDC',
        from: '0x5678...efgh',
        to: '0x9012...ijkl',
        chain: 'Solana',
        status: 'completed',
        timestamp: '2024-01-28T09:20:00Z',
        fee: 0.5,
        hash: '3xYz...123abc'
      }
    ]

    setTransactions(mockTransactions)
    setFilteredTransactions(mockTransactions)
  }, [])

  // Apply filters and search
  useEffect(() => {
    let filtered = [...transactions]

    // Apply type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(tx => tx.type === filters.type)
    }

    // Apply status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(tx => tx.status === filters.status)
    }

    // Apply chain filter
    if (filters.chain !== 'all') {
      filtered = filtered.filter(tx => tx.chain === filters.chain)
    }

    // Apply direction filter
    if (filters.direction !== 'all') {
      filtered = filtered.filter(tx => tx.direction === filters.direction)
    }

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(tx => 
        tx.id.toLowerCase().includes(query) ||
        tx.from.toLowerCase().includes(query) ||
        tx.to.toLowerCase().includes(query) ||
        tx.hash?.toLowerCase().includes(query) ||
        tx.amount.toString().includes(query)
      )
    }

    // Apply sorting
    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.timestamp).getTime()
        const dateB = new Date(b.timestamp).getTime()
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
      } else {
        return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount
      }
    })

    setFilteredTransactions(filtered)
  }, [transactions, filters, searchQuery, sortBy, sortOrder])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'processing': return 'bg-blue-100 text-blue-700'
      case 'failed': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return '💳'
      case 'transfer': return '↔️'
      case 'mint': return '🏭'
      case 'burn': return '🔥'
      case 'cross-rail': return '🔄'
      case 'invoice': return '📄'
      default: return '📍'
    }
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0)
    const fees = filteredTransactions.reduce((sum, tx) => sum + tx.fee, 0)
    const completed = filteredTransactions.filter(tx => tx.status === 'completed').length
    const pending = filteredTransactions.filter(tx => tx.status === 'pending').length

    return {
      totalVolume: total,
      totalFees: fees,
      completedCount: completed,
      pendingCount: pending,
      successRate: filteredTransactions.length > 0 
        ? Math.round((completed / filteredTransactions.length) * 100) 
        : 0
    }
  }, [filteredTransactions])

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Total Volume</p>
          <p className="text-2xl font-bold mt-1">${stats.totalVolume.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-1">Last 30 days</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Total Fees</p>
          <p className="text-2xl font-bold mt-1">${stats.totalFees.toFixed(2)}</p>
          <p className="text-sm text-blue-600 mt-1">0.02% avg</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Transactions</p>
          <p className="text-2xl font-bold mt-1">{filteredTransactions.length}</p>
          <p className="text-sm text-green-600 mt-1">{stats.completedCount} completed</p>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <p className="text-sm text-gray-500">Success Rate</p>
          <p className="text-2xl font-bold mt-1">{stats.successRate}%</p>
          <p className="text-sm text-yellow-600 mt-1">{stats.pendingCount} pending</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by ID, address, amount..."
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="payment">Payments</option>
            <option value="transfer">Transfers</option>
            <option value="mint">Mints</option>
            <option value="burn">Burns</option>
            <option value="cross-rail">Cross-Rail</option>
            <option value="invoice">Invoices</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>

          {/* Chain Filter */}
          <select
            value={filters.chain}
            onChange={(e) => setFilters({ ...filters, chain: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Chains</option>
            <option value="Base">Base</option>
            <option value="Solana">Solana</option>
            <option value="Cross-Chain">Cross-Chain</option>
            <option value="Traditional">Traditional</option>
          </select>

          {/* Direction Filter */}
          <select
            value={filters.direction}
            onChange={(e) => setFilters({ ...filters, direction: e.target.value })}
            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Directions</option>
            <option value="inbound">Inbound</option>
            <option value="outbound">Outbound</option>
          </select>

          {/* Sort Options */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 border rounded-lg hover:bg-gray-50"
            >
              {sortOrder === 'desc' ? '↓' : '↑'}
            </button>
          </div>

          {/* Export Button */}
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export CSV
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Transaction</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Type</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">From/To</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Amount</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Chain</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Time</th>
                <th className="text-left p-4 text-sm font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getTypeIcon(tx.type)}</span>
                      <div>
                        <p className="font-medium text-sm">{tx.id}</p>
                        {tx.hash && (
                          <p className="text-xs text-gray-500 font-mono">{tx.hash}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      tx.direction === 'inbound' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {tx.direction === 'inbound' ? '↓' : '↑'} {tx.type}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <p className="text-gray-900">From: {tx.from}</p>
                      <p className="text-gray-500">To: {tx.to}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <div>
                      <p className="font-bold">{tx.amount.toLocaleString()} {tx.currency}</p>
                      <p className="text-xs text-gray-500">Fee: ${tx.fee}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      {tx.chain}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {format(new Date(tx.timestamp), 'MMM dd, HH:mm')}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedTransaction(tx)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="p-8 text-center">
            <svg className="w-12 h-12 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="mt-2 text-gray-500">No transactions found</p>
            <p className="mt-1 text-sm text-gray-400">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold">Transaction Details</h3>
                <button
                  onClick={() => setSelectedTransaction(null)}
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  <p className="font-mono font-medium">{selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <span className={`inline-block px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(selectedTransaction.status)}`}>
                    {selectedTransaction.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Type</p>
                  <p className="font-medium">{selectedTransaction.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Direction</p>
                  <p className="font-medium">{selectedTransaction.direction}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Amount</p>
                  <p className="font-bold text-lg">{selectedTransaction.amount.toLocaleString()} {selectedTransaction.currency}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fee</p>
                  <p className="font-medium">${selectedTransaction.fee}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-medium">{selectedTransaction.from}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">To</p>
                  <p className="font-medium">{selectedTransaction.to}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Chain</p>
                  <p className="font-medium">{selectedTransaction.chain}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Timestamp</p>
                  <p className="font-medium">{format(new Date(selectedTransaction.timestamp), 'PPpp')}</p>
                </div>
              </div>

              {selectedTransaction.hash && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Transaction Hash</p>
                  <p className="font-mono text-xs bg-gray-50 p-3 rounded-lg break-all">{selectedTransaction.hash}</p>
                </div>
              )}

              {selectedTransaction.metadata && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Additional Information</p>
                  <pre className="text-xs bg-gray-50 p-3 rounded-lg overflow-x-auto">
                    {JSON.stringify(selectedTransaction.metadata, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  View on Explorer
                </button>
                <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  Download Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}