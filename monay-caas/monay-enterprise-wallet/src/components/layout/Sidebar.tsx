'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import OrganizationSwitcher from '@/components/OrganizationSwitcher'
import {
  Home,
  Building2,
  Users,
  Wallet,
  ArrowRightLeft,
  FileText,
  Gift,
  CreditCard,
  TrendingUp,
  Shield,
  Factory,
  BarChart3,
  ShieldCheck,
  FileBarChart,
  Settings,
  ChevronDown,
  ChevronRight,
  Upload,
  UserCheck,
  UserPlus
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: string
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    label: 'Organizations',
    href: '/organizations',
    icon: Building2,
  },
  {
    label: 'Groups',
    href: '/groups',
    icon: Users,
    badge: 'New',
  },
  {
    label: 'Billing',
    href: '/billing',
    icon: CreditCard,
    badge: 'USDXM 10% OFF',
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
    badge: 'New',
    children: [
      { label: 'All Customers', href: '/customers', icon: Users },
      { label: 'KYC Verification', href: '/customers/kyc', icon: UserCheck },
      { label: 'Import Customers', href: '/customers/import', icon: Upload },
      { label: 'Create Customer', href: '/customers/create', icon: UserPlus },
    ],
  },
  {
    label: 'Wallets',
    href: '/wallets',
    icon: Wallet,
    children: [
      { label: 'All Wallets', href: '/wallets', icon: Wallet },
      { label: 'Invoice-First', href: '/invoice-wallets', icon: FileText },
      { label: 'Cross-Rail Transfer', href: '/wallets/cross-rail', icon: ArrowRightLeft },
    ],
  },
  {
    label: 'Transactions',
    href: '/transactions',
    icon: ArrowRightLeft,
  },
  {
    label: 'Invoices',
    href: '/invoices',
    icon: FileText,
  },
  {
    label: 'Benefits',
    href: '/benefits',
    icon: Gift,
    children: [
      { label: 'SNAP', href: '/benefits/snap', icon: Gift },
      { label: 'TANF', href: '/benefits/tanf', icon: Gift },
      { label: 'Emergency', href: '/benefits/emergency', icon: Gift },
    ],
  },
  {
    label: 'Payments',
    href: '/payments',
    icon: CreditCard,
  },
  {
    label: 'Capital Markets',
    href: '/capital-markets',
    icon: TrendingUp,
  },
  {
    label: 'Government Services',
    href: '/government-services',
    icon: Building2,
  },
  {
    label: 'Business Rules',
    href: '/business-rules',
    icon: Shield,
  },
  {
    label: 'Industries',
    href: '/industries',
    icon: Factory,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
  {
    label: 'Compliance',
    href: '/compliance',
    icon: ShieldCheck,
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: FileBarChart,
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.label)
    const Icon = item.icon
    const active = isActive(item.href)

    return (
      <div key={item.href} className="mb-1">
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.label)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              active && 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
              depth > 0 && 'pl-8'
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {item.badge}
                </Badge>
              )}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <Link
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              active && 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
              depth > 0 && 'pl-8'
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {item.badge}
              </Badge>
            )}
          </Link>
        )}

        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      <div className="flex flex-col h-full">
        {/* Logo and Organization Switcher */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="font-bold text-lg">Monay Enterprise</span>
          </div>
          <OrganizationSwitcher
            onOrgChange={(org) => {
              console.log('Organization changed to:', org)
            }}
          />
        </div>

        {/* Navigation Items */}
        <ScrollArea className="flex-1 px-3 py-4">
          <nav className="space-y-1">
            {navigationItems.map(item => renderNavItem(item))}
          </nav>
        </ScrollArea>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
              AD
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Admin User</p>
              <p className="text-xs text-gray-500 truncate">admin@monay.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}