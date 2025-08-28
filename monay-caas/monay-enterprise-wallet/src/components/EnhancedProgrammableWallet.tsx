'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter, ModalTrigger } from '@/components/ui/modal'
import { 
  CreditCard, Plus, Code, Settings, Shield, Wallet,
  Activity, Globe, Smartphone, Key, Zap, ArrowRight,
  CheckCircle, Clock, AlertCircle, TrendingUp
} from 'lucide-react'
import toast from 'react-hot-toast'

export default function EnhancedProgrammableWallet() {
  const [activeTab, setActiveTab] = useState('overview')
  const [isCardModalOpen, setIsCardModalOpen] = useState(false)
  const [selectedCard, setSelectedCard] = useState<any>(null)

  const cards = [
    {
      id: 1,
      type: 'Virtual',
      number: '**** **** **** 4523',
      name: 'John Doe',
      expiry: '12/26',
      balance: '$25,000',
      status: 'active',
      network: 'Visa',
      color: 'bg-gradient-to-br from-blue-600 to-purple-600'
    },
    {
      id: 2,
      type: 'Physical',
      number: '**** **** **** 8791',
      name: 'Jane Smith',
      expiry: '08/25',
      balance: '$18,500',
      status: 'active',
      network: 'Mastercard',
      color: 'bg-gradient-to-br from-purple-600 to-pink-600'
    },
    {
      id: 3,
      type: 'Virtual',
      number: '**** **** **** 2156',
      name: 'Corporate Card',
      expiry: '03/27',
      balance: '$150,000',
      status: 'frozen',
      network: 'Visa',
      color: 'bg-gradient-to-br from-gray-600 to-gray-800'
    }
  ]

  const apiEndpoints = [
    { method: 'POST', path: '/api/wallet/create', description: 'Create new wallet', status: 'active' },
    { method: 'GET', path: '/api/wallet/{id}', description: 'Get wallet details', status: 'active' },
    { method: 'POST', path: '/api/wallet/transfer', description: 'Transfer funds', status: 'active' },
    { method: 'POST', path: '/api/cards/issue', description: 'Issue virtual card', status: 'active' },
    { method: 'GET', path: '/api/transactions', description: 'Get transactions', status: 'active' },
    { method: 'POST', path: '/api/webhook/register', description: 'Register webhook', status: 'beta' }
  ]

  const automationRules = [
    {
      id: 1,
      name: 'Auto-Sweep to Treasury',
      description: 'Sweep excess balance above $100k to treasury',
      trigger: 'Balance > $100,000',
      action: 'Transfer to Treasury',
      status: 'active',
      lastRun: '2 hours ago'
    },
    {
      id: 2,
      name: 'Fraud Detection Alert',
      description: 'Alert on transactions over $10k from new recipients',
      trigger: 'New recipient + Amount > $10k',
      action: 'Send alert + Require 2FA',
      status: 'active',
      lastRun: '5 hours ago'
    },
    {
      id: 3,
      name: 'Daily Spending Limit',
      description: 'Block transactions when daily limit reached',
      trigger: 'Daily spend > $50,000',
      action: 'Block transaction',
      status: 'paused',
      lastRun: 'Never'
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

  const handleCreateCard = () => {
    toast.success('Virtual card created successfully!')
    setIsCardModalOpen(false)
    setTimeout(() => {
      toast.success('Card is now ready for use')
    }, 2000)
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
            Programmable Wallet
          </h2>
          <p className="text-gray-600 mt-1">Manage cards, automate workflows, and integrate APIs</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Code className="h-4 w-4 mr-2" />
            API Docs
          </Button>
          <Modal open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
            <ModalTrigger asChild>
              <Button variant="gradient" className="shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                Issue Card
              </Button>
            </ModalTrigger>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>Issue New Card</ModalTitle>
                <ModalDescription>
                  Create a virtual or physical debit card for your wallet
                </ModalDescription>
              </ModalHeader>
              <div className="space-y-4 my-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Card Type</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="virtual">Virtual Card</option>
                    <option value="physical">Physical Card</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Cardholder Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Spending Limit</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="$10,000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Card Network</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option value="visa">Visa</option>
                    <option value="mastercard">Mastercard</option>
                  </select>
                </div>
              </div>
              <ModalFooter>
                <Button variant="outline" onClick={() => setIsCardModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="gradient" onClick={handleCreateCard}>
                  Issue Card
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Balance', value: '$193,500', icon: Wallet, color: 'from-blue-500 to-indigo-600' },
          { label: 'Active Cards', value: '3', icon: CreditCard, color: 'from-green-500 to-emerald-600' },
          { label: 'API Calls (24h)', value: '12,456', icon: Activity, color: 'from-purple-500 to-pink-600' },
          { label: 'Automation Rules', value: '3', icon: Zap, color: 'from-orange-500 to-red-600' }
        ].map((stat) => (
          <motion.div key={stat.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
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

      {/* Navigation Tabs */}
      <motion.div variants={itemVariants}>
        <div className="flex gap-2 border-b">
          {['overview', 'cards', 'api', 'automation', 'webhooks'].map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'gradient' : 'ghost'}
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Cards Section */}
      {activeTab === 'overview' && (
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Your Cards</CardTitle>
              <CardDescription>Manage virtual and physical debit cards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {cards.map((card, index) => (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, rotateY: 180 }}
                    animate={{ opacity: 1, rotateY: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                    className={`${card.color} p-6 rounded-2xl text-white shadow-xl relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-8">
                        <div>
                          <p className="text-xs opacity-75">{card.type} Card</p>
                          <p className="text-lg font-bold">{card.balance}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          card.status === 'active' ? 'bg-green-500/20 text-green-100' : 'bg-gray-500/20 text-gray-300'
                        }`}>
                          {card.status}
                        </span>
                      </div>
                      
                      <div className="space-y-4">
                        <p className="font-mono text-lg tracking-wider">{card.number}</p>
                        <div className="flex justify-between">
                          <div>
                            <p className="text-xs opacity-75">Card Holder</p>
                            <p className="text-sm font-medium">{card.name}</p>
                          </div>
                          <div>
                            <p className="text-xs opacity-75">Expires</p>
                            <p className="text-sm font-medium">{card.expiry}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <span className="text-lg font-bold">{card.network}</span>
                        <Button size="sm" variant="glass" className="text-white hover:bg-white/20">
                          Manage
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* API Section */}
      {activeTab === 'api' && (
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>API Endpoints</CardTitle>
              <CardDescription>Integrate wallet functionality into your applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {apiEndpoints.map((endpoint, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-4 border rounded-lg bg-white/50 dark:bg-gray-800/50"
                  >
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded text-xs font-bold ${
                        endpoint.method === 'GET' ? 'bg-green-100 text-green-700' :
                        endpoint.method === 'POST' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {endpoint.method}
                      </span>
                      <div>
                        <p className="font-mono text-sm">{endpoint.path}</p>
                        <p className="text-xs text-gray-500">{endpoint.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {endpoint.status === 'beta' && (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">Beta</span>
                      )}
                      <Button variant="outline" size="sm">
                        Test
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Automation Section */}
      {activeTab === 'automation' && (
        <motion.div variants={itemVariants}>
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
              <CardDescription>Set up automated workflows for your wallet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule, index) => (
                  <motion.div
                    key={rule.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 border rounded-xl bg-gradient-to-r from-white/50 to-white/30 dark:from-gray-800/50 dark:to-gray-900/30"
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
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{rule.description}</p>
                        <div className="flex gap-4 mt-3 text-xs">
                          <div className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Trigger: {rule.trigger}
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            Action: {rule.action}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {rule.lastRun}
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {rule.status === 'active' ? 'Pause' : 'Resume'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Features Grid */}
      <motion.div variants={itemVariants}>
        <Card className="glass-gradient">
          <CardHeader>
            <CardTitle>Circle-like Features</CardTitle>
            <CardDescription>Enterprise-grade programmable wallet capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Globe, label: 'Global Payments' },
                { icon: Shield, label: 'Secure Infrastructure' },
                { icon: Smartphone, label: 'Mobile SDKs' },
                { icon: Key, label: 'API Keys' },
                { icon: Activity, label: 'Real-time Webhooks' },
                { icon: Settings, label: 'Custom Rules' },
                { icon: TrendingUp, label: 'Analytics' },
                { icon: CheckCircle, label: 'Compliance' }
              ].map((feature) => (
                <motion.div
                  key={feature.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex flex-col items-center justify-center p-4 border rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm cursor-pointer"
                >
                  <feature.icon className="h-6 w-6 text-blue-600 mb-2" />
                  <span className="text-xs text-center">{feature.label}</span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}