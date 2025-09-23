'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
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
  Menu,
  X,
  ChevronDown,
  Search,
  Bell,
  User,
  LogOut,
  HelpCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

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
    label: 'Customers',
    href: '/customers',
    icon: Users,
    badge: 'New',
    children: [
      { label: 'All Customers', href: '/customers', icon: Users },
      { label: 'KYC Verification', href: '/customers/kyc', icon: ShieldCheck },
      { label: 'Import Customers', href: '/customers/import', icon: FileText },
      { label: 'Create Customer', href: '/customers/create', icon: Users },
    ],
  },
  {
    label: 'Wallets',
    href: '/wallets',
    icon: Wallet,
    children: [
      { label: 'Enterprise Wallets', href: '/wallets/enterprise', icon: Wallet },
      { label: 'Consumer Wallets', href: '/wallets/consumer', icon: Wallet },
      { label: 'Invoice-First', href: '/wallets/invoice', icon: FileText },
      { label: 'Multi-Signature', href: '/wallets/multisig', icon: Shield },
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
    children: [
      { label: 'Payment Rails', href: '/payments/rails', icon: CreditCard },
      { label: 'FedNow', href: '/payments/fednow', icon: CreditCard },
      { label: 'RTP', href: '/payments/rtp', icon: CreditCard },
      { label: 'ACH', href: '/payments/ach', icon: CreditCard },
    ],
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

export default function MainNavigation() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 mr-6">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
              M
            </div>
            <span className="hidden font-bold md:inline-block">Monay Enterprise</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:flex-1 md:items-center md:space-x-1">
            {navigationItems.slice(0, 8).map((item) => (
              <div key={item.label} className="relative">
                {item.children ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={isActive(item.href) ? 'secondary' : 'ghost'}
                        size="sm"
                        className="gap-2"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      {item.children.map((child) => (
                        <DropdownMenuItem key={child.label} asChild>
                          <Link href={child.href} className="flex items-center gap-2">
                            <child.icon className="h-4 w-4" />
                            {child.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button
                    variant={isActive(item.href) ? 'secondary' : 'ghost'}
                    size="sm"
                    asChild
                  >
                    <Link href={item.href} className="gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                      {item.badge && (
                        <Badge variant="default" className="ml-1 h-5 px-1">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </Button>
                )}
              </div>
            ))}

            {/* More Menu for overflow items */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  More
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {navigationItems.slice(8).map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <Link href={item.href} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Right Side Items */}
          <div className="ml-auto flex items-center space-x-4">
            {/* Search */}
            <div className="hidden lg:flex">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[200px] lg:w-[300px]"
                />
              </div>
            </div>

            {/* Search Icon for Mobile */}
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600" />
            </Button>

            {/* Help */}
            <Button variant="ghost" size="icon">
              <HelpCircle className="h-5 w-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">Admin User</p>
                    <p className="text-xs text-muted-foreground">admin@monay.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 z-40 md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <nav className="fixed left-0 top-16 bottom-0 w-72 bg-background border-r overflow-y-auto">
            <div className="p-4 space-y-1">
              {navigationItems.map((item) => (
                <div key={item.label}>
                  <button
                    className={cn(
                      "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                      isActive(item.href) && "bg-secondary"
                    )}
                    onClick={() => {
                      if (item.children) {
                        toggleExpanded(item.label)
                      } else {
                        setIsMobileMenuOpen(false)
                      }
                    }}
                  >
                    <Link
                      href={item.href}
                      className="flex items-center gap-2 flex-1"
                      onClick={(e) => {
                        if (item.children) {
                          e.preventDefault()
                        }
                      }}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                      {item.badge && (
                        <Badge variant="default" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                    {item.children && (
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 transition-transform",
                          expandedItems.includes(item.label) && "rotate-180"
                        )}
                      />
                    )}
                  </button>
                  {item.children && expandedItems.includes(item.label) && (
                    <div className="ml-6 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground",
                            isActive(child.href) && "bg-secondary"
                          )}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <child.icon className="h-4 w-4" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  )
}