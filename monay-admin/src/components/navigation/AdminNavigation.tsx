'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { authService } from '@/services/auth.service'
import {
  Home,
  Users,
  Building,
  CreditCard,
  Shield,
  DollarSign,
  BarChart3,
  Settings,
  Database,
  Globe,
  Activity,
  FileText,
  AlertTriangle,
  Menu,
  X,
  ChevronDown,
  LogOut,
  HelpCircle,
  Bell,
  TrendingUp,
  Calculator,
  Package,
  GitBranch,
  Cloud,
  Key,
  Receipt,
  Briefcase,
  Target,
  PieChart
} from 'lucide-react'

interface NavItem {
  id: string
  label: string
  path: string
  icon: any
  children?: NavItem[]
  badge?: string
  badgeColor?: string
}

const navigationItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    path: '/overview',
    icon: Home,
    children: [
      { id: 'dashboard', label: 'Dashboard', path: '/overview', icon: Home },
      { id: 'kpi-dashboard', label: 'KPI Dashboard', path: '/overview/kpi-dashboard', icon: Target }
    ]
  },
  {
    id: 'platform',
    label: 'Platform Management',
    path: '/platform',
    icon: Cloud,
    children: [
      { id: 'health', label: 'System Health', path: '/platform/health', icon: Activity },
      { id: 'configuration', label: 'Configuration', path: '/platform/configuration', icon: Settings },
      { id: 'tenants', label: 'Tenants', path: '/platform/tenants', icon: Building }
    ]
  },
  {
    id: 'users',
    label: 'User Management',
    path: '/users',
    icon: Users,
    children: [
      { id: 'enterprise', label: 'Enterprise Users', path: '/users/enterprise', icon: Building },
      { id: 'consumer', label: 'Consumer Users', path: '/users/consumer', icon: Users },
      { id: 'roles', label: 'Roles & Permissions', path: '/users/roles', icon: Key },
      { id: 'onboarding-status', label: 'Onboarding Status', path: '/users/onboarding-status', icon: Activity }
    ]
  },
  {
    id: 'providers',
    label: 'Payment Providers',
    path: '/providers',
    icon: CreditCard,
    children: [
      { id: 'tempo', label: 'Tempo', path: '/providers/tempo', icon: CreditCard },
      { id: 'circle', label: 'Circle', path: '/providers/circle', icon: CreditCard },
      { id: 'stripe', label: 'Stripe', path: '/providers/stripe', icon: CreditCard },
      { id: 'health', label: 'Provider Health', path: '/providers/health', icon: Activity }
    ]
  },
  {
    id: 'compliance',
    label: 'Compliance & Risk',
    path: '/compliance',
    icon: Shield,
    children: [
      { id: 'kyc-aml', label: 'KYC/AML', path: '/compliance/kyc-aml', icon: Shield },
      { id: 'kyc-kyb-costs', label: 'KYC/KYB Costs', path: '/compliance/kyc-kyb-costs', icon: Calculator },
      { id: 'business-rules', label: 'Business Rules', path: '/compliance/business-rules', icon: GitBranch },
      { id: 'monitoring', label: 'Transaction Monitoring', path: '/compliance/monitoring', icon: Activity },
      { id: 'reporting', label: 'Regulatory Reporting', path: '/compliance/reporting', icon: FileText }
    ]
  },
  {
    id: 'financial',
    label: 'Financial Operations',
    path: '/financial',
    icon: DollarSign,
    children: [
      { id: 'subscription-management', label: 'Subscriptions', path: '/subscription-management', icon: Package },
      { id: 'profitability', label: 'Profitability', path: '/profitability', icon: TrendingUp },
      { id: 'treasury', label: 'Treasury', path: '/financial/treasury', icon: DollarSign },
      { id: 'settlement', label: 'Settlement', path: '/financial/settlement', icon: Receipt },
      { id: 'billing', label: 'Billing', path: '/financial/billing', icon: Receipt }
    ]
  },
  {
    id: 'blockchain',
    label: 'Blockchain Ops',
    path: '/blockchain',
    icon: GitBranch,
    children: [
      { id: 'contracts', label: 'Smart Contracts', path: '/blockchain/contracts', icon: FileText },
      { id: 'bridge', label: 'Cross-Chain Bridge', path: '/blockchain/bridge', icon: GitBranch },
      { id: 'tokens', label: 'Token Management', path: '/blockchain/tokens', icon: Database },
      { id: 'gas', label: 'Gas Management', path: '/blockchain/gas', icon: Activity }
    ]
  },
  {
    id: 'analytics',
    label: 'Analytics & Reports',
    path: '/analytics',
    icon: BarChart3,
    children: [
      { id: 'executive', label: 'Executive Dashboard', path: '/analytics/executive', icon: PieChart },
      { id: 'transactions', label: 'Transaction Analytics', path: '/analytics/transactions', icon: Activity },
      { id: 'revenue', label: 'Revenue Analytics', path: '/analytics/revenue', icon: TrendingUp },
      { id: 'users', label: 'User Analytics', path: '/analytics/users', icon: Users },
      { id: 'performance', label: 'Performance Metrics', path: '/analytics/performance', icon: Activity }
    ]
  },
  {
    id: 'support',
    label: 'Support & Operations',
    path: '/support',
    icon: HelpCircle,
    children: [
      { id: 'tickets', label: 'Support Tickets', path: '/support/tickets', icon: FileText },
      { id: 'alerts', label: 'Alerts', path: '/support/alerts', icon: AlertTriangle },
      { id: 'notifications', label: 'System Notifications', path: '/support/notifications', icon: Bell }
    ]
  }
]

const bottomNavItems: NavItem[] = [
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
    icon: Bell,
    badge: '3',
    badgeColor: 'red'
  },
  {
    id: 'help',
    label: 'Help & Documentation',
    path: '/help',
    icon: HelpCircle
  }
]

export default function AdminNavigation() {
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
    router.push(path)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    // Use authService to properly clear all localStorage items
    await authService.logout()
    // authService.logout() already redirects to /login
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-gray-900 text-white">
        <div className="flex flex-col flex-1">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-gray-800">
            <span className="text-2xl font-bold">
              Monay Admin
            </span>
          </div>

          {/* Admin Badge */}
          <div className="px-6 py-3 border-b border-gray-800 bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Super Admin</span>
              <span className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded">
                ADMIN
              </span>
            </div>
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
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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
                              ? 'bg-gray-700 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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
          <div className="border-t border-gray-800 p-3 space-y-1">
            {bottomNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </div>
                {item.badge && (
                  <span className={`px-2 py-1 text-xs font-medium bg-${item.badgeColor}-600 text-white rounded-full`}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white">
        <div className="flex items-center justify-between h-16 px-4">
          <span className="text-xl font-bold">
            Monay Admin
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-800"
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
        className={`lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-gray-900 text-white transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
            <span className="text-xl font-bold">
              Monay Admin
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Admin Badge */}
          <div className="px-4 py-3 border-b border-gray-800 bg-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">Super Admin</span>
              <span className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded">
                ADMIN
              </span>
            </div>
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
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
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
                              ? 'bg-gray-700 text-white'
                              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
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
          <div className="border-t border-gray-800 p-3 space-y-1">
            {bottomNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <div className="flex items-center">
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </div>
                {item.badge && (
                  <span className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-400 hover:bg-gray-800 hover:text-red-300 rounded-lg transition-colors"
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