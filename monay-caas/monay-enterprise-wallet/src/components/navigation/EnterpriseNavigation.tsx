'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  FileText,
  Shield,
  Coins,
  DollarSign,
  Wallet,
  Users,
  Settings,
  Building,
  TrendingUp,
  Globe,
  Briefcase,
  Menu,
  X,
  Home,
  ChevronDown,
  LogOut,
  HelpCircle,
  Bell,
  Receipt,
  Calculator,
  GitBranch,
  Database,
  BarChart3,
  ShieldCheck,
  CreditCard,
  Zap,
  Link2,
  Activity
} from 'lucide-react'

// Organization types
type OrganizationType = 'enterprise' | 'government' | 'financial' | 'healthcare' | 'education'

interface NavItem {
  id: string
  label: string
  path: string
  icon: any
  children?: NavItem[]
  visibleFor?: OrganizationType[]
}

// Main navigation items - visibility based on org type
const getNavigationItems = (orgType: OrganizationType): NavItem[] => {
  const allItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: Home
    },
    {
      id: 'invoices',
      label: 'Invoice-First',
      path: '/invoices',
      icon: FileText,
      children: [
        { id: 'invoice-dashboard', label: 'Dashboard', path: '/invoices', icon: BarChart3 },
        { id: 'create-invoice', label: 'Create Invoice', path: '/invoices/create', icon: FileText },
        { id: 'templates', label: 'Templates', path: '/invoices/templates', icon: FileText },
        { id: 'analytics', label: 'Analytics', path: '/invoices/analytics', icon: TrendingUp }
      ]
    },
    {
      id: 'business-rules',
      label: 'Business Rules',
      path: '/business-rules',
      icon: Zap,
      children: [
        { id: 'rules-dashboard', label: 'Rules Dashboard', path: '/business-rules', icon: Zap },
        { id: 'create-rule', label: 'Create Rule', path: '/business-rules/create', icon: Zap },
        { id: 'templates', label: 'Templates', path: '/business-rules/templates', icon: FileText },
        { id: 'test', label: 'Test Rules', path: '/business-rules/test', icon: Shield }
      ]
    },
    {
      id: 'compliance',
      label: 'Compliance',
      path: '/compliance',
      icon: Shield,
      children: [
        { id: 'overview', label: 'Overview', path: '/compliance', icon: Shield },
        { id: 'kyb', label: 'KYB Verification', path: '/compliance/kyb', icon: Building },
        { id: 'kyc', label: 'KYC Management', path: '/compliance/kyc', icon: Users },
        { id: 'eligibility', label: 'Eligibility', path: '/compliance/eligibility', icon: ShieldCheck },
        { id: 'spend-controls', label: 'Spend Controls', path: '/compliance/spend-controls', icon: Calculator }
      ]
    },
    {
      id: 'tokens',
      label: 'Tokens',
      path: '/tokens',
      icon: Coins,
      children: [
        { id: 'dashboard', label: 'Dashboard', path: '/tokens', icon: Coins },
        { id: 'create', label: 'Create Token', path: '/tokens/create', icon: Coins },
        { id: 'manage', label: 'Manage', path: '/tokens/manage', icon: Settings },
        { id: 'cross-rail', label: 'Cross-Rail', path: '/tokens/cross-rail', icon: GitBranch }
      ]
    },
    {
      id: 'treasury',
      label: 'Treasury',
      path: '/treasury',
      icon: DollarSign,
      children: [
        { id: 'dashboard', label: 'Dashboard', path: '/treasury/dashboard', icon: BarChart3 },
        { id: 'positions', label: 'Positions', path: '/treasury/positions', icon: Database },
        { id: 'liquidity', label: 'Liquidity', path: '/treasury/liquidity', icon: DollarSign },
        { id: 'investments', label: 'Investments', path: '/treasury/investments', icon: TrendingUp }
      ]
    },
    {
      id: 'payments',
      label: 'Payments',
      path: '/payments',
      icon: CreditCard,
      children: [
        { id: 'bulk', label: 'Bulk Payments', path: '/payments/bulk', icon: CreditCard },
        { id: 'payroll', label: 'Payroll', path: '/payments/payroll', icon: Users },
        { id: 'vendors', label: 'Vendors', path: '/payments/vendors', icon: Building },
        { id: 'cross-border', label: 'Cross-Border', path: '/payments/cross-border', icon: Globe }
      ]
    },
    {
      id: 'wallets',
      label: 'Wallets',
      path: '/wallets',
      icon: Wallet,
      children: [
        { id: 'corporate', label: 'Corporate', path: '/wallets/corporate', icon: Building },
        { id: 'departments', label: 'Departments', path: '/wallets/departments', icon: Briefcase },
        { id: 'multi-sig', label: 'Multi-Sig', path: '/wallets/multi-sig', icon: Shield }
      ]
    },
    {
      id: 'team',
      label: 'Team',
      path: '/team',
      icon: Users,
      children: [
        { id: 'users', label: 'Users', path: '/team/users', icon: Users },
        { id: 'roles', label: 'Roles', path: '/team/roles', icon: Shield },
        { id: 'workflows', label: 'Workflows', path: '/team/workflows', icon: GitBranch },
        { id: 'activity', label: 'Activity', path: '/team/activity', icon: Activity }
      ]
    },
    {
      id: 'account-summary',
      label: 'Account Summary',
      path: '/account-summary',
      icon: Receipt
    },
    // Conditional items based on org type
    {
      id: 'integrations',
      label: 'Integrations',
      path: '/integrations',
      icon: Link2,
      visibleFor: ['enterprise', 'healthcare', 'education']
    },
    {
      id: 'government',
      label: 'Government',
      path: '/government',
      icon: Building,
      visibleFor: ['government'],
      children: [
        { id: 'grants', label: 'Grants', path: '/government/grants', icon: DollarSign },
        { id: 'contracts', label: 'Contracts', path: '/government/contracts', icon: FileText },
        { id: 'procurement', label: 'Procurement', path: '/government/procurement', icon: Briefcase },
        { id: 'citizen-services', label: 'Citizen Services', path: '/government/citizen-services', icon: Users }
      ]
    },
    {
      id: 'capital-markets',
      label: 'Capital Markets',
      path: '/capital-markets',
      icon: TrendingUp,
      visibleFor: ['financial'],
      children: [
        { id: 'trading', label: 'Trading', path: '/capital-markets/trading', icon: TrendingUp },
        { id: 'portfolio', label: 'Portfolio', path: '/capital-markets/portfolio', icon: Briefcase },
        { id: 'settlement', label: 'Settlement', path: '/capital-markets/settlement', icon: Shield },
        { id: 'risk', label: 'Risk', path: '/capital-markets/risk', icon: Shield }
      ]
    }
  ]

  // Filter items based on organization type
  return allItems.filter(item => {
    if (!item.visibleFor) return true
    return item.visibleFor.includes(orgType)
  })
}

