'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Activity, TrendingUp, Wallet, CreditCard, FileText, Shield,
  Zap, PieChart, RefreshCcw, Settings as SettingsIcon, Search, Bell, User,
  LogOut, Menu, X, ChevronDown, Globe, Coins,
  ArrowUpDown, BarChart3
} from 'lucide-react'
import AnimatedDashboard from '@/components/AnimatedDashboard'
import EnhancedTokenManagement from '@/components/EnhancedTokenManagement'
import EnhancedTreasury from '@/components/EnhancedTreasury'
import EnhancedCompliance from '@/components/EnhancedCompliance'
import EnhancedAnalytics from '@/components/EnhancedAnalytics'
import CrossRailTransfer from '@/components/CrossRailTransfer'
import Settings from '@/components/Settings'
import EnhancedInvoiceManagement from '@/components/EnhancedInvoiceManagement'
import EnhancedBusinessRulesEngine from '@/components/EnhancedBusinessRulesEngine'
import EnhancedProgrammableWallet from '@/components/EnhancedProgrammableWallet'
import GlobalSearch from '@/components/GlobalSearch'
import EnhancedTransactionHistory from '@/components/EnhancedTransactionHistory'

export default function EnhancedEnterpriseWallet() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userRole, setUserRole] = useState<string>('enterprise_admin')
  const [userEmail, setUserEmail] = useState<string>('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [blockchainStatus, setBlockchainStatus] = useState({
    base: { status: 'connecting', balance: '0.00', network: 'Base Sepolia' },
    solana: { status: 'connecting', balance: '0.00', network: 'Devnet' }
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('userRole')
      const email = localStorage.getItem('userEmail')
      
      if (!role || !email) {
        router.push('/login')
        return
      }
      
      setUserRole(role)
      setUserEmail(email)
    }
    
    const timer = setTimeout(() => {
      setBlockchainStatus({
        base: { status: 'connected', balance: '1,250,000.00', network: 'Base Sepolia' },
        solana: { status: 'connected', balance: '50,000.00', network: 'Devnet' }
      })
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, color: 'from-blue-500 to-indigo-600' },
    { id: 'transactions', label: 'Transactions', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
    { id: 'invoices', label: 'Invoices', icon: FileText, color: 'from-purple-500 to-pink-600' },
    { id: 'wallet', label: 'Programmable Wallet', icon: Wallet, color: 'from-orange-500 to-red-600' },
    { id: 'tokens', label: 'Token Management', icon: Coins, color: 'from-cyan-500 to-blue-600' },
    { id: 'treasury', label: 'Treasury', icon: PieChart, color: 'from-indigo-500 to-purple-600' },
    { id: 'compliance', label: 'Compliance', icon: Shield, color: 'from-green-500 to-teal-600' },
    { id: 'rules', label: 'Business Rules', icon: Zap, color: 'from-yellow-500 to-orange-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'from-pink-500 to-rose-600' },
    { id: 'cross-rail', label: 'Cross-Rail', icon: RefreshCcw, color: 'from-teal-500 to-cyan-600' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, color: 'from-gray-500 to-gray-700' }
  ]

  const headerVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  }

  const tabVariants = {
    inactive: { scale: 1, y: 0 },
    active: { 
      scale: 1.05, 
      y: -2,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 20
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Header */}
      <motion.header 
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="glass backdrop-blur-xl border-b border-white/20 sticky top-0 z-50 shadow-lg"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo and Brand */}
            <motion.div 
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Monay Enterprise
                </h1>
                <p className="text-xs text-gray-500">CaaS Platform v2.0</p>
              </div>
            </motion.div>
            
            {/* Center Section - Blockchain Status */}
            <div className="hidden lg:flex items-center gap-6">
              <motion.div 
                className="flex gap-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                {/* Base Status */}
                <Card className="px-4 py-2 bg-white/50 backdrop-blur-sm border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full ${
                        blockchainStatus.base.status === 'connected' 
                          ? 'bg-green-500' 
                          : 'bg-yellow-500'
                      }`}>
                        <div className={`absolute inset-0 rounded-full ${
                          blockchainStatus.base.status === 'connected'
                            ? 'bg-green-500'
                            : 'bg-yellow-500'
                        } animate-ping`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Base L2</p>
                      <p className="text-xs text-gray-500">{blockchainStatus.base.network}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold">${blockchainStatus.base.balance}</p>
                    </div>
                  </div>
                </Card>

                {/* Solana Status */}
                <Card className="px-4 py-2 bg-white/50 backdrop-blur-sm border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full ${
                        blockchainStatus.solana.status === 'connected' 
                          ? 'bg-green-500' 
                          : 'bg-yellow-500'
                      }`}>
                        <div className={`absolute inset-0 rounded-full ${
                          blockchainStatus.solana.status === 'connected'
                            ? 'bg-green-500'
                            : 'bg-yellow-500'
                        } animate-ping`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold">Solana</p>
                      <p className="text-xs text-gray-500">{blockchainStatus.solana.network}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold">${blockchainStatus.solana.balance}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
            
            {/* Right Section - User Menu */}
            <div className="flex items-center gap-4">
              {/* Global Search */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <GlobalSearch />
              </motion.div>
              
              {/* Notifications */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                </Button>
              </motion.div>
              
              {/* User Profile Dropdown */}
              <motion.div 
                className="relative"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/20"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-semibold">
                      {userRole.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
                
                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-56 glass rounded-xl shadow-xl border border-white/20 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/10">
                        <p className="font-semibold">{userEmail}</p>
                        <p className="text-sm text-gray-500">
                          {userRole.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      </div>
                      <div className="p-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => setActiveTab('settings')}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile Settings
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            localStorage.removeItem('userRole')
                            localStorage.removeItem('userEmail')
                            router.push('/login')
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Enhanced Navigation */}
      <motion.nav 
        className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-[73px] z-40 shadow-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto py-2 scrollbar-hide">
            {tabs.map((tab, index) => {
              const Icon = tab.icon
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  variants={tabVariants}
                  initial="inactive"
                  animate={activeTab === tab.id ? 'active' : 'inactive'}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    relative px-4 py-3 rounded-xl font-medium whitespace-nowrap 
                    transition-all duration-200 flex items-center gap-2
                    ${activeTab === tab.id
                      ? 'bg-gradient-to-r text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                  style={{
                    backgroundImage: activeTab === tab.id ? `linear-gradient(135deg, ${tab.color.split(' ')[1]}, ${tab.color.split(' ')[3]})` : 'none'
                  }}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: `linear-gradient(135deg, ${tab.color.split(' ')[1]}, ${tab.color.split(' ')[3]})`,
                        zIndex: -1
                      }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}
          </div>
        </div>
      </motion.nav>

      {/* Main Content with Animation */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && <AnimatedDashboard blockchainStatus={blockchainStatus} />}
            {activeTab === 'transactions' && <EnhancedTransactionHistory />}
            {activeTab === 'invoices' && <EnhancedInvoiceManagement />}
            {activeTab === 'wallet' && <EnhancedProgrammableWallet />}
            {activeTab === 'tokens' && <EnhancedTokenManagement />}
            {activeTab === 'treasury' && <EnhancedTreasury />}
            {activeTab === 'compliance' && <EnhancedCompliance />}
            {activeTab === 'rules' && <EnhancedBusinessRulesEngine />}
            {activeTab === 'analytics' && <EnhancedAnalytics />}
            {activeTab === 'cross-rail' && <CrossRailTransfer />}
            {activeTab === 'settings' && <Settings />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} />
            <motion.div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Navigation</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      onClick={() => {
                        setActiveTab(tab.id)
                        setIsMenuOpen(false)
                      }}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      {tab.label}
                    </Button>
                  )
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}