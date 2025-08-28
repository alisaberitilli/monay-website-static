'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Zap, Plus, Settings, Shield, Code, Activity,
  CheckCircle, XCircle, Clock, AlertTriangle
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function EnhancedBusinessRulesEngine() {
  const [activeTab, setActiveTab] = useState('active')

  const rules = [
    {
      id: 1,
      name: 'Transaction Velocity Check',
      description: 'Block transactions exceeding 10 per minute from same wallet',
      category: 'Security',
      chain: 'Both',
      status: 'active',
      triggers: 125,
      lastTriggered: '5 mins ago'
    },
    {
      id: 2,
      name: 'KYC Compliance Gate',
      description: 'Require enhanced KYC for transactions over $50,000',
      category: 'Compliance',
      chain: 'Base L2',
      status: 'active',
      triggers: 45,
      lastTriggered: '1 hour ago'
    },
    {
      id: 3,
      name: 'Cross-Rail Balance',
      description: 'Auto-balance liquidity when difference exceeds 20%',
      category: 'Treasury',
      chain: 'Cross-Rail',
      status: 'active',
      triggers: 8,
      lastTriggered: '3 hours ago'
    },
    {
      id: 4,
      name: 'Gas Fee Optimizer',
      description: 'Route to Solana when Base L2 gas exceeds $1',
      category: 'Optimization',
      chain: 'Both',
      status: 'paused',
      triggers: 0,
      lastTriggered: 'Never'
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
            Business Rules Engine
          </h2>
          <p className="text-gray-600 mt-1">Configure automated rules for dual-rail blockchain operations</p>
        </div>
        <Button variant="gradient" className="shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Rules', value: '12', icon: Zap, color: 'from-blue-500 to-indigo-600' },
          { label: 'Total Triggers', value: '1,234', icon: Activity, color: 'from-green-500 to-emerald-600' },
          { label: 'Blocked Transactions', value: '89', icon: Shield, color: 'from-red-500 to-pink-600' },
          { label: 'Rule Efficiency', value: '94%', icon: CheckCircle, color: 'from-purple-500 to-indigo-600' }
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.02 }}>
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

      {/* Rules List */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Business Rules</CardTitle>
              <div className="flex gap-2">
                {['active', 'paused', 'all'].map((tab) => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? 'gradient' : 'outline'}
                    size="sm"
                    onClick={() => setActiveTab(tab)}
                    className="capitalize"
                  >
                    {tab}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules
                .filter(rule => activeTab === 'all' || rule.status === activeTab)
                .map((rule, index) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 border rounded-xl bg-white/50 dark:bg-gray-800/50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{rule.name}</h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            rule.status === 'active' 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {rule.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            {rule.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                            {rule.chain}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                        <div className="flex gap-4 mt-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {rule.triggers} triggers
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {rule.lastTriggered}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Settings className="h-3 w-3" />
                        </Button>
                        <Button variant="outline" size="sm">
                          {rule.status === 'active' ? 'Pause' : 'Resume'}
                        </Button>
                      </div>
                    </div>
                  </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Blockchain Integration */}
      <motion.div variants={itemVariants}>
        <Card className="glass-gradient">
          <CardHeader>
            <CardTitle>Blockchain Integration</CardTitle>
            <CardDescription>Smart contract integration with dual-rail architecture</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold">Base L2 (EVM)</h4>
                </div>
                <p className="text-sm text-gray-600">ERC-3643 compliant smart contracts</p>
                <p className="text-xs text-gray-500 mt-2">Contract: 0x1234...5678</p>
              </div>
              <div className="p-4 border rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Code className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold">Solana</h4>
                </div>
                <p className="text-sm text-gray-600">Token-2022 with extensions</p>
                <p className="text-xs text-gray-500 mt-2">Program: 7xKXtg...2hnB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}