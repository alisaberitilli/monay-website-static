'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  Wallet,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Link,
  Copy,
  ExternalLink,
  Settings,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Building,
  User,
  CreditCard,
  Coins,
  Bitcoin,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
  MoreVertical,
  QrCode,
  Key,
  Send,
  ArrowRight
} from 'lucide-react'

interface WalletData {
  id: string
  name: string
  type: 'enterprise' | 'consumer' | 'treasury' | 'custodial'
  rail: 'evm' | 'solana' | 'cross-rail'
  address: string
  network: string
  balance: {
    native: number
    usd: number
    tokens: Array<{
      symbol: string
      balance: number
      usdValue: number
    }>
  }
  status: 'active' | 'frozen' | 'pending' | 'restricted'
  owner: string
  created: string
  lastActivity: string
  dailyVolume: number
  monthlyVolume: number
  transactionCount: number
  compliance: {
    kycStatus: 'verified' | 'pending' | 'failed'
    amlRisk: 'low' | 'medium' | 'high'
    sanctionsCheck: 'clear' | 'flagged'
  }
  features: string[]
}

export default function WalletsPage() {
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filterType, setFilterType] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const [selectedTab, setSelectedTab] = useState('overview')

  // Mock wallet data
  const wallets: WalletData[] = [
    {
      id: 'wal_1',
      name: 'Treasury Operations',
      type: 'treasury',
      rail: 'cross-rail',
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1',
      network: 'Base',
      balance: {
        native: 125.5,
        usd: 425850,
        tokens: [
          { symbol: 'USDC', balance: 250000, usdValue: 250000 },
          { symbol: 'USDT', balance: 175850, usdValue: 175850 }
        ]
      },
      status: 'active',
      owner: 'Finance Department',
      created: '2024-01-15',
      lastActivity: '2 hours ago',
      dailyVolume: 125000,
      monthlyVolume: 3500000,
      transactionCount: 1247,
      compliance: {
        kycStatus: 'verified',
        amlRisk: 'low',
        sanctionsCheck: 'clear'
      },
      features: ['multi-sig', 'auto-sweep', 'cross-rail']
    },
    {
      id: 'wal_2',
      name: 'Enterprise Payroll',
      type: 'enterprise',
      rail: 'evm',
      address: '0x8Ba1f109551bD432803012645Ac136ddd64DBA22',
      network: 'Polygon zkEVM',
      balance: {
        native: 45.2,
        usd: 185420,
        tokens: [
          { symbol: 'USDC', balance: 185420, usdValue: 185420 }
        ]
      },
      status: 'active',
      owner: 'HR Department',
      created: '2024-02-20',
      lastActivity: '5 hours ago',
      dailyVolume: 45000,
      monthlyVolume: 1250000,
      transactionCount: 523,
      compliance: {
        kycStatus: 'verified',
        amlRisk: 'low',
        sanctionsCheck: 'clear'
      },
      features: ['batch-payments', 'scheduled-transfers']
    },
    {
      id: 'wal_3',
      name: 'Customer Rewards Pool',
      type: 'consumer',
      rail: 'solana',
      address: 'HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH',
      network: 'Solana',
      balance: {
        native: 250,
        usd: 75230,
        tokens: [
          { symbol: 'USDC', balance: 50000, usdValue: 50000 },
          { symbol: 'MNAY', balance: 100000, usdValue: 25230 }
        ]
      },
      status: 'active',
      owner: 'Marketing Team',
      created: '2024-03-10',
      lastActivity: '30 minutes ago',
      dailyVolume: 12500,
      monthlyVolume: 380000,
      transactionCount: 8934,
      compliance: {
        kycStatus: 'verified',
        amlRisk: 'low',
        sanctionsCheck: 'clear'
      },
      features: ['instant-payments', 'reward-distribution']
    },
    {
      id: 'wal_4',
      name: 'Vendor Payments',
      type: 'enterprise',
      rail: 'evm',
      address: '0x3f5CE5FBFe3E9af3971dD833D26BA9b5C936f0bE',
      network: 'Base',
      balance: {
        native: 18.7,
        usd: 52180,
        tokens: [
          { symbol: 'USDC', balance: 52180, usdValue: 52180 }
        ]
      },
      status: 'restricted',
      owner: 'Procurement',
      created: '2024-04-05',
      lastActivity: '1 day ago',
      dailyVolume: 8200,
      monthlyVolume: 245000,
      transactionCount: 156,
      compliance: {
        kycStatus: 'pending',
        amlRisk: 'medium',
        sanctionsCheck: 'clear'
      },
      features: ['invoice-based', 'approval-workflow']
    },
    {
      id: 'wal_5',
      name: 'Mobile App Wallets',
      type: 'consumer',
      rail: 'solana',
      address: 'FKyBko7LbfSQsRW9QkPhHq4xYyqzJUqcY9uZvXqkZKJx',
      network: 'Solana',
      balance: {
        native: 892.3,
        usd: 425780,
        tokens: [
          { symbol: 'USDC', balance: 325780, usdValue: 325780 },
          { symbol: 'SOL', balance: 892.3, usdValue: 100000 }
        ]
      },
      status: 'active',
      owner: 'Consumer Services',
      created: '2024-01-20',
      lastActivity: '5 minutes ago',
      dailyVolume: 85400,
      monthlyVolume: 2450000,
      transactionCount: 45678,
      compliance: {
        kycStatus: 'verified',
        amlRisk: 'low',
        sanctionsCheck: 'clear'
      },
      features: ['mobile-native', 'biometric-auth', 'instant-swap']
    }
  ]

  const filteredWallets = wallets.filter(wallet => {
    const matchesType = filterType === 'all' || wallet.type === filterType
    const matchesSearch = wallet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          wallet.address.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  const totalBalance = wallets.reduce((sum, w) => sum + w.balance.usd, 0)
  const totalDailyVolume = wallets.reduce((sum, w) => sum + w.dailyVolume, 0)
  const activeWallets = wallets.filter(w => w.status === 'active').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'frozen': return 'bg-blue-100 text-blue-700'
      case 'restricted': return 'bg-orange-100 text-orange-700'
      case 'pending': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getRailColor = (rail: string) => {
    switch (rail) {
      case 'evm': return 'bg-purple-100 text-purple-700'
      case 'solana': return 'bg-cyan-100 text-cyan-700'
      case 'cross-rail': return 'bg-indigo-100 text-indigo-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success('Address copied to clipboard')
  }

  const handleCreateWallet = () => {
    toast.success('Wallet creation initiated')
    setShowCreateDialog(false)
  }

  return (
    <div className="space-y-6">
      {/* Wallet Details Modal */}
      {selectedWallet && (
        <Dialog open={!!selectedWallet} onOpenChange={() => setSelectedWallet(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <Wallet className="h-6 w-6 text-blue-600" />
                {selectedWallet.name}
              </DialogTitle>
              <DialogDescription>
                Wallet details and configuration
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Wallet Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Wallet Address</Label>
                  <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                    <code className="text-sm flex-1 break-all">{selectedWallet.address}</code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyAddress(selectedWallet.address)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Network</Label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Badge variant="secondary">{selectedWallet.network}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Type</Label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Badge variant="secondary">{selectedWallet.type}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Rail</Label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Badge className={cn(getRailColor(selectedWallet.rail))}>{selectedWallet.rail}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-gray-500">Status</Label>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <Badge className={getStatusColor(selectedWallet.status)}>{selectedWallet.status}</Badge>
                  </div>
                </div>
              </div>

              {/* Balance Info */}
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">Total Balance</p>
                      <p className="text-2xl font-bold mt-1">${selectedWallet.balance.usd.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Tokens</p>
                      <div className="mt-2 space-y-1">
                        {selectedWallet.balance.tokens.map((token, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="font-medium">{token.symbol}</span>
                            <span>{token.balance.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Business Rules Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      Business Rules & Policies
                    </h3>
                    <p className="text-sm text-gray-500">Configure compliance and transaction rules for this wallet</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      toast.success('Opening business rules configuration...')
                      // Navigate to business rules page with wallet context
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>

                {/* Active Rules */}
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm">Daily Transaction Limit</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 ml-6">Maximum $50,000 per day</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm">AML Screening Required</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 ml-6">Transactions over $10,000 require AML check</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="font-medium text-sm">KYC Verification</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1 ml-6">All recipients must be KYC verified</p>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      toast.info('Navigating to business rules configuration...')
                      // Would navigate to /business-rules with wallet filter
                    }}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configure All Business Rules
                  </Button>
                </div>
              </div>

              {/* Features */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Enabled Features</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedWallet.features.map((feature, idx) => (
                    <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Compliance */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Compliance Status</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">KYC Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{selectedWallet.compliance.kycStatus}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">AML Risk</p>
                    <div className="flex items-center gap-2 mt-1">
                      <AlertCircle className={cn(
                        "h-4 w-4",
                        selectedWallet.compliance.amlRisk === 'low' ? 'text-green-600' :
                        selectedWallet.compliance.amlRisk === 'medium' ? 'text-orange-600' : 'text-red-600'
                      )} />
                      <span className="text-sm font-medium">{selectedWallet.compliance.amlRisk}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Sanctions Check</p>
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">{selectedWallet.compliance.sanctionsCheck}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Activity</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Created</p>
                    <p className="text-sm font-medium mt-1">{selectedWallet.created}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Last Activity</p>
                    <p className="text-sm font-medium mt-1">{selectedWallet.lastActivity}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Daily Volume</p>
                    <p className="text-sm font-medium mt-1">${selectedWallet.dailyVolume.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Transactions</p>
                    <p className="text-sm font-medium mt-1">{selectedWallet.transactionCount}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(`https://sepolia.basescan.org/address/${selectedWallet.address}`, '_blank')
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View on Explorer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast.info('Opening wallet settings...')}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Wallet Settings
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast.info('Generating QR code...')}
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Show QR Code
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => toast.success('Wallet details exported')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Details
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedWallet(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Wallets</h1>
          <p className="text-gray-600 mt-2">Manage enterprise and consumer wallets across multiple rails</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Wallet</DialogTitle>
              <DialogDescription>
                Configure and deploy a new wallet for your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="wallet-name">Wallet Name</Label>
                <Input id="wallet-name" placeholder="e.g., Treasury Operations" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wallet-type">Wallet Type</Label>
                  <Select>
                    <SelectTrigger id="wallet-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="consumer">Consumer</SelectItem>
                      <SelectItem value="treasury">Treasury</SelectItem>
                      <SelectItem value="custodial">Custodial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blockchain">Blockchain Rail</Label>
                  <Select>
                    <SelectTrigger id="blockchain">
                      <SelectValue placeholder="Select rail" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="evm-base">EVM - Base</SelectItem>
                      <SelectItem value="evm-polygon">EVM - Polygon zkEVM</SelectItem>
                      <SelectItem value="solana">Solana</SelectItem>
                      <SelectItem value="cross-rail">Cross-Rail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Features</Label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Multi-signature</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Auto-sweep</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Scheduled payments</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">Invoice-based</span>
                  </label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateWallet}>
                Create Wallet
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold mt-1">
                  ${totalBalance.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5% from last month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Daily Volume</p>
                <p className="text-2xl font-bold mt-1">
                  ${totalDailyVolume.toLocaleString()}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <Activity className="h-3 w-3 mr-1" />
                  245 transactions today
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Activity className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Wallets</p>
                <p className="text-2xl font-bold mt-1">{activeWallets}</p>
                <p className="text-xs text-gray-600 mt-1">
                  of {wallets.length} total wallets
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Wallet className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold mt-1">98.5%</p>
                <p className="text-xs text-green-600 mt-1 flex items-center">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  All checks passing
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <Shield className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search wallets by name or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Wallets</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
                <SelectItem value="consumer">Consumer</SelectItem>
                <SelectItem value="treasury">Treasury</SelectItem>
                <SelectItem value="custodial">Custodial</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Wallets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Wallet Inventory</CardTitle>
          <CardDescription>
            {filteredWallets.length} wallets found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Wallet</TableHead>
                <TableHead>Type/Rail</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Daily Volume</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWallets.map((wallet) => (
                <TableRow key={wallet.id} className="cursor-pointer hover:bg-gray-50">
                  <TableCell>
                    <div>
                      <div className="font-medium">{wallet.name}</div>
                      <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                        {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleCopyAddress(wallet.address)
                          }}
                          className="hover:text-gray-700"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Badge variant="secondary" className="w-fit">
                        {wallet.type}
                      </Badge>
                      <Badge className={cn('w-fit', getRailColor(wallet.rail))}>
                        {wallet.rail}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">${wallet.balance.usd.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">
                        {wallet.balance.tokens.length} tokens
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(wallet.status)}>
                      {wallet.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">${wallet.dailyVolume.toLocaleString()}</div>
                      <div className="text-sm text-gray-500">
                        {wallet.transactionCount} txns
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {wallet.lastActivity}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedWallet(wallet)}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}