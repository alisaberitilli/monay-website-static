'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Home,
  Send,
  CreditCard,
  PieChart,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  User,
  Wallet,
  TrendingUp,
  Receipt,
  HelpCircle,
  Moon,
  Sun,
  FileText,
  Users,
  // Super App Icons - All Outline/Stroke Style
  Plane,
  Car,
  MapPin,
  Building2,
  ShoppingBag,
  Heart,
  GraduationCap,
  Music,
  Gamepad2,
  Zap,
  Bus,
  Train,
  Ship,
  Bed,
  Coffee,
  Utensils,
  ShoppingCart,
  Store,
  Stethoscope,
  Pill,
  BookOpen,
  Award,
  Calendar,
  Ticket,
  Tv,
  Shield,
  Building,
  ChevronRight,
  ChevronDown,
  Trophy,
  // Additional outline icons for better consistency
  Hotel,
  Smartphone,
  QrCode,
  CreditCard as Card,
} from 'lucide-react';

// TypeScript interfaces for super app navigation
interface NavItem {
  href: string;
  label: string;
  icon: any;
  category?: string;
  isNew?: boolean;
}

interface NavCategory {
  name: string;
  icon: any;
  items: NavItem[];
  gradient: string;
}

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Core financial features
  const coreNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/account-summary', label: 'Account Summary', icon: TrendingUp },
    { href: '/send', label: 'Send Money', icon: Send },
    { href: '/invoices', label: 'Invoices', icon: FileText },
    { href: '/p2p-requests', label: 'P2P Requests', icon: Users },
    { href: '/payment-methods', label: 'Payment Methods', icon: Wallet },
    { href: '/cards', label: 'Cards', icon: CreditCard },
    { href: '/analytics', label: 'Analytics', icon: PieChart },
    { href: '/transactions', label: 'Transactions', icon: Receipt },
  ];

  // Super App Categories with all U.S.-centric features - All Outline Icons
  const superAppCategories: NavCategory[] = [
    {
      name: 'Travel & Mobility',
      icon: Plane,
      gradient: 'from-blue-500 to-cyan-500',
      items: [
        { href: '/travel/flights', label: 'Flights', icon: Plane, isNew: true },
        { href: '/travel/hotels', label: 'Hotels', icon: Hotel },
        { href: '/travel/rideshare', label: 'Ride Share', icon: Car },
        { href: '/travel/public-transit', label: 'Public Transit', icon: Bus },
        { href: '/travel/tolls', label: 'Tolls & Parking', icon: MapPin },
        { href: '/travel/ev-charging', label: 'EV Charging', icon: Zap },
        { href: '/travel/car-rental', label: 'Car Rental', icon: Car },
        { href: '/travel/train', label: 'Train & Amtrak', icon: Train },
      ]
    },
    {
      name: 'Hospitality & Dining',
      icon: Utensils,
      gradient: 'from-orange-500 to-red-500',
      items: [
        { href: '/hospitality/restaurants', label: 'Restaurants', icon: Utensils },
        { href: '/hospitality/coffee', label: 'Coffee & Cafes', icon: Coffee },
        { href: '/hospitality/delivery', label: 'Food Delivery', icon: ShoppingBag },
        { href: '/hospitality/events', label: 'Event Venues', icon: Calendar },
        { href: '/hospitality/catering', label: 'Catering', icon: Users },
      ]
    },
    {
      name: 'Retail & Shopping',
      icon: ShoppingCart,
      gradient: 'from-purple-500 to-pink-500',
      items: [
        { href: '/retail/marketplace', label: 'Marketplace', icon: Store, isNew: true },
        { href: '/retail/groceries', label: 'Groceries', icon: ShoppingCart },
        { href: '/retail/fashion', label: 'Fashion', icon: ShoppingBag },
        { href: '/retail/electronics', label: 'Electronics', icon: Smartphone },
        { href: '/retail/qr-payments', label: 'QR Merchant Pay', icon: QrCode },
      ]
    },
    {
      name: 'Healthcare',
      icon: Heart,
      gradient: 'from-green-500 to-emerald-500',
      items: [
        { href: '/healthcare/bills', label: 'Medical Bills', icon: Receipt },
        { href: '/healthcare/pharmacy', label: 'Pharmacy', icon: Pill },
        { href: '/healthcare/hsa-fsa', label: 'HSA/FSA Wallet', icon: Wallet },
        { href: '/healthcare/appointments', label: 'Appointments', icon: Calendar },
        { href: '/healthcare/insurance', label: 'Insurance', icon: Shield },
      ]
    },
    {
      name: 'Education',
      icon: GraduationCap,
      gradient: 'from-indigo-500 to-purple-500',
      items: [
        { href: '/education/tuition', label: 'Tuition Payment', icon: GraduationCap },
        { href: '/education/student-loans', label: 'Student Loans', icon: FileText },
        { href: '/education/scholarships', label: 'Scholarships', icon: Award },
        { href: '/education/books', label: 'Textbooks', icon: BookOpen },
        { href: '/education/supplies', label: 'School Supplies', icon: Users },
      ]
    },
    {
      name: 'Entertainment',
      icon: Music,
      gradient: 'from-pink-500 to-rose-500',
      items: [
        { href: '/entertainment/tickets', label: 'Event Tickets', icon: Ticket },
        { href: '/entertainment/streaming', label: 'Streaming', icon: Tv },
        { href: '/entertainment/gaming', label: 'Gaming', icon: Gamepad2 },
        { href: '/entertainment/music', label: 'Music', icon: Music },
        { href: '/entertainment/sports', label: 'Sports Events', icon: Trophy },
      ]
    },
    {
      name: 'Government & Benefits',
      icon: Building,
      gradient: 'from-gray-600 to-gray-800',
      items: [
        { href: '/government/snap', label: 'SNAP Benefits', icon: ShoppingCart },
        { href: '/government/unemployment', label: 'Unemployment', icon: FileText },
        { href: '/government/tax-refunds', label: 'Tax Refunds', icon: Receipt },
        { href: '/government/social-security', label: 'Social Security', icon: Shield },
        { href: '/government/medicare', label: 'Medicare', icon: Heart },
        { href: '/government/utilities', label: 'Utilities', icon: Zap },
      ]
    }
  ];

  const notifications = [
    { id: 1, text: 'You received $250 from John Doe', time: '2 min ago', unread: true },
    { id: 2, text: 'Your payment of $45 was successful', time: '1 hour ago', unread: true },
    { id: 3, text: 'New security update available', time: '3 hours ago', unread: false },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex-col z-40">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Monay
            </span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">Premium Account</p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Core Financial Features */}
          <div className="space-y-1 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">Financial</p>
            {coreNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                    active
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'hover:bg-purple-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400'}`} />
                  <span className={`font-medium ${active ? 'text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400'}`}>
                    {item.label}
                  </span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Super App Categories */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4 mb-3">Super Services</p>
            {superAppCategories.map((category) => {
              const CategoryIcon = category.icon;
              const isExpanded = expandedCategory === category.name;

              return (
                <div key={category.name} className="space-y-1">
                  {/* Category Header */}
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      isExpanded ? 'bg-gray-50 dark:bg-gray-800' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3 text-left">
                      <CategoryIcon className="h-5 w-5 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200" />
                      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 text-left">{category.name}</span>
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`} />
                  </button>

                  {/* Category Items */}
                  {isExpanded && (
                    <div className="ml-8 space-y-1 animate-in slide-in-from-top-2 duration-200">
                      {category.items.map((item) => {
                        const ItemIcon = item.icon;
                        const active = isActive(item.href);

                        return (
                          <Link
                            key={item.href}
                            href={item.href as any}
                            className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                              active
                                ? `bg-gradient-to-r ${category.gradient} text-white shadow-md`
                                : 'hover:bg-gray-50 text-gray-600'
                            }`}
                          >
                            <ItemIcon className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                            <span className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-600 group-hover:text-gray-800'}`}>
                              {item.label}
                            </span>
                            {item.isNew && (
                              <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                NEW
                              </span>
                            )}
                            {active && (
                              <div className="ml-auto w-1 h-1 bg-white rounded-full animate-pulse" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Secondary Navigation */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="space-y-1">
              <Link
                href="/settings"
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-700 transition-all"
              >
                <Settings className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Settings</span>
              </Link>
              <Link
                href="/help"
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-700 transition-all"
              >
                <HelpCircle className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Help & Support</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all"
          >
            <LogOut className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-700">Logout</span>
          </button>
        </div>
      </nav>

      {/* Top Bar for Desktop */}
      <div className="hidden lg:flex fixed top-0 right-0 left-64 h-16 bg-white/80 backdrop-blur-lg border-b border-gray-100 items-center justify-between px-8 z-30">
        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions, cards..."
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-purple-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2.5 hover:bg-gray-100 rounded-xl transition-all"
          >
            {isDarkMode ? (
              <Sun className="h-5 w-5 text-gray-600" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 hover:bg-gray-100 rounded-xl transition-all"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-gray-50 transition-all ${
                        notif.unread ? 'bg-purple-50/50' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {notif.unread && (
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-gray-700">{notif.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-100">
                  <button className="w-full text-center text-sm text-purple-600 font-medium hover:text-purple-700">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-3 p-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">Premium Account</p>
                </div>
                <div className="p-2">
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-all"
                  >
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">My Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center space-x-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-all"
                  >
                    <Settings className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">Settings</span>
                  </Link>
                </div>
                <div className="p-2 border-t border-gray-100">
                  <button
                    onClick={logout}
                    className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-red-50 rounded-xl transition-all text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-b border-gray-100 flex items-center justify-between px-4 z-40">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold">M</span>
            </div>
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Monay
            </span>
          </Link>

          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-all">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-all"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5 text-gray-600" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        {/* Mobile Menu Drawer */}
        <div className={`fixed top-0 right-0 h-full w-72 bg-white transform transition-transform duration-300 z-40 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500">Premium Account</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-all"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="p-4 overflow-y-auto">
            {/* Core Financial Features - Mobile */}
            <div className="space-y-1 mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">Financial</p>
              {coreNavItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href as any}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                      active
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'hover:bg-purple-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500'}`} />
                    <span className={`font-medium ${active ? 'text-white' : 'text-gray-700'}`}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Super App Categories - Mobile */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-4 mb-3">Super Services</p>
              {superAppCategories.map((category) => {
                const CategoryIcon = category.icon;
                const isExpanded = expandedCategory === category.name;

                return (
                  <div key={category.name} className="space-y-1">
                    <button
                      onClick={() => setExpandedCategory(isExpanded ? null : category.name)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all ${
                        isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-xl bg-gradient-to-r ${category.gradient} flex items-center justify-center shadow-sm`}>
                          <CategoryIcon className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-700">{category.name}</span>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`} />
                    </button>

                    {isExpanded && (
                      <div className="ml-8 space-y-1">
                        {category.items.map((item) => {
                          const ItemIcon = item.icon;
                          const active = isActive(item.href);

                          return (
                            <Link
                              key={item.href}
                              href={item.href as any}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all ${
                                active
                                  ? `bg-gradient-to-r ${category.gradient} text-white shadow-md`
                                  : 'hover:bg-gray-50 text-gray-600'
                              }`}
                            >
                              <ItemIcon className={`h-4 w-4 ${active ? 'text-white' : 'text-gray-400'}`} />
                              <span className={`text-sm font-medium ${active ? 'text-white' : 'text-gray-600'}`}>
                                {item.label}
                              </span>
                              {item.isNew && (
                                <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">
                                  NEW
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 space-y-1">
              <Link
                href="/settings"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-700 transition-all"
              >
                <Settings className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Settings</span>
              </Link>
              <Link
                href="/help"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-gray-50 text-gray-700 transition-all"
              >
                <HelpCircle className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Help & Support</span>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-2xl hover:bg-red-50 text-red-600 transition-all"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-lg border-t border-gray-100 flex items-center justify-around px-2 z-30">
          {[coreNavItems[0], coreNavItems[1], coreNavItems[2], coreNavItems[6]].map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href as any}
                className={`flex flex-col items-center space-y-1 p-2 rounded-xl transition-all ${
                  active ? 'text-purple-600' : 'text-gray-500'
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? 'text-purple-600' : 'text-gray-500'}`} />
                <span className={`text-xs ${active ? 'text-purple-600 font-medium' : 'text-gray-500'}`}>
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}