'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import {
  Menu,
  X,
  Home,
  Users,
  CreditCard,
  DollarSign,
  FileText,
  Settings,
  Shield,
  Building2,
  Wallet,
  ChevronRight,
  Bell,
  Search,
  UserCircle,
  LogOut,
  ChevronDown
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  children?: NavItem[]
}

const navigationItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: Home
  },
  {
    label: 'Organizations',
    href: '/organizations',
    icon: Building2,
    children: [
      { label: 'All Organizations', href: '/organizations' },
      { label: 'Create Organization', href: '/organizations/new' },
      { label: 'Hierarchy', href: '/organizations/hierarchy' }
    ]
  },
  {
    label: 'Customers',
    href: '/customers',
    icon: Users,
    badge: '12',
    children: [
      { label: 'All Customers', href: '/customers' },
      { label: 'KYC Verification', href: '/customers/kyc' },
      { label: 'Risk Assessment', href: '/customers/risk' }
    ]
  },
  {
    label: 'Wallets',
    href: '/wallets',
    icon: Wallet,
    children: [
      { label: 'Invoice Wallets', href: '/invoice-wallets' },
      { label: 'Enterprise Wallets', href: '/wallets' },
      { label: 'Treasury', href: '/wallets/treasury' }
    ]
  },
  {
    label: 'Payments',
    href: '/payments',
    icon: CreditCard,
    children: [
      { label: 'Transactions', href: '/payments/transactions' },
      { label: 'Cards', href: '/payments/cards' },
      { label: 'Transfers', href: '/payments/transfers' }
    ]
  },
  {
    label: 'Programs',
    href: '/programs',
    icon: DollarSign,
    badge: 'New',
    children: [
      { label: 'Emergency Disbursement', href: '/programs/emergency' },
      { label: 'SNAP/TANF', href: '/programs/benefits' },
      { label: 'Industry Verticals', href: '/programs/verticals' }
    ]
  },
  {
    label: 'Compliance',
    href: '/compliance',
    icon: Shield,
    children: [
      { label: 'Business Rules', href: '/compliance/rules' },
      { label: 'Monitoring', href: '/compliance/monitoring' },
      { label: 'Reports', href: '/compliance/reports' }
    ]
  },
  {
    label: 'Reports',
    href: '/reports',
    icon: FileText
  },
  {
    label: 'Settings',
    href: '/settings',
    icon: Settings
  }
]

export default function MobileNavigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev => 
      prev.includes(label) 
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const isActive = (href: string) => pathname === href

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.includes(item.label)
    const Icon = item.icon

    return (
      <div key={item.href} className="w-full">
        {hasChildren ? (
          <button
            onClick={() => toggleExpanded(item.label)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors',
              'hover:bg-gray-100',
              depth > 0 && 'pl-8'
            )}
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="h-5 w-5" />}
              <span>{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2">
                  {item.badge}
                </Badge>
              )}
            </div>
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          </button>
        ) : (
          <Link
            href={item.href}
            onClick={() => setIsOpen(false)}
            className={cn(
              'w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors',
              isActive(item.href)
                ? 'bg-blue-50 text-blue-600'
                : 'hover:bg-gray-100',
              depth > 0 && 'pl-12'
            )}
          >
            <div className="flex items-center gap-3">
              {Icon && <Icon className="h-5 w-5" />}
              <span>{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-2">
                  {item.badge}
                </Badge>
              )}
            </div>
            {!hasChildren && <ChevronRight className="h-4 w-4" />}
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
    <div className="lg:hidden">
      {/* Mobile Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b">
        <div className="flex items-center justify-between px-4 h-16">
          {/* Logo and Menu Toggle */}
          <div className="flex items-center gap-3">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <SheetHeader className="border-b px-4 py-4">
                  <SheetTitle>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                        M
                      </div>
                      <span className="font-bold text-lg">Monay Enterprise</span>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <ScrollArea className="h-[calc(100vh-5rem)] pb-8">
                  <div className="p-4 space-y-1">
                    {navigationItems.map(item => renderNavItem(item))}
                  </div>

                  {/* User Section */}
                  <div className="border-t p-4 mt-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        JD
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">John Doe</p>
                        <p className="text-xs text-gray-500">admin@monay.com</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100"
                        onClick={() => setIsOpen(false)}
                      >
                        <UserCircle className="h-4 w-4" />
                        Profile
                      </Link>
                      <button
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-gray-100 text-red-600"
                        onClick={() => {
                          // Handle logout
                          setIsOpen(false)
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="font-bold text-lg">Monay</span>
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t lg:hidden">
        <div className="grid grid-cols-5 h-16">
          {[
            { icon: Home, label: 'Home', href: '/dashboard' },
            { icon: Wallet, label: 'Wallets', href: '/wallets' },
            { icon: CreditCard, label: 'Pay', href: '/payments' },
            { icon: Users, label: 'Customers', href: '/customers' },
            { icon: Settings, label: 'More', href: '/settings' }
          ].map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                  isActive(item.href)
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}