'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalTrigger } from '@/components/ui/modal'
import { Plus, Send, ArrowUpDown, Shield, Coins, TrendingUp, Settings2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EnhancedTokenManagement() {
  const [activeView, setActiveView] = useState('overview')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    tokenName: '',
    tokenSymbol: '',
    totalSupply: '',
    tokenType: 'erc3643',
    chain: 'base',
    complianceLevel: 'standard'
  })

  const tokens = [
    {
      id: 1,
      name: 'Monay USD',
      symbol: 'USDM',
      balance: '1,250,000.00',
      value: '$1,250,000',
      change: '+2.5%',
      chain: 'Base L2',
      type: 'ERC-3643',
      status: 'active',
      icon: '💵'
    },
    {
      id: 2,
      name: 'Monay EUR',
      symbol: 'EURM',
      balance: '850,000.00',
      value: '$925,000',
      change: '+1.8%',
      chain: 'Base L2',
      type: 'ERC-3643',
      status: 'active',
      icon: '💶'
    },
    {
      id: 3,
      name: 'Monay GBP',
      symbol: 'GBPM',
      balance: '500,000.00',
      value: '$625,000',
      change: '-0.5%',
      chain: 'Base L2',
      type: 'ERC-3643',
      status: 'active',
      icon: '💷'
    },
    {
      id: 4,
      name: 'Fast USDM',
      symbol: 'fUSDM',
      balance: '50,000.00',
      value: '$50,000',
      change: '+5.2%',
      chain: 'Solana',
      type: 'Token-2022',
      status: 'active',
      icon: '⚡'
    }
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

  const handleCreateToken = () => {
    toast.success('Token creation initiated. Deploying smart contract...')
    setIsCreateModalOpen(false)
    setTimeout(() => {
      toast.success('Token successfully deployed on Base L2!')
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
            Token Management
          </h2>
          <p className="text-gray-600 mt-1">Create, manage, and monitor your digital assets</p>
        </div>
        <Modal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <ModalTrigger asChild>
            <Button variant="gradient" className="shadow-lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Token
            </Button>
          </ModalTrigger>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Create New Token</ModalTitle>
              <ModalDescription>
                Deploy a new compliant token on your chosen blockchain
              </ModalDescription>
            </ModalHeader>
            <div className="space-y-4 my-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Token Name</label>
                <input
                  type="text"
                  value={formData.tokenName}
                  onChange={(e) => setFormData({...formData, tokenName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Monay USD"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Token Symbol</label>
                <input
                  type="text"
                  value={formData.tokenSymbol}
                  onChange={(e) => setFormData({...formData, tokenSymbol: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., USDM"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Initial Supply</label>
                <input
                  type="number"
                  value={formData.totalSupply}
                  onChange={(e) => setFormData({...formData, totalSupply: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="1000000"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Blockchain</label>
                <select 
                  value={formData.chain}
                  onChange={(e) => setFormData({...formData, chain: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="base">Base L2 (Enterprise)</option>
                  <option value="solana">Solana (Consumer)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Token Standard</label>
                <select 
                  value={formData.tokenType}
                  onChange={(e) => setFormData({...formData, tokenType: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="erc3643">ERC-3643 (Compliant)</option>
                  <option value="erc20">ERC-20 (Standard)</option>
                  <option value="token2022">Token-2022 (Solana)</option>
                </select>
              </div>
            </div>
            <ModalFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="gradient" onClick={handleCreateToken}>
                Deploy Token
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Value', value: '$2,850,000', icon: Coins, color: 'from-blue-500 to-indigo-600' },
          { label: 'Active Tokens', value: '4', icon: Shield, color: 'from-green-500 to-emerald-600' },
          { label: '24h Volume', value: '$450,000', icon: TrendingUp, color: 'from-purple-500 to-pink-600' },
          { label: 'Compliance Rate', value: '100%', icon: Settings2, color: 'from-orange-500 to-red-600' }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="glass-card relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Tokens Grid */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Your Tokens</CardTitle>
            <CardDescription>Manage your deployed tokens across both rails</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tokens.map((token, index) => (
                <motion.div
                  key={token.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 border rounded-xl bg-gradient-to-br from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-900/30 backdrop-blur-sm"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{token.icon}</span>
                      <div>
                        <h3 className="font-semibold">{token.name}</h3>
                        <p className="text-sm text-gray-500">{token.symbol}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      token.status === 'active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {token.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Balance</span>
                      <span className="font-medium">{token.balance}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Value</span>
                      <span className="font-medium">{token.value}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">24h Change</span>
                      <span className={`font-medium ${
                        token.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {token.change}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Network</span>
                      <span className="text-sm font-medium flex items-center gap-1">
                        {token.chain}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1" size="sm">
                      <Send className="h-3 w-3 mr-1" />
                      Send
                    </Button>
                    <Button variant="outline" className="flex-1" size="sm">
                      <ArrowUpDown className="h-3 w-3 mr-1" />
                      Swap
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card className="glass-gradient">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common token operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Mint Tokens', icon: '🪙', color: 'from-blue-500 to-indigo-500' },
                { label: 'Burn Tokens', icon: '🔥', color: 'from-red-500 to-orange-500' },
                { label: 'Set Compliance', icon: '🛡️', color: 'from-green-500 to-emerald-500' },
                { label: 'Cross-Rail Bridge', icon: '🌉', color: 'from-purple-500 to-pink-500' }
              ].map((action) => (
                <motion.div key={action.label} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline" 
                    className="w-full h-24 flex flex-col gap-2 bg-gradient-to-br hover:from-white/10 hover:to-white/5"
                  >
                    <span className="text-2xl">{action.icon}</span>
                    <span className="text-xs">{action.label}</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}