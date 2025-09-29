'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowRightLeft,
  Download,
  Filter,
  Search,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  Send,
  Plus,
  Eye,
  Copy,
  ExternalLink,
  Shield,
  Zap
} from 'lucide-react'
import { format } from 'date-fns'

interface Transaction {
  id: string
  type: 'credit' | 'debit' | 'transfer' | 'swap' | 'mint' | 'burn'
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed'
  amount: number
  currency: string
  from: string
  to: string
  description: string
  timestamp: string
  fee: number
  network: 'tempo' | 'circle' | 'solana' | 'base'
  hash?: string
  metadata?: any
  compliance?: {
    status: 'passed' | 'failed' | 'reviewing'
    checks: string[]
    riskScore: number
  }
}

const mockTransactions: Transaction[] = [
  {
    id: 'tx_001',
    type: 'transfer',
    status: 'completed',
    amount: 50000,
    currency: 'USDC',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
    to: '0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed',
    description: 'Payment for services - Invoice #INV-2024-001',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    fee: 0.01,
    network: 'tempo',
    hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    compliance: {
      status: 'passed',
      checks: ['KYC', 'AML', 'Sanctions'],
      riskScore: 15
    }
  },
  {
    id: 'tx_002',
    type: 'mint',
    status: 'completed',
    amount: 1000000,
    currency: 'USDT',
    from: 'Treasury',
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
    description: 'Monthly treasury mint operation',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    fee: 0,
    network: 'circle',
    hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    compliance: {
      status: 'passed',
      checks: ['Multi-sig approval', 'Treasury limits'],
      riskScore: 5
    }
  },
  {
    id: 'tx_003',
    type: 'swap',
    status: 'processing',
    amount: 25000,
    currency: 'USDC → EURC',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
    description: 'Cross-currency swap for European operations',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    fee: 25,
    network: 'tempo',
    compliance: {
      status: 'reviewing',
      checks: ['Large transaction', 'Cross-border'],
      riskScore: 45
    }
  },
  {
    id: 'tx_004',
    type: 'debit',
    status: 'failed',
    amount: 150000,
    currency: 'USDC',
    from: '0x5aAeb6053f3E94C9b9A09f33669435E7Ef1BeAed',
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
    description: 'Insufficient balance for withdrawal',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    fee: 0,
    network: 'base',
    compliance: {
      status: 'failed',
      checks: ['Balance check'],
      riskScore: 0
    }
  },
  {
    id: 'tx_005',
    type: 'credit',
    status: 'completed',
    amount: 75000,
    currency: 'PYUSD',
    from: '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199',
    to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
    description: 'Customer payment received',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    fee: 0.05,
    network: 'tempo',
    hash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
    compliance: {
      status: 'passed',
      checks: ['KYC', 'AML'],
      riskScore: 20
    }
  },
  {
    id: 'tx_006',
    type: 'burn',
    status: 'pending',
    amount: 500000,
    currency: 'USDC',
    from: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb7',
    to: 'Burn Address',
    description: 'Quarterly token burn - awaiting multi-sig',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    fee: 0,
    network: 'circle',
    compliance: {
      status: 'reviewing',
      checks: ['Multi-sig pending (2/3)', 'Treasury approval'],
      riskScore: 10
    }
  }
]

export default function TransactionsManagement() {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(mockTransactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterNetwork, setFilterNetwork] = useState('all')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showSendModal, setShowSendModal] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  // Statistics
  const stats = {
    totalVolume: transactions.reduce((sum, tx) => tx.status === 'completed' ? sum + tx.amount : sum, 0),
    totalTransactions: transactions.length,
    pendingCount: transactions.filter(tx => tx.status === 'pending').length,
    failedCount: transactions.filter(tx => tx.status === 'failed').length,
    avgFee: transactions.reduce((sum, tx) => sum + tx.fee, 0) / transactions.length,
    successRate: (transactions.filter(tx => tx.status === 'completed').length / transactions.length * 100).toFixed(1)
  }

  useEffect(() => {
    let filtered = [...transactions]

    if (searchTerm) {
      filtered = filtered.filter(tx =>
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.hash?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(tx => tx.type === filterType)
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(tx => tx.status === filterStatus)
    }

    if (filterNetwork !== 'all') {
      filtered = filtered.filter(tx => tx.network === filterNetwork)
    }

    setFilteredTransactions(filtered)
  }, [searchTerm, filterType, filterStatus, filterNetwork, transactions])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false)
    }, 1000)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'processing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'reversed':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      default:
        return null
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'credit':
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />
      case 'debit':
        return <ArrowUpRight className="h-4 w-4 text-red-500" />
      case 'transfer':
        return <ArrowRightLeft className="h-4 w-4 text-blue-500" />
      case 'swap':
        return <RefreshCw className="h-4 w-4 text-purple-500" />
      case 'mint':
        return <Plus className="h-4 w-4 text-green-500" />
      case 'burn':
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getNetworkBadgeVariant = (network: string) => {
    switch (network) {
      case 'tempo':
        return 'default'
      case 'circle':
        return 'secondary'
      case 'solana':
        return 'outline'
      case 'base':
        return 'destructive'
      default:
        return 'default'
    }
  }

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' ' + currency
  }

  const formatAddress = (address: string) => {
    if (address === 'Treasury' || address === 'Burn Address') return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalVolume.toLocaleString()}</div>
            <p className="text-xs text-green-600 mt-1">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTransactions}</div>
            <p className="text-xs text-gray-600 mt-1">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.successRate}%</div>
            <div className="flex gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Healthy
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCount}</div>
            <p className="text-xs text-yellow-600 mt-1">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failedCount}</div>
            <p className="text-xs text-red-600 mt-1">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Fee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.avgFee.toFixed(4)}</div>
            <Badge variant="outline" className="text-xs mt-1">
              <Zap className="h-3 w-3 mr-1" />
              Tempo Optimized
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transaction History</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Send className="h-4 w-4 mr-2" />
                    New Transaction
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create New Transaction</DialogTitle>
                    <DialogDescription>
                      Send stablecoins using Tempo's high-speed network
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="recipient">Recipient Address</Label>
                        <Input id="recipient" placeholder="0x..." />
                      </div>
                      <div>
                        <Label htmlFor="amount">Amount</Label>
                        <Input id="amount" type="number" placeholder="0.00" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Select defaultValue="USDC">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USDC">USDC</SelectItem>
                            <SelectItem value="USDT">USDT</SelectItem>
                            <SelectItem value="EURC">EURC</SelectItem>
                            <SelectItem value="PYUSD">PYUSD</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="network">Network</Label>
                        <Select defaultValue="tempo">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tempo">Tempo (Fast & Cheap)</SelectItem>
                            <SelectItem value="circle">Circle (Fallback)</SelectItem>
                            <SelectItem value="base">Base</SelectItem>
                            <SelectItem value="solana">Solana</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" placeholder="Payment for..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowSendModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setShowSendModal(false)}>
                      Send Transaction
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search by ID, address, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                  <SelectItem value="debit">Debit</SelectItem>
                  <SelectItem value="transfer">Transfer</SelectItem>
                  <SelectItem value="swap">Swap</SelectItem>
                  <SelectItem value="mint">Mint</SelectItem>
                  <SelectItem value="burn">Burn</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="reversed">Reversed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterNetwork} onValueChange={setFilterNetwork}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Networks</SelectItem>
                  <SelectItem value="tempo">Tempo</SelectItem>
                  <SelectItem value="circle">Circle</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="solana">Solana</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>From/To</TableHead>
                  <TableHead>Network</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Compliance</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{tx.id}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                          {tx.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(tx.type)}
                        <span className="capitalize">{tx.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {tx.type === 'swap' ? tx.currency : formatAmount(tx.amount, tx.currency)}
                      </div>
                      {tx.fee > 0 && (
                        <div className="text-xs text-gray-500">Fee: ${tx.fee}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs">
                        <div>From: {formatAddress(tx.from)}</div>
                        <div>To: {formatAddress(tx.to)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getNetworkBadgeVariant(tx.network)}>
                        {tx.network.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(tx.status)}
                        <span className="capitalize">{tx.status}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tx.compliance && (
                        <div className="flex items-center gap-2">
                          <Shield className={`h-4 w-4 ${
                            tx.compliance.status === 'passed' ? 'text-green-500' :
                            tx.compliance.status === 'failed' ? 'text-red-500' :
                            'text-yellow-500'
                          }`} />
                          <div>
                            <div className="text-xs capitalize">{tx.compliance.status}</div>
                            <div className="text-xs text-gray-500">Risk: {tx.compliance.riskScore}%</div>
                          </div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-gray-500">
                        {format(new Date(tx.timestamp), 'MMM dd, HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[700px]">
                          <DialogHeader>
                            <DialogTitle>Transaction Details</DialogTitle>
                            <DialogDescription>
                              Complete transaction information and blockchain details
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>Transaction ID</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-mono text-sm">{tx.id}</span>
                                  <Button variant="ghost" size="sm">
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              <div>
                                <Label>Status</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  {getStatusIcon(tx.status)}
                                  <span className="capitalize">{tx.status}</span>
                                </div>
                              </div>
                            </div>
                            {tx.hash && (
                              <div>
                                <Label>Transaction Hash</Label>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="font-mono text-xs truncate">{tx.hash}</span>
                                  <Button variant="ghost" size="sm">
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label>From Address</Label>
                                <span className="font-mono text-sm">{tx.from}</span>
                              </div>
                              <div>
                                <Label>To Address</Label>
                                <span className="font-mono text-sm">{tx.to}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Amount</Label>
                                <div className="font-medium">{formatAmount(tx.amount, tx.currency)}</div>
                              </div>
                              <div>
                                <Label>Network Fee</Label>
                                <div className="font-medium">${tx.fee}</div>
                              </div>
                              <div>
                                <Label>Network</Label>
                                <Badge variant={getNetworkBadgeVariant(tx.network)}>
                                  {tx.network.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                            {tx.compliance && (
                              <div>
                                <Label>Compliance Checks</Label>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {tx.compliance.checks.map((check, idx) => (
                                    <Badge key={idx} variant="outline">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      {check}
                                    </Badge>
                                  ))}
                                </div>
                                <div className="mt-2 text-sm">
                                  Risk Score: <span className="font-medium">{tx.compliance.riskScore}%</span>
                                </div>
                              </div>
                            )}
                            <div>
                              <Label>Description</Label>
                              <p className="text-sm text-gray-600 mt-1">{tx.description}</p>
                            </div>
                            <div>
                              <Label>Timestamp</Label>
                              <p className="text-sm text-gray-600 mt-1">
                                {format(new Date(tx.timestamp), 'PPpp')}
                              </p>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button variant="outline">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View on Explorer
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-gray-500">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}