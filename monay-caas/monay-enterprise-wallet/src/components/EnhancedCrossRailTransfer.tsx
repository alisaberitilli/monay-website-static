'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalTrigger } from '@/components/ui/modal'
import {
  ArrowUpDown, ArrowRight, Activity, Clock, CheckCircle, 
  AlertCircle, TrendingUp, Shield, Zap, Info, RefreshCcw,
  Globe, Coins, DollarSign, Timer
} from 'lucide-react'
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import toast from 'react-hot-toast'

export default function EnhancedCrossRailTransfer() {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [transferDetails, setTransferDetails] = useState({
    fromChain: 'base',
    toChain: 'solana',
    amount: '',
    token: 'USDM',
    recipient: ''
  })
  const [activeTransfers, setActiveTransfers] = useState([
    {
      id: 'tx_001',
      from: 'Base L2',
      to: 'Solana',
      amount: '50,000 USDM',
      status: 'completed',
      time: '45s',
      timestamp: '2 mins ago',
      hash: '0xabc...123'
    },
    {
      id: 'tx_002',
      from: 'Solana',
      to: 'Base L2',
      amount: '25,000 USDM',
      status: 'in_progress',
      time: '~30s remaining',
      timestamp: '1 min ago',
      hash: '7Kx9...8Pq'
    },
    {
      id: 'tx_003',
      from: 'Base L2',
      to: 'Solana',
      amount: '100,000 EURM',
      status: 'completed',
      time: '52s',
      timestamp: '1 hour ago',
      hash: '0xdef...456'
    }
  ])

  const performanceData = [
    { time: '00:00', base: 45, solana: 38 },
    { time: '04:00', base: 48, solana: 35 },
    { time: '08:00', base: 42, solana: 40 },
    { time: '12:00', base: 50, solana: 42 },
    { time: '16:00', base: 55, solana: 45 },
    { time: '20:00', base: 47, solana: 39 },
    { time: '24:00', base: 46, solana: 37 }
  ]

  const volumeData = [
    { day: 'Mon', volume: 2500000 },
    { day: 'Tue', volume: 2800000 },
    { day: 'Wed', volume: 3200000 },
    { day: 'Thu', volume: 2900000 },
    { day: 'Fri', volume: 3500000 },
    { day: 'Sat', volume: 2100000 },
    { day: 'Sun', volume: 1800000 }
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
    toast.success('Cross-rail transfer initiated!')
    
    // Simulate transfer progress
    setTimeout(() => {
      toast.success('Transfer bridged successfully!')
    }, 2000)
    
    setTimeout(() => {
      toast.success('Transfer completed! Funds available on destination chain.')
    }, 4000)
    
    setIsTransferModalOpen(false)
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'in_progress': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'failed': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      default: return 'bg-gray-100 text-gray-700'
    }
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
            Cross-Rail Transfer
          </h2>
          <p className="text-gray-600 mt-1">Bridge assets between Base L2 and Solana networks</p>
        </div>
        <Modal open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
          <ModalTrigger asChild>
            <Button variant="gradient" className="shadow-lg">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              New Transfer
            </Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Cross-Rail Transfer</ModalTitle>
              <ModalDescription>
                Transfer assets between enterprise and consumer rails
              </ModalDescription>
            </ModalHeader>
            <div className="space-y-4 my-4">
              {/* Visual Bridge Indicator */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl">
                <div className="text-center">
                  <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-md mb-2">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium">Base L2</p>
                  <p className="text-xs text-gray-500">Enterprise</p>
                </div>
                <motion.div
                  animate={{ x: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </motion.div>
                <div className="text-center">
                  <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-md mb-2">
                    <Zap className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-medium">Solana</p>
                  <p className="text-xs text-gray-500">Consumer</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">From Chain</label>
                  <select 
                    value={transferDetails.fromChain}
                    onChange={(e) => setTransferDetails({...transferDetails, fromChain: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="base">Base L2</option>
                    <option value="solana">Solana</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">To Chain</label>
                  <select 
                    value={transferDetails.toChain}
                    onChange={(e) => setTransferDetails({...transferDetails, toChain: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="solana">Solana</option>
                    <option value="base">Base L2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Token</label>
                <select 
                  value={transferDetails.token}
                  onChange={(e) => setTransferDetails({...transferDetails, token: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USDM">USDM - Monay USD</option>
                  <option value="EURM">EURM - Monay EUR</option>
                  <option value="GBPM">GBPM - Monay GBP</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Amount</label>
                <input
                  type="text"
                  value={transferDetails.amount}
                  onChange={(e) => setTransferDetails({...transferDetails, amount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="100,000"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Recipient Address</label>
                <input
                  type="text"
                  value={transferDetails.recipient}
                  onChange={(e) => setTransferDetails({...transferDetails, recipient: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="0x... or wallet.sol"
                />
              </div>

              {/* Transfer Info */}
              <div className="space-y-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Timer className="h-3 w-3" />
                    Estimated Time
                  </span>
                  <span className="font-medium">~45 seconds</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <DollarSign className="h-3 w-3" />
                    Bridge Fee
                  </span>
                  <span className="font-medium">0.1% ($100)</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 text-gray-600">
                    <Shield className="h-3 w-3" />
                    Security
                  </span>
                  <span className="font-medium text-green-600">Multi-sig secured</span>
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
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: '24h Volume', value: '$18.3M', icon: TrendingUp, change: '+15%', color: 'from-blue-500 to-indigo-600' },
          { label: 'Active Bridges', value: '12', icon: RefreshCcw, change: '3 pending', color: 'from-green-500 to-emerald-600' },
          { label: 'Avg. Time', value: '47s', icon: Clock, change: '-3s', color: 'from-purple-500 to-pink-600' },
          { label: 'Success Rate', value: '99.8%', icon: CheckCircle, change: '+0.1%', color: 'from-orange-500 to-red-600' }
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Card className="glass-card relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Bridge Visualization */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Bridge Architecture</CardTitle>
            <CardDescription>Real-time cross-rail transfer flow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative p-8 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 rounded-xl">
              {/* Animated Bridge Flow */}
              <div className="flex items-center justify-between">
                <motion.div 
                  className="flex-1 text-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border-2 border-blue-500">
                    <Globe className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                    <h3 className="font-bold">Base L2</h3>
                    <p className="text-xs text-gray-500 mt-1">Enterprise Rail</p>
                    <p className="text-lg font-bold mt-2">$3.2M</p>
                    <p className="text-xs text-gray-500">Available Liquidity</p>
                  </div>
                </motion.div>

                <div className="flex-1 relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative overflow-hidden">
                      <motion.div
                        className="absolute inset-0 bg-white/50"
                        animate={{ x: ['0%', '100%'] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ width: '20%' }}
                      />
                    </div>
                  </div>
                  <div className="relative z-10 text-center">
                    <div className="bg-white dark:bg-gray-800 rounded-xl px-4 py-2 shadow-lg inline-block">
                      <p className="text-xs font-medium">Treasury Bridge</p>
                      <p className="text-xs text-gray-500">Multi-sig secured</p>
                    </div>
                  </div>
                </div>

                <motion.div 
                  className="flex-1 text-center"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 3, delay: 1.5 }}
                >
                  <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 shadow-xl border-2 border-purple-500">
                    <Zap className="h-12 w-12 text-purple-600 mx-auto mb-2" />
                    <h3 className="font-bold">Solana</h3>
                    <p className="text-xs text-gray-500 mt-1">Consumer Rail</p>
                    <p className="text-lg font-bold mt-2">$1.8M</p>
                    <p className="text-xs text-gray-500">Available Liquidity</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transfer Speed */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Transfer Speed (seconds)</CardTitle>
            <CardDescription>Average completion time by chain</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="time" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="base" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Base → Solana"
                />
                <Line 
                  type="monotone" 
                  dataKey="solana" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Solana → Base"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Volume */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Weekly Transfer Volume</CardTitle>
            <CardDescription>Total cross-rail transfer volume</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Area 
                  type="monotone" 
                  dataKey="volume" 
                  stroke="#3b82f6" 
                  fill="url(#volumeGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Transfers */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Recent Transfers</CardTitle>
            <CardDescription>Live cross-rail bridge activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeTransfers.map((transfer, index) => (
                <motion.div
                  key={transfer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className={`p-2 rounded-lg ${
                          transfer.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100'
                        }`}>
                          <ArrowUpDown className={`h-5 w-5 ${
                            transfer.status === 'completed' ? 'text-green-600' : 'text-yellow-600'
                          }`} />
                        </div>
                        {transfer.status === 'in_progress' && (
                          <motion.div
                            className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1 }}
                          />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{transfer.amount}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transfer.status)}`}>
                            {transfer.status === 'in_progress' ? 'Bridging' : transfer.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {transfer.from} → {transfer.to}
                        </p>
                        <div className="flex gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {transfer.time}
                          </span>
                          <span>{transfer.timestamp}</span>
                          <span className="font-mono">{transfer.hash}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
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