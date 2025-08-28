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
} from 'lucide-react';

export default function Navigation() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/send', label: 'Send Money', icon: Send },
    { href: '/payment-methods', label: 'Payment Methods', icon: Wallet },
    { href: '/analytics', label: 'Analytics', icon: PieChart },
    { href: '/transactions', label: 'Transactions', icon: Receipt },
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
      <nav className="hidden lg:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 flex-col z-40">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
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
        <div className="flex-1 p-4">
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all duration-200 group ${
                    active
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'hover:bg-purple-50 text-gray-700'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${active ? 'text-white' : 'text-gray-500 group-hover:text-purple-600'}`} />
                  <span className={`font-medium ${active ? 'text-white' : 'text-gray-700 group-hover:text-purple-600'}`}>
                    {item.label}
                  </span>
                  {active && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  )}
                </Link>
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

          <div className="p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-2xl transition-all ${
                      active
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'hover:bg-purple-50 text-gray-700'
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
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
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