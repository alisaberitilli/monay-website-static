'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, CreditCard,
  Activity, Send, FileText, Plus, BarChart3, ArrowRightLeft,
  Clock, CheckCircle, XCircle, AlertCircle, ExternalLink, DollarSign
} from 'lucide-react'
import TransactionDetailModal from '@/components/modals/TransactionDetailModal'
import TransferModal from '@/components/modals/TransferModal'
import CreateInvoiceModal from '@/components/modals/CreateInvoiceModal'
import OnboardingBanner from '@/components/OnboardingBanner'
import WalletAddressCard from '@/components/WalletAddressCard'
import { mockTransactions, getRecentTransactions, Transaction } from '@/lib/mock-data/transactions'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
}

interface AnimatedDashboardProps {
  blockchainStatus: any
  onNavigate?: (tab: string) => void
}

export default function AnimatedDashboard({ blockchainStatus, onNavigate }: AnimatedDashboardProps) {
  const router = useRouter()
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
  const [onboardingStatus, setOnboardingStatus] = useState<any>(null)
  const recentTransactions = getRecentTransactions(5)

  // Fetch onboarding status to show banner if incomplete
  useEffect(() => {
    const fetchOnboardingStatus = async () => {
      try {
        const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')
        if (!authToken) return

        const response = await fetch('http://localhost:3001/api/onboarding/status', {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        })

        if (response.ok) {
          const status = await response.json()
          setOnboardingStatus(status)
        }
      } catch (error) {
        console.error('Failed to fetch onboarding status:', error)
      }
    }

    fetchOnboardingStatus()
  }, [])
  
  const stats = [
    {
      title: "Total Balance",
      value: "$2,450,000",
      change: "+12.5%",
      trend: "up",
      icon: Wallet,
      color: "from-blue-500 to-indigo-600"
    },
    {
      title: "Today's Volume",
      value: "$345,670",
      change: "+8.2%",
      trend: "up",
      icon: Activity,
      color: "from-green-500 to-emerald-600"
    },
    {
      title: "Active Cards",
      value: "24",
      change: "+4",
      trend: "up",
      icon: CreditCard,
      color: "from-purple-500 to-pink-600"
    },
    {
      title: "Monthly Growth",
      value: "28.4%",
      change: "+5.2%",
      trend: "up",
      icon: TrendingUp,
      color: "from-orange-500 to-red-600"
    }
  ]

  const quickActions = [
    {
      label: "USDC Operations",
      icon: DollarSign,
      color: "from-cyan-500 to-blue-600",
      onClick: () => {
        router.push('/usdc-operations')
      }
    },
    {
      label: "Send Money",
      icon: Send,
      color: "from-blue-500 to-indigo-600",
      onClick: () => setIsTransferModalOpen(true)
    },
    {
      label: "Request Payment",
      icon: FileText,
      color: "from-green-500 to-emerald-600",
      onClick: () => {
        setIsInvoiceModalOpen(true)
      }
    },
    {
      label: "Add Card",
      icon: Plus,
      color: "from-purple-500 to-pink-600",
      onClick: () => {
        if (onNavigate) {
          onNavigate('wallet')
          toast.success('Navigate to Programmable Wallet to add a card')
        }
      }
    },
    {
      label: "View Analytics",
      icon: BarChart3,
      color: "from-orange-500 to-red-600",
      onClick: () => {
        if (onNavigate) {
          onNavigate('analytics')
        }
      }
    }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment':
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4" />
      case 'deposit':
        return <ArrowDownRight className="h-4 w-4" />
      case 'transfer':
      case 'swap':
        return <ArrowRightLeft className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const handleStatsClick = (stat: any) => {
    toast.success(`Opening ${stat.title} details`)
  }

  const handleBlockchainClick = (chain: string) => {
    const explorerUrl = chain === 'solana' 
      ? 'https://explorer.solana.com'
      : 'https://basescan.org'
    window.open(explorerUrl, '_blank')
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Onboarding Banner - Shows only if KYC incomplete */}
        <OnboardingBanner onboardingStatus={onboardingStatus} />

        {/* Welcome Section */}
        <motion.div variants={itemVariants}>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Enterprise Wallet Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor your dual-rail blockchain operations in real-time
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              variants={itemVariants}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleStatsClick(stat)}
              className="cursor-pointer"
            >
              <Card className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`} />
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </CardHeader>
                <CardContent>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.1, type: "spring" }}
                    className="text-2xl font-bold text-gray-900 dark:text-gray-100"
                  >
                    {stat.value}
                  </motion.div>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`text-xs flex items-center mt-1 ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {stat.change}
                  </motion.p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Wallet Address Card + Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My Wallet Address */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <WalletAddressCard
              address="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1"
              network="Base Sepolia"
              rail="evm"
              balance="$425,850.00"
            />
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Frequently used operations</CardDescription>
              </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <motion.div
                    key={action.label}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={action.onClick}
                      variant="outline"
                      className="w-full h-24 flex flex-col gap-3 hover:shadow-lg transition-all group"
                    >
                      <div className={`p-3 rounded-xl bg-gradient-to-r ${action.color} text-white group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">{action.label}</span>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
          </motion.div>
        </div>

        {/* Blockchain Status Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleBlockchainClick('base')}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Base L2 (Enterprise Rail)</CardTitle>
                  <CardDescription>ERC-3643 Compliant Tokens</CardDescription>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Network Status</span>
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-2"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      blockchainStatus?.base?.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-sm font-medium">
                      {blockchainStatus?.base?.status || 'Connecting...'}
                    </span>
                  </motion.span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Balance</span>
                  <span className="text-lg font-bold">
                    ${blockchainStatus?.base?.balance || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Network</span>
                  <span className="text-sm">
                    {blockchainStatus?.base?.network || 'Base Sepolia'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleBlockchainClick('solana')}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Solana (Consumer Rail)</CardTitle>
                  <CardDescription>Token-2022 Extensions</CardDescription>
                </div>
                <ExternalLink className="h-4 w-4 text-gray-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Network Status</span>
                  <motion.span
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="flex items-center gap-2"
                  >
                    <div className={`w-2 h-2 rounded-full ${
                      blockchainStatus?.solana?.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-sm font-medium">
                      {blockchainStatus?.solana?.status || 'Connecting...'}
                    </span>
                  </motion.span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Balance</span>
                  <span className="text-lg font-bold">
                    ${blockchainStatus?.solana?.balance || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Network</span>
                  <span className="text-sm">
                    {blockchainStatus?.solana?.network || 'Devnet'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>Your latest blockchain activity</CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (onNavigate) {
                      onNavigate('transactions')
                    }
                  }}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    whileHover={{ x: 4 }}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                    onClick={() => setSelectedTransaction(transaction)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${
                        transaction.type === 'payment' ? 'from-blue-500 to-indigo-600' :
                        transaction.type === 'deposit' ? 'from-green-500 to-emerald-600' :
                        transaction.type === 'withdrawal' ? 'from-orange-500 to-red-600' :
                        'from-purple-500 to-pink-600'
                      } bg-opacity-10`}>
                        {getTypeIcon(transaction.type)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{transaction.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transaction.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-semibold text-sm">
                          ${transaction.amount.toLocaleString()} {transaction.currency}
                        </p>
                        <div className="flex items-center gap-1 justify-end">
                          {getStatusIcon(transaction.status)}
                          <p className="text-xs text-gray-500 capitalize">{transaction.status}</p>
                        </div>
                      </div>
                      <ArrowUpRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Modals */}
      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          isOpen={!!selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      <TransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
      />

      <CreateInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />
    </>
  )
}