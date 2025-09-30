'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Wallet,
  Send,
  CreditCard,
  Banknote,
  Bitcoin,
  ShoppingCart,
  Plane,
  Heart,
  GraduationCap,
  Film,
  Building2,
  User,
  Settings,
  Menu,
  X,
  Home,
  History,
  Receipt,
  PiggyBank,
  Gift,
  Bell,
  HelpCircle,
  LogOut,
  ChevronDown
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  path: string
  icon: any
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: Home
  },
  {
    id: 'wallet',
    label: 'Wallet',
    path: '/wallet',
    icon: Wallet,
    children: [
      { id: 'balances', label: 'Balances', path: '/wallet/balances', icon: Wallet },
      { id: 'transactions', label: 'Transactions', path: '/wallet/transactions', icon: History },
      { id: 'statements', label: 'Statements', path: '/wallet/statements', icon: Receipt }
    ]
  },
  {
    id: 'payments',
    label: 'Payments',
    path: '/payments',
    icon: Send,
    children: [
      { id: 'send', label: 'Send Money', path: '/payments/send', icon: Send },
      { id: 'request', label: 'Request Money', path: '/payments/request', icon: Receipt },
      { id: 'bills', label: 'Bill Pay', path: '/payments/bills', icon: Receipt },
      { id: 'scheduled', label: 'Scheduled', path: '/payments/scheduled', icon: Receipt }
    ]
  },
  {
    id: 'cards',
    label: 'Cards',
    path: '/cards',
    icon: CreditCard,
    children: [
      { id: 'virtual', label: 'Virtual Cards', path: '/cards/virtual', icon: CreditCard },
      { id: 'physical', label: 'Physical Cards', path: '/cards/physical', icon: CreditCard },
      { id: 'controls', label: 'Card Controls', path: '/cards/controls', icon: Settings }
    ]
  },
  {
    id: 'banking',
    label: 'Banking',
    path: '/banking',
    icon: Banknote,
    children: [
      { id: 'deposits', label: 'Add Money', path: '/banking/deposits', icon: Banknote },
      { id: 'withdrawals', label: 'Withdraw', path: '/banking/withdrawals', icon: Banknote },
      { id: 'accounts', label: 'Bank Accounts', path: '/banking/accounts', icon: Building2 }
    ]
  },
  {
    id: 'crypto',
    label: 'Crypto',
    path: '/crypto',
    icon: Bitcoin,
    children: [
      { id: 'buy-sell', label: 'Buy/Sell', path: '/crypto/buy-sell', icon: Bitcoin },
      { id: 'swap', label: 'Swap', path: '/crypto/swap', icon: Bitcoin },
      { id: 'defi', label: 'DeFi', path: '/crypto/defi', icon: Bitcoin },
      { id: 'staking', label: 'Staking', path: '/crypto/staking', icon: Bitcoin }
    ]
  },
  {
    id: 'services',
    label: 'Services',
    path: '/services',
    icon: ShoppingCart,
    children: [
      { id: 'travel', label: 'Travel', path: '/services/travel', icon: Plane },
      { id: 'shopping', label: 'Shopping', path: '/services/shopping', icon: ShoppingCart },
      { id: 'healthcare', label: 'Healthcare', path: '/services/healthcare', icon: Heart },
      { id: 'education', label: 'Education', path: '/services/education', icon: GraduationCap },
      { id: 'entertainment', label: 'Entertainment', path: '/services/entertainment', icon: Film },
      { id: 'government', label: 'Government', path: '/services/government', icon: Building2 }
    ]
  },
  {
    id: 'account-summary',
    label: 'Account Summary',
    path: '/account-summary',
    icon: Receipt
  },
  {
    id: 'savings',
    label: 'Savings Goals',
    path: '/savings',
    icon: PiggyBank
  },
  {
    id: 'rewards',
    label: 'Rewards',
    path: '/rewards',
    icon: Gift
  }
]

const bottomNavItems: NavItem[] = [
  {
    id: 'profile',
    label: 'Profile',
    path: '/profile',
    icon: User
  },
  {
    id: 'settings',
    label: 'Settings',
    path: '/settings',
    icon: Settings
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: '/notifications',
    icon: Bell
  },
  {
    id: 'help',
    label: 'Help & Support',
    path: '/help',
    icon: HelpCircle
  }
]

export default function MainNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/')
  }

  const handleNavigation = (path: string) => {
    router.push(path as any)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    router.push('/login' as any)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-1">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Monay
            </span>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (item.children) {
                        toggleExpanded(item.id)
                      } else {
                        handleNavigation(item.path)
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </div>
                    {item.children && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expandedItems.includes(item.id) ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Children Items */}
                  {item.children && expandedItems.includes(item.id) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleNavigation(child.path)}
                          className={`w-full flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            isActive(child.path)
                              ? 'bg-purple-50 text-purple-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <child.icon className="h-4 w-4 mr-2" />
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="border-t p-3 space-y-1">
            {bottomNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Monay
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Menu Drawer */}
      <div
        className={`lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-white transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Monay
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <div key={item.id}>
                  <button
                    onClick={() => {
                      if (item.children) {
                        toggleExpanded(item.id)
                      } else {
                        handleNavigation(item.path)
                      }
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive(item.path)
                        ? 'bg-purple-50 text-purple-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center">
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </div>
                    {item.children && (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expandedItems.includes(item.id) ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Children Items */}
                  {item.children && expandedItems.includes(item.id) && (
                    <div className="ml-8 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => handleNavigation(child.path)}
                          className={`w-full flex items-center px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            isActive(child.path)
                              ? 'bg-purple-50 text-purple-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <child.icon className="h-4 w-4 mr-2" />
                          {child.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Mobile Bottom Section */}
          <div className="border-t p-3 space-y-1">
            {bottomNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <item.icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}