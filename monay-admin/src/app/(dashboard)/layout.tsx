'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Wallet,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  Shield,
  Building,
  DollarSign,
  Activity,
  Layers,
  BarChart3,
  FileText,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { authService } from '@/services/auth.service';
import Link from 'next/link';
import { motion } from 'framer-motion';
import MonayLogo from '@/components/MonayLogo';

const sidebarItems = [
  {
    key: '/platform',
    icon: Activity,
    label: 'Platform Overview',
    href: '/platform',
    badge: 'SUPER ADMIN',
    color: 'bg-gradient-to-r from-blue-500 to-purple-500',
  },
  {
    key: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    href: '/dashboard',
  },
  {
    key: 'divider-providers',
    type: 'divider',
    label: 'STABLECOIN PROVIDERS',
  },
  {
    key: '/tempo-management',
    icon: Activity,
    label: 'Tempo (100K TPS)',
    href: '/tempo-management',
    badge: 'PRIMARY',
    color: 'bg-blue-600',
  },
  {
    key: '/circle-management',
    icon: DollarSign,
    label: 'Circle USDC',
    href: '/circle-management',
    badge: 'FALLBACK',
    color: 'bg-purple-600',
  },
  {
    key: '/providers',
    icon: Layers,
    label: 'Provider Comparison',
    href: '/providers',
  },
  {
    key: 'divider-management',
    type: 'divider',
    label: 'PLATFORM MANAGEMENT',
  },
  {
    key: '/tenants',
    icon: Building,
    label: 'Tenants',
    href: '/tenants',
  },
  {
    key: '/users-management',
    icon: Users,
    label: 'User Management',
    href: '/users-management',
  },
  {
    key: '/transactions',
    icon: CreditCard,
    label: 'Transactions',
    href: '/transactions',
  },
  {
    key: '/wallet',
    icon: Wallet,
    label: 'Wallets',
    href: '/wallet',
  },
  {
    key: '/billing-analytics',
    icon: DollarSign,
    label: 'Billing Analytics',
    href: '/billing-analytics',
  },
  {
    key: 'divider-compliance',
    type: 'divider',
    label: 'COMPLIANCE & SECURITY',
  },
  {
    key: '/compliance',
    icon: Shield,
    label: 'Compliance & KYC',
    href: '/compliance',
  },
  {
    key: '/business-rules',
    icon: Shield,
    label: 'Business Rules',
    href: '/business-rules',
  },
  {
    key: 'divider-monitoring',
    type: 'divider',
    label: 'MONITORING & SETTINGS',
  },
  {
    key: '/monitoring',
    icon: Activity,
    label: 'System Monitoring',
    href: '/monitoring',
  },
  {
    key: '/alerts',
    icon: Bell,
    label: 'Alerts & Notifications',
    href: '/alerts',
  },
  {
    key: '/analytics',
    icon: BarChart3,
    label: 'Analytics',
    href: '/analytics',
  },
  {
    key: '/audit',
    icon: FileText,
    label: 'Audit Trail',
    href: '/audit',
  },
  {
    key: '/settings',
    icon: Settings,
    label: 'Settings',
    href: '/settings',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const handleLogout = async () => {
    await authService.logout();
    logout();
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-gradient-to-b from-slate-900 to-slate-800 text-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        initial={{ x: -288 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Logo */}
        <div className="h-20 flex items-center justify-center border-b border-slate-700/50">
          <MonayLogo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {sidebarItems.map((item) => {
            // Handle dividers
            if (item.type === 'divider') {
              return (
                <div key={item.key} className="pt-4 pb-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3">
                    {item.label}
                  </p>
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <motion.div
                key={item.key}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start h-12 text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-white/10 text-white shadow-lg'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                        item.color
                          ? `${item.color} text-white`
                          : 'bg-green-500/20 text-green-300'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-slate-700/50">
          <Card className="bg-white/5 border-slate-700/50 text-white">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-medium text-sm">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="text-xs text-slate-400">
                    {user?.email}
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-slate-300 hover:text-white hover:bg-white/10"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </Card>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="lg:ml-72">
        {/* Top Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
          <div className="flex items-center justify-between h-full px-6">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </Button>

            {/* Page Title */}
            <div className="hidden lg:block">
              <h1 className="text-xl font-semibold text-gray-800">
                {sidebarItems.find(item => item.href === pathname)?.label || 'Dashboard'}
              </h1>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
              </Button>
              
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}