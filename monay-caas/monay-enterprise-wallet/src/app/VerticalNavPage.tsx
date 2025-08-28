'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Activity, TrendingUp, Wallet, CreditCard, FileText, Shield, 
  Zap, PieChart, RefreshCcw, Settings, Search, Bell, User,
  LogOut, Menu, X, ChevronLeft, ChevronRight, Globe, Coins, 
  ArrowUpDown, BarChart3, Home
} from 'lucide-react'
import AnimatedDashboard from '@/components/AnimatedDashboard'
import EnhancedTokenManagement from '@/components/EnhancedTokenManagement'
import EnhancedTreasury from '@/components/EnhancedTreasury'
import EnhancedCompliance from '@/components/EnhancedCompliance'
import EnhancedAnalytics from '@/components/EnhancedAnalytics'
import EnhancedCrossRailTransfer from '@/components/EnhancedCrossRailTransfer'
import EnhancedSettings from '@/components/EnhancedSettings'
import EnhancedInvoiceManagement from '@/components/EnhancedInvoiceManagement'
import EnhancedBusinessRulesEngine from '@/components/EnhancedBusinessRulesEngine'
import EnhancedProgrammableWallet from '@/components/EnhancedProgrammableWallet'
import GlobalSearch from '@/components/GlobalSearch'
import EnhancedTransactionHistory from '@/components/EnhancedTransactionHistory'

export default function VerticalNavEnterpriseWallet() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [userRole, setUserRole] = useState<string>('enterprise_admin')
  const [userEmail, setUserEmail] = useState<string>('')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
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

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'from-blue-500 to-indigo-600' },
    { id: 'transactions', label: 'Transactions', icon: TrendingUp, color: 'from-green-500 to-emerald-600' },
    { id: 'invoices', label: 'Invoices', icon: FileText, color: 'from-purple-500 to-pink-600' },
    { id: 'wallet', label: 'Programmable Wallet', icon: Wallet, color: 'from-orange-500 to-red-600' },
    { id: 'tokens', label: 'Token Management', icon: Coins, color: 'from-cyan-500 to-blue-600' },
    { id: 'treasury', label: 'Treasury', icon: PieChart, color: 'from-indigo-500 to-purple-600' },
    { id: 'compliance', label: 'Compliance', icon: Shield, color: 'from-green-500 to-teal-600' },
    { id: 'rules', label: 'Business Rules', icon: Zap, color: 'from-yellow-500 to-orange-600' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'from-pink-500 to-rose-600' },
    { id: 'cross-rail', label: 'Cross-Rail Transfer', icon: RefreshCcw, color: 'from-teal-500 to-cyan-600' },
    { id: 'settings', label: 'Settings', icon: Settings, color: 'from-gray-500 to-gray-700' }
  ]

  const sidebarVariants = {
    expanded: { width: 280 },
    collapsed: { width: 80 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Vertical Sidebar */}
      <motion.aside
        initial="expanded"
        animate={isSidebarCollapsed ? 'collapsed' : 'expanded'}
        variants={sidebarVariants}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 h-full bg-white/90 backdrop-blur-xl border-r border-gray-200/50 shadow-xl z-40"
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="p-4 border-b border-gray-200/50">
            <motion.div className="flex items-center justify-between">
              <motion.div 
                className="flex items-center gap-3"
                animate={{ justifyContent: isSidebarCollapsed ? 'center' : 'flex-start' }}
              >
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <AnimatePresence>
                  {!isSidebarCollapsed && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Monay Enterprise
                      </h1>
                      <p className="text-xs text-gray-500">CaaS Platform v2.0</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              <motion.button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="h-5 w-5 text-gray-600" />
                ) : (
                  <ChevronLeft className="h-5 w-5 text-gray-600" />
                )}
              </motion.button>
            </motion.div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-3">
            <div className="space-y-1">
              {menuItems.map((item, index) => {
                const Icon = item.icon
                const isActive = activeTab === item.id
                
                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    whileHover={{ x: isSidebarCollapsed ? 0 : 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                      transition-all duration-200 relative group
                      ${isActive 
                        ? 'bg-gradient-to-r text-white shadow-lg' 
                        : 'hover:bg-gray-100 text-gray-700'
                      }
                    `}
                    style={{
                      backgroundImage: isActive ? `linear-gradient(135deg, ${item.color.split(' ')[1]}, ${item.color.split(' ')[3]})` : 'none'
                    }}
                  >
                    <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-600'}`} />
                    
                    <AnimatePresence>
                      {!isSidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-sm font-medium whitespace-nowrap"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    
                    {/* Tooltip for collapsed state */}
                    {isSidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                        {item.label}
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>
          </nav>

          {/* Blockchain Status */}
          <div className="border-t border-gray-200/50 p-3">
            <div className="space-y-2">
              {/* Base Status */}
              <div className={`flex items-center gap-2 p-2 rounded-lg bg-gray-50 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <div className="relative">
                  <div className={`w-2 h-2 rounded-full ${
                    blockchainStatus.base.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                    <div className={`absolute inset-0 rounded-full ${
                      blockchainStatus.base.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                    } animate-ping`} />
                  </div>
                </div>
                {!isSidebarCollapsed && (
                  <>
                    <span className="text-xs font-medium">Base L2</span>
                    <span className="text-xs text-gray-500 ml-auto">${blockchainStatus.base.balance}</span>
                  </>
                )}
              </div>
              
              {/* Solana Status */}
              <div className={`flex items-center gap-2 p-2 rounded-lg bg-gray-50 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                <div className="relative">
                  <div className={`w-2 h-2 rounded-full ${
                    blockchainStatus.solana.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}>
                    <div className={`absolute inset-0 rounded-full ${
                      blockchainStatus.solana.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                    } animate-ping`} />
                  </div>
                </div>
                {!isSidebarCollapsed && (
                  <>
                    <span className="text-xs font-medium">Solana</span>
                    <span className="text-xs text-gray-500 ml-auto">${blockchainStatus.solana.balance}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* User Profile Section */}
          <div className="border-t border-gray-200/50 p-3">
            <button
              onClick={() => {
                localStorage.removeItem('userRole')
                localStorage.removeItem('userEmail')
                router.push('/login')
              }}
              className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors ${
                isSidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="h-5 w-5" />
              {!isSidebarCollapsed && (
                <span className="text-sm font-medium">Logout</span>
              )}
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-[280px]'}`}>
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-30 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              {/* Page Title */}
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {menuItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-gray-500">
                  Manage your {menuItems.find(item => item.id === activeTab)?.label.toLowerCase()}
                </p>
              </div>
              
              {/* Header Actions */}
              <div className="flex items-center gap-4">
                {/* Global Search */}
                <GlobalSearch />
                
                {/* Notifications */}
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                  </Button>
                </motion.div>
                
                {/* User Profile */}
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gray-50">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                    {userEmail.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-semibold">
                      {userRole.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <p className="text-xs text-gray-500">{userEmail}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
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
              {activeTab === 'cross-rail' && <EnhancedCrossRailTransfer />}
              {activeTab === 'settings' && <EnhancedSettings />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}