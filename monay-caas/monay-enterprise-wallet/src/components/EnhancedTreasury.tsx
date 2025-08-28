'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalTrigger } from '@/components/ui/modal'
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart,
  ArrowUpDown, Shield, Activity, Globe, Lock,
  Wallet, RefreshCcw, AlertTriangle, Info
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, PieChart as RePieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import toast from 'react-hot-toast'

export default function EnhancedTreasury() {
  const [activeView, setActiveView] = useState('overview')
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  
  const treasuryBalance = {
    total: '$5,250,000',
    available: '$3,150,000',
    locked: '$2,100,000',
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
          <p className="text-gray-600 mt-1">Monitor and manage liquidity across dual-rail architecture</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Yield Report
          </Button>
          <Modal open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
            <ModalTrigger asChild>
              <Button variant="gradient" className="shadow-lg">
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
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="100,000 USDM"
                  />
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="text-blue-700 dark:text-blue-400">
                      Estimated completion: ~45 seconds
                    </span>
                  </div>
                </div>
              </div>
              <ModalFooter>
                <Button variant="outline" onClick={() => setIsTransferModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="gradient" onClick={handleTransfer}>
                  Initiate Transfer
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>
      </motion.div>

      {/* Balance Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Balance', value: treasuryBalance.total, icon: DollarSign, trend: '+5.2%', color: 'from-blue-500 to-indigo-600' },
          { label: 'Available', value: treasuryBalance.available, icon: Wallet, trend: '+2.8%', color: 'from-green-500 to-emerald-600' },
          { label: 'Locked', value: treasuryBalance.locked, icon: Lock, trend: '0%', color: 'from-purple-500 to-pink-600' },
          { label: 'Pending', value: treasuryBalance.pending, icon: RefreshCcw, trend: '-1.2%', color: 'from-orange-500 to-red-600' }
        ].map((item) => (
          <motion.div key={item.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="glass-card relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{item.label}</p>
                    <p className="text-2xl font-bold mt-1">{item.value}</p>
                    <p className={`text-xs mt-1 ${
                      item.trend.startsWith('+') ? 'text-green-600' : 
                      item.trend === '0%' ? 'text-gray-600' : 'text-red-600'
                    }`}>
                      {item.trend} from yesterday
                    </p>
                  </div>
                  <item.icon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Liquidity Pools */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Liquidity Pools</CardTitle>
            <CardDescription>Manage funds across different reserve pools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pools.map((pool, index) => (
                <motion.div
                  key={pool.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-xl bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-900/30"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold">{pool.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{pool.chain}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pool.status === 'healthy' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {pool.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Balance</span>
                      <span className="font-medium">{pool.balance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Allocation</span>
                      <span className="font-medium">{pool.allocation}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">APY</span>
                      <span className="font-medium text-green-600">{pool.apy}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Deposit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Withdraw
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Liquidity Chart */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>24h Liquidity Flow</CardTitle>
            <CardDescription>Cross-rail liquidity movements</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={liquidityData}>
                <defs>
                  <linearGradient id="baseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="solanaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="base" 
                  stroke="#3b82f6" 
                  fill="url(#baseGradient)"
                  strokeWidth={2}
                  name="Base L2"
                />
                <Area 
                  type="monotone" 
                  dataKey="solana" 
                  stroke="#8b5cf6" 
                  fill="url(#solanaGradient)"
                  strokeWidth={2}
                  name="Solana"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Asset Allocation */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
            <CardDescription>Treasury portfolio distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <RePieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}%`}
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
      </motion.div>

      {/* Risk Monitoring */}
      <motion.div variants={itemVariants}>
        <Card className="glass-gradient">
          <CardHeader>
            <CardTitle>Risk Monitoring</CardTitle>
            <CardDescription>Real-time treasury risk indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { metric: 'Liquidity Ratio', value: '2.5x', status: 'healthy', description: 'Above minimum threshold' },
                { metric: 'Collateralization', value: '150%', status: 'healthy', description: 'Fully collateralized' },
                { metric: 'Concentration Risk', value: 'Low', status: 'warning', description: '45% in single asset' }
              ].map((risk) => (
                <div key={risk.metric} className="p-4 border rounded-lg bg-white/50 dark:bg-gray-800/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{risk.metric}</span>
                    {risk.status === 'warning' ? (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <Shield className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-xl font-bold">{risk.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{risk.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}