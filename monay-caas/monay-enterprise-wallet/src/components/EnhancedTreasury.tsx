'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalTrigger } from '@/components/ui/modal'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import UnifiedPaymentGateway from '@/components/UnifiedPaymentGateway'
import {
  TrendingUp, TrendingDown, DollarSign, PieChart,
  ArrowUpDown, Shield, Activity, Globe, Lock,
  Wallet, RefreshCcw, AlertTriangle, Info,
  ArrowDownToLine, ArrowUpFromLine, CreditCard,
  Building2, Zap, Clock, Check
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import toast from 'react-hot-toast'

export default function EnhancedTreasury() {
  const [activeView, setActiveView] = useState('overview')
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false)
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false)
  const [currentBalance, setCurrentBalance] = useState(5250000)

  const treasuryBalance = {
    total: `$${currentBalance.toLocaleString()}`,
    available: `$${(currentBalance * 0.6).toLocaleString()}`,
    locked: `$${(currentBalance * 0.4).toLocaleString()}`,
    pending: '$125,000'
  }

  const pools = [
    {
      name: 'Operating Reserve',
      balance: '$1,500,000',
      allocation: '30%',
      status: 'healthy',
      apy: '4.5%',
      chain: 'Base L2'
    },
    {
      name: 'Liquidity Pool',
      balance: '$2,000,000',
      allocation: '40%',
      status: 'healthy',
      apy: '6.2%',
      chain: 'Base L2'
    },
    {
      name: 'Yield Reserve',
      balance: '$750,000',
      allocation: '15%',
      status: 'warning',
      apy: '8.5%',
      chain: 'Solana'
    },
    {
      name: 'Insurance Fund',
      balance: '$1,000,000',
      allocation: '20%',
      status: 'healthy',
      apy: '3.2%',
      chain: 'Base L2'
    }
  ]

  const liquidityData = [
    { time: '00:00', base: 2500000, solana: 500000 },
    { time: '04:00', base: 2450000, solana: 480000 },
    { time: '08:00', base: 2600000, solana: 520000 },
    { time: '12:00', base: 2800000, solana: 580000 },
    { time: '16:00', base: 2750000, solana: 560000 },
    { time: '20:00', base: 2700000, solana: 540000 },
    { time: '24:00', base: 2650000, solana: 530000 }
  ]

  const allocationData = [
    { name: 'USDM', value: 45, color: '#3b82f6' },
    { name: 'EURM', value: 25, color: '#6366f1' },
    { name: 'GBPM', value: 15, color: '#8b5cf6' },
    { name: 'ETH', value: 10, color: '#10b981' },
    { name: 'Others', value: 5, color: '#f59e0b' }
  ]

  const recentTransactions = [
    { id: 1, type: 'deposit', provider: 'Monay-Fiat', amount: 500000, date: '2 hours ago', status: 'completed' },
    { id: 2, type: 'withdrawal', provider: 'Circle', amount: 250000, date: '5 hours ago', status: 'completed' },
    { id: 3, type: 'deposit', provider: 'Stripe', amount: 1000000, date: '1 day ago', status: 'completed' },
    { id: 4, type: 'deposit', provider: 'Dwolla', amount: 750000, date: '2 days ago', status: 'completed' },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  }

  const handleTransfer = () => {
    toast.success('Cross-rail transfer initiated')
    setIsTransferModalOpen(false)
    setTimeout(() => {
      toast.success('Transfer completed successfully!')
    }, 3000)
  }

  const handleDepositSuccess = (transaction: any) => {
    setCurrentBalance(prev => prev + transaction.amount)
    toast.success(`Successfully deposited $${transaction.amount.toLocaleString()}`)
    setIsDepositModalOpen(false)
  }

  const handleWithdrawSuccess = (transaction: any) => {
    setCurrentBalance(prev => prev - transaction.amount)
    toast.success(`Successfully withdrawn $${transaction.amount.toLocaleString()}`)
    setIsWithdrawModalOpen(false)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Treasury Management
          </h2>
          <p className="text-gray-600 mt-1">Manage enterprise funds with multi-provider payment rails</p>
        </div>
        <div className="flex gap-3">
          <Modal open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
            <ModalTrigger asChild>
              <Button variant="gradient" className="shadow-lg">
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Deposit Funds
              </Button>
            </ModalTrigger>
            <ModalContent className="max-w-4xl">
              <ModalHeader>
                <ModalTitle>Deposit Funds to Treasury</ModalTitle>
                <ModalDescription>
                  Choose from multiple payment providers to add funds to your enterprise treasury
                </ModalDescription>
              </ModalHeader>
              <div className="py-4">
                <UnifiedPaymentGateway
                  walletType="enterprise"
                  transactionType="deposit"
                  userId="enterprise-001"
                  currentBalance={currentBalance}
                  onSuccess={handleDepositSuccess}
                  onError={(error) => toast.error(error)}
                />
              </div>
            </ModalContent>
          </Modal>

          <Modal open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
            <ModalTrigger asChild>
              <Button variant="outline">
                <ArrowUpFromLine className="h-4 w-4 mr-2" />
                Withdraw Funds
              </Button>
            </ModalTrigger>
            <ModalContent className="max-w-4xl">
              <ModalHeader>
                <ModalTitle>Withdraw Funds from Treasury</ModalTitle>
                <ModalDescription>
                  Transfer funds from your treasury to external accounts
                </ModalDescription>
              </ModalHeader>
              <div className="py-4">
                <UnifiedPaymentGateway
                  walletType="enterprise"
                  transactionType="withdrawal"
                  userId="enterprise-001"
                  currentBalance={currentBalance * 0.6} // Available balance
                  onSuccess={handleWithdrawSuccess}
                  onError={(error) => toast.error(error)}
                />
              </div>
            </ModalContent>
          </Modal>

          <Modal open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
            <ModalTrigger asChild>
              <Button variant="outline">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Cross-Rail Transfer
              </Button>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Cross-Rail Transfer</ModalTitle>
                <ModalDescription>
                  Transfer funds between Base L2 and Solana rails
                </ModalDescription>
              </ModalHeader>
              <div className="space-y-4 my-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">From Chain</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="base">Base L2 (Enterprise)</option>
                    <option value="solana">Solana (Consumer)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">To Chain</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="solana">Solana (Consumer)</option>
                    <option value="base">Base L2 (Enterprise)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Amount</label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <ModalFooter>
                <Button variant="outline" onClick={() => setIsTransferModalOpen(false)}>Cancel</Button>
                <Button onClick={handleTransfer}>Transfer</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>

          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Yield Report
          </Button>
        </div>
      </motion.div>

      {/* Balance Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{treasuryBalance.total}</div>
            <p className="text-xs text-blue-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" /> +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available</CardTitle>
            <Wallet className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{treasuryBalance.available}</div>
            <p className="text-xs text-green-600 mt-1">Ready for operations</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Locked in Pools</CardTitle>
            <Lock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{treasuryBalance.locked}</div>
            <p className="text-xs text-purple-600 mt-1">Earning 5.8% APY</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
            <RefreshCcw className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">{treasuryBalance.pending}</div>
            <p className="text-xs text-amber-600 mt-1">Processing transfers</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="providers">Payment Providers</TabsTrigger>
            <TabsTrigger value="pools">Liquidity Pools</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Liquidity Chart */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>24h Liquidity Flow</CardTitle>
                  <CardDescription>Cross-rail liquidity movement</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={liquidityData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                      <XAxis dataKey="time" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="base"
                        stackId="1"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                        name="Base L2"
                      />
                      <Area
                        type="monotone"
                        dataKey="solana"
                        stackId="1"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                        name="Solana"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Allocation Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Token Allocation</CardTitle>
                  <CardDescription>Distribution by currency</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={allocationData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {allocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Treasury Operations</CardTitle>
                <CardDescription>Latest deposits and withdrawals</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentTransactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {tx.type === 'deposit' ? (
                          <ArrowDownToLine className="h-5 w-5 text-green-600" />
                        ) : (
                          <ArrowUpFromLine className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <p className="font-medium">
                            {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">via {tx.provider} • {tx.date}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        {tx.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Providers Tab */}
          <TabsContent value="providers" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Monay-Fiat Provider */}
              <Card className="border-purple-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Monay Pay</CardTitle>
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <CardDescription>Primary payment rails</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="flex items-center text-green-600">
                      <Check className="h-3 w-3 mr-1" /> Active
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Volume today:</span>
                    <span className="font-medium">$2.5M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg. fee:</span>
                    <span className="font-medium">0.3%</span>
                  </div>
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center text-xs">
                      <CreditCard className="h-3 w-3 mr-2 text-gray-500" />
                      <span>Cards: Instant</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <Building2 className="h-3 w-3 mr-2 text-gray-500" />
                      <span>ACH: 1-2 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Circle Provider */}
              <Card className="border-blue-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Circle</CardTitle>
                    <Globe className="h-5 w-5 text-blue-600" />
                  </div>
                  <CardDescription>USDC operations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="flex items-center text-green-600">
                      <Check className="h-3 w-3 mr-1" /> Active
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Volume today:</span>
                    <span className="font-medium">$1.8M</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg. fee:</span>
                    <span className="font-medium">No fees</span>
                  </div>
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center text-xs">
                      <Globe className="h-3 w-3 mr-2 text-gray-500" />
                      <span>USDC: Instant</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <Building2 className="h-3 w-3 mr-2 text-gray-500" />
                      <span>Wire: 1-2 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dwolla Provider */}
              <Card className="border-green-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Dwolla</CardTitle>
                    <Zap className="h-5 w-5 text-green-600" />
                  </div>
                  <CardDescription>Instant payments</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="flex items-center text-green-600">
                      <Check className="h-3 w-3 mr-1" /> Active
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Volume today:</span>
                    <span className="font-medium">$850K</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg. fee:</span>
                    <span className="font-medium">$0.045</span>
                  </div>
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center text-xs">
                      <Zap className="h-3 w-3 mr-2 text-gray-500" />
                      <span>FedNow: &lt; 60s</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <Clock className="h-3 w-3 mr-2 text-gray-500" />
                      <span>RTP: &lt; 60s</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Stripe Provider */}
              <Card className="border-indigo-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Stripe</CardTitle>
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                  </div>
                  <CardDescription>Global coverage</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status:</span>
                    <span className="flex items-center text-green-600">
                      <Check className="h-3 w-3 mr-1" /> Active
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Volume today:</span>
                    <span className="font-medium">$420K</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg. fee:</span>
                    <span className="font-medium">2.9%</span>
                  </div>
                  <div className="pt-3 space-y-2">
                    <div className="flex items-center text-xs">
                      <CreditCard className="h-3 w-3 mr-2 text-gray-500" />
                      <span>Cards: Instant</span>
                    </div>
                    <div className="flex items-center text-xs">
                      <Building2 className="h-3 w-3 mr-2 text-gray-500" />
                      <span>ACH: 3-5 days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Provider Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Rails Summary</CardTitle>
                <CardDescription>Optimize costs by choosing the right payment method</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 gap-4 font-medium text-sm border-b pb-2">
                    <span>Provider</span>
                    <span>Best For</span>
                    <span>Speed</span>
                    <span>Cost</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <span className="font-medium">Monay Pay</span>
                    <span className="text-gray-600">Large transfers, ACH</span>
                    <span className="text-blue-600">1-2 days</span>
                    <span className="text-green-600">Lowest (0.3%)</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <span className="font-medium">Circle</span>
                    <span className="text-gray-600">USDC, Crypto</span>
                    <span className="text-green-600">Instant</span>
                    <span className="text-green-600">No fees</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <span className="font-medium">Dwolla</span>
                    <span className="text-gray-600">Instant transfers</span>
                    <span className="text-green-600">&lt; 60 seconds</span>
                    <span className="text-blue-600">$0.045 flat</span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <span className="font-medium">Stripe</span>
                    <span className="text-gray-600">International, Cards</span>
                    <span className="text-green-600">Instant</span>
                    <span className="text-orange-600">2.9% + $0.30</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Liquidity Pools Tab */}
          <TabsContent value="pools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pools.map((pool, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{pool.name}</CardTitle>
                        <CardDescription className="flex items-center mt-2">
                          <Globe className="h-3 w-3 mr-1" />
                          {pool.chain}
                        </CardDescription>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          pool.status === 'healthy'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {pool.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Balance:</span>
                        <span className="font-semibold">{pool.balance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Allocation:</span>
                        <span className="font-semibold">{pool.allocation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">APY:</span>
                        <span className="font-semibold text-green-600">{pool.apy}</span>
                      </div>
                      <div className="pt-3 flex gap-2">
                        <Button size="sm" className="flex-1">Rebalance</Button>
                        <Button size="sm" variant="outline" className="flex-1">Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction History</CardTitle>
                <CardDescription>Complete history of treasury operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Extended transaction list would go here */}
                  <p className="text-sm text-gray-500">Full transaction history with filters and export options</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Treasury Analytics</CardTitle>
                <CardDescription>Performance metrics and insights</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-500">Detailed analytics dashboards and reports</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}