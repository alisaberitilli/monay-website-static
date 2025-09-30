'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Zap, Plus, Settings, Shield, Code, Activity,
  CheckCircle, XCircle, Clock, AlertTriangle, X,
  Layers, Package, TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function EnhancedBusinessRulesEngine() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('active')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'rules' | 'ruleSets'>('rules')
  const [newRule, setNewRule] = useState({
    name: '',
    description: '',
    category: 'transaction',
    chain: 'all',
    conditions: [],
    actions: [],
    priority: 50
  })
  const [businessRules, setBusinessRules] = useState<any[]>([])

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
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="shadow-lg"
            onClick={() => router.push('/capital-markets')}
          >
            <Layers className="h-4 w-4 mr-2" />
            Capital Markets
          </Button>
          <Button
            variant="outline"
            className="shadow-lg"
            onClick={() => router.push('/capital-markets/create')}
          >
            <Package className="h-4 w-4 mr-2" />
            Create Rule Set
          </Button>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button variant="gradient" className="shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Create Rule
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Business Rule</DialogTitle>
              <DialogDescription>
                Define a new business rule for automated smart contract execution
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Rule Name</label>
                <Input
                  placeholder="e.g., High-Value Transaction KYC"
                  value={newRule.name}
                  onChange={(e) => setNewRule({...newRule, name: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <Textarea
                  placeholder="Describe what this rule does..."
                  value={newRule.description}
                  onChange={(e) => setNewRule({...newRule, description: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Category</label>
                  <Select value={newRule.category} onValueChange={(value) => setNewRule({...newRule, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="transaction">Transaction</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="security">Security</SelectItem>
                      <SelectItem value="wallet">Wallet</SelectItem>
                      <SelectItem value="token">Token</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Target Chain</label>
                  <Select value={newRule.chain} onValueChange={(value) => setNewRule({...newRule, chain: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Chains</SelectItem>
                      <SelectItem value="evm">Base L2 (EVM)</SelectItem>
                      <SelectItem value="solana">Solana</SelectItem>
                      <SelectItem value="cross-rail">Cross-Rail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Priority (0-100)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={newRule.priority}
                  onChange={(e) => setNewRule({...newRule, priority: parseInt(e.target.value) || 50})}
                />
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  💡 This rule will be compiled into smart contracts for both Base L2 (Solidity) and Solana (Rust)
                </p>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  onClick={async () => {
                    if (!newRule.name || !newRule.description) {
                      toast.error('Please fill in all required fields')
                      return
                    }

                    try {
                      // Call the Business Rule Engine API
                      const response = await fetch('/api/business-rules', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newRule)
                      })

                      if (response.ok) {
                        const createdRule = await response.json()
                        setBusinessRules([...businessRules, createdRule.rule])
                        toast.success('Business rule created successfully!')
                        setIsCreateModalOpen(false)
                        setNewRule({
                          name: '',
                          description: '',
                          category: 'transaction',
                          chain: 'all',
                          conditions: [],
                          actions: [],
                          priority: 50
                        })
                      } else {
                        toast.error('Failed to create rule')
                      }
                    } catch (error) {
                      console.error('Error creating rule:', error)
                      toast.error('Failed to create rule')
                    }
                  }}
                >
                  Create Rule
                </Button>
              </div>
            </div>
          </DialogContent>
          </Dialog>
        </div>
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

      {/* Smart Contract Generation */}
      <motion.div variants={itemVariants}>
        <Card className="glass-gradient">
          <CardHeader>
            <CardTitle>Smart Contract Generation</CardTitle>
            <CardDescription>Business rules compiled to blockchain-specific contracts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* EVM/Solidity Contract */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-blue-600" />
                  <h4 className="font-semibold">Base L2 (Solidity)</h4>
                </div>
                <div className="p-3 bg-gray-900 rounded-lg overflow-x-auto">
                  <pre className="text-xs text-green-400 font-mono">
{`// Auto-generated from Business Rules
pragma solidity ^0.8.20;

contract InvoiceWalletRules {
  function evaluateKYC(
    uint256 amount
  ) public pure returns (bool) {
    if (amount > 10000) {
      return requireAttestation("kyc");
    }
    return true;
  }

  function determineWalletMode(
    uint256 riskScore
  ) public pure returns (string) {
    if (riskScore > 80) {
      return "ephemeral";
    } else if (riskScore < 30) {
      return "persistent";
    }
    return "adaptive";
  }
}`}
                  </pre>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Deploy to Base L2
                </Button>
              </div>

              {/* Solana/Rust Contract */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-purple-600" />
                  <h4 className="font-semibold">Solana (Rust)</h4>
                </div>
                <div className="p-3 bg-gray-900 rounded-lg overflow-x-auto">
                  <pre className="text-xs text-green-400 font-mono">
{`// Auto-generated from Business Rules
use anchor_lang::prelude::*;

#[program]
pub mod invoice_wallet_rules {
  pub fn evaluate_kyc(
    ctx: Context<EvaluateKYC>,
    amount: u64
  ) -> Result<bool> {
    if amount > 10000 {
      require_attestation("kyc")?;
    }
    Ok(true)
  }

  pub fn determine_wallet_mode(
    ctx: Context<DetermineMode>,
    risk_score: u8
  ) -> Result<String> {
    if risk_score > 80 {
      Ok("ephemeral".to_string())
    } else if risk_score < 30 {
      Ok("persistent".to_string())
    } else {
      Ok("adaptive".to_string())
    }
  }
}`}
                  </pre>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Deploy to Solana
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Blockchain Integration Status */}
      <motion.div variants={itemVariants}>
        <Card className="glass-gradient">
          <CardHeader>
            <CardTitle>Blockchain Integration</CardTitle>
            <CardDescription>Live smart contract deployment status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold">Base L2 (EVM)</h4>
                </div>
                <p className="text-sm text-gray-600">BusinessRuleEngine.sol deployed</p>
                <p className="text-xs text-gray-500 mt-2">Contract: 0x1234...5678</p>
                <p className="text-xs text-green-600 mt-1">✓ 9 rules active</p>
              </div>
              <div className="p-4 border rounded-lg bg-white/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h4 className="font-semibold">Solana</h4>
                </div>
                <p className="text-sm text-gray-600">BusinessRuleEngine program deployed</p>
                <p className="text-xs text-gray-500 mt-2">Program: 7xKXtg...2hnB</p>
                <p className="text-xs text-green-600 mt-1">✓ 9 rules active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}