export default function EnterpriseNavigation() {
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [orgType, setOrgType] = useState<OrganizationType>('enterprise')

  useEffect(() => {
    // Get organization type from localStorage or API
    const storedOrgType = localStorage.getItem('organizationType') as OrganizationType
    if (storedOrgType) {
      setOrgType(storedOrgType)
    }
  }, [])

  const navigationItems = getNavigationItems(orgType)

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
    try {
      // Call backend logout endpoint to invalidate server-side session
      const authToken = localStorage.getItem('auth_token') || localStorage.getItem('authToken')

      if (authToken) {
        await fetch('http://localhost:3001/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }).catch(err => {
          console.log('Logout API call failed, clearing local data anyway:', err)
        })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // ALWAYS clear ALL authentication data - complete session termination
      // This ensures logout works even if backend call fails
      localStorage.removeItem('auth_token')  // Primary token key
      localStorage.removeItem('authToken')   // Legacy token key
      localStorage.removeItem('user')        // User profile data
      localStorage.removeItem('organizationType')  // Organization context
      localStorage.removeItem('rememberMe')  // Remember me preference

      // Clear session storage as well
      sessionStorage.clear()

      // Redirect to login page
      router.push('/auth/login')
    }
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 bg-white border-r border-gray-200">
        <div className="flex flex-col flex-1">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b">
            <span className="text-2xl font-bold text-gray-900">
              Monay Enterprise
            </span>
          </div>

          {/* Organization Type Badge */}
          <div className="px-6 py-3 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Organization Type</span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded capitalize">
                {orgType}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto min-h-0">
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
                        ? 'bg-blue-50 text-blue-700'
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
                              ? 'bg-blue-50 text-blue-700'
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
            <button
              onClick={() => handleNavigation('/settings')}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </button>
            <button
              onClick={() => handleNavigation('/notifications')}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5 mr-3" />
              Notifications
            </button>
            <button
              onClick={() => handleNavigation('/help')}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <HelpCircle className="h-5 w-5 mr-3" />
              Help & Support
            </button>
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
          <span className="text-xl font-bold text-gray-900">
            Monay Enterprise
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
            <span className="text-xl font-bold text-gray-900">
              Monay Enterprise
            </span>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Organization Type Badge */}
          <div className="px-4 py-3 border-b bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Organization Type</span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded capitalize">
                {orgType}
              </span>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto min-h-0">
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
                        ? 'bg-blue-50 text-blue-700'
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
                              ? 'bg-blue-50 text-blue-700'
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
            <button
              onClick={() => handleNavigation('/settings')}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Settings className="h-5 w-5 mr-3" />
              Settings
            </button>
            <button
              onClick={() => handleNavigation('/notifications')}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5 mr-3" />
              Notifications
            </button>
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