'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Search, Filter, Download, ArrowUpRight, ArrowDownLeft, 
  Clock, CheckCircle, XCircle, AlertCircle, RefreshCcw
} from 'lucide-react'
import { format } from 'date-fns'

export default function EnhancedTransactionHistory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({
    type: 'all',
    status: 'all',
    chain: 'all',
    dateRange: '7d'
  })

  const transactions = [
    {
      id: 'tx_001',
      type: 'send',
      amount: '50,000 USDM',
      usdValue: '$50,000',
      from: 'Enterprise Wallet',
      to: 'Acme Corporation',
      status: 'completed',
      chain: 'Base L2',
      timestamp: new Date('2024-01-25T10:30:00'),
      gas: '$0.12',
      hash: '0x1234...5678'
    },
    {
      id: 'tx_002',
      type: 'receive',
      amount: '25,000 EURM',
      usdValue: '$27,250',
      from: 'Global Retail Ltd',
      to: 'Enterprise Wallet',
      status: 'completed',
      chain: 'Base L2',
      timestamp: new Date('2024-01-25T09:15:00'),
      gas: '$0.10',
      hash: '0xabcd...efgh'
    },
    {
      id: 'tx_003',
      type: 'swap',
      amount: '10,000 USDM → 9,200 EURM',
      usdValue: '$10,000',
      from: 'USDM',
      to: 'EURM',
      status: 'pending',
      chain: 'Cross-Rail',
      timestamp: new Date('2024-01-25T08:45:00'),
      gas: '$0.25',
      hash: '0xijkl...mnop'
    },
    {
      id: 'tx_004',
      type: 'send',
      amount: '1,000 fUSDM',
      usdValue: '$1,000',
      from: 'Consumer Wallet',
      to: '0x9876...5432',
      status: 'completed',
      chain: 'Solana',
      timestamp: new Date('2024-01-25T07:30:00'),
      gas: '$0.002',
      hash: 'Gx7v9...3kPq'
    },
    {
      id: 'tx_005',
      type: 'mint',
      amount: '100,000 USDM',
      usdValue: '$100,000',
      from: 'Treasury',
      to: 'Enterprise Reserve',
      status: 'completed',
      chain: 'Base L2',
      timestamp: new Date('2024-01-24T16:20:00'),
      gas: '$0.45',
      hash: '0xqrst...uvwx'
    }
  ]

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30'
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30'
      case 'failed': return 'text-red-600 bg-red-100 dark:bg-red-900/30'
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'send': return <ArrowUpRight className="h-4 w-4" />
      case 'receive': return <ArrowDownLeft className="h-4 w-4" />
      case 'swap': return <RefreshCcw className="h-4 w-4" />
      case 'mint': return '🪙'
      case 'burn': return '🔥'
      default: return <Clock className="h-4 w-4" />
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { y: 10, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  }

  const filteredTransactions = transactions.filter(tx => {
    if (searchTerm && !tx.to.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !tx.from.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !tx.amount.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (selectedFilters.type !== 'all' && tx.type !== selectedFilters.type) return false
    if (selectedFilters.status !== 'all' && tx.status !== selectedFilters.status) return false
    if (selectedFilters.chain !== 'all' && tx.chain !== selectedFilters.chain) return false
    return true
  })

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
            Transaction History
          </h2>
          <p className="text-gray-600 mt-1">View and manage all your blockchain transactions</p>
        </div>
        <Button variant="gradient" className="shadow-lg">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '24h Volume', value: '$450,000', change: '+12.5%', color: 'from-blue-500 to-indigo-600' },
          { label: 'Total Transactions', value: '1,234', change: '+8.3%', color: 'from-green-500 to-emerald-600' },
          { label: 'Success Rate', value: '99.8%', change: '+0.2%', color: 'from-purple-500 to-pink-600' },
          { label: 'Avg. Gas Fee', value: '$0.15', change: '-5.1%', color: 'from-orange-500 to-red-600' }
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.02 }}>
            <Card className="glass-card relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
              <CardContent className="p-6">
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
                <p className={`text-xs mt-1 ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters and Search */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[300px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by address, amount, or token..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <select
                value={selectedFilters.type}
                onChange={(e) => setSelectedFilters({...selectedFilters, type: e.target.value})}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="send">Send</option>
                <option value="receive">Receive</option>
                <option value="swap">Swap</option>
                <option value="mint">Mint</option>
                <option value="burn">Burn</option>
              </select>
              <select
                value={selectedFilters.status}
                onChange={(e) => setSelectedFilters({...selectedFilters, status: e.target.value})}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
              <select
                value={selectedFilters.chain}
                onChange={(e) => setSelectedFilters({...selectedFilters, chain: e.target.value})}
                className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Chains</option>
                <option value="Base L2">Base L2</option>
                <option value="Solana">Solana</option>
                <option value="Cross-Rail">Cross-Rail</option>
              </select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Transactions List */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              Showing {filteredTransactions.length} transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTransactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  whileHover={{ x: 4 }}
                  className="p-4 rounded-xl border bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        tx.type === 'send' ? 'bg-red-100 dark:bg-red-900/30' :
                        tx.type === 'receive' ? 'bg-green-100 dark:bg-green-900/30' :
                        'bg-blue-100 dark:bg-blue-900/30'
                      }`}>
                        {getTypeIcon(tx.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{tx.amount}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tx.status)}`}>
                            {tx.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400">
                            {tx.chain}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {tx.type === 'swap' ? `${tx.from} → ${tx.to}` : 
                           tx.type === 'send' ? `To: ${tx.to}` : `From: ${tx.from}`}
                        </p>
                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                          <span>{format(tx.timestamp, 'MMM d, yyyy HH:mm')}</span>
                          <span>Gas: {tx.gas}</span>
                          <span className="font-mono">{tx.hash}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">{tx.usdValue}</p>
                        <p className="text-xs text-gray-500">USD Value</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}