/**
 * Navigation Configuration for Monay Admin (Super Admin)
 * Central control panel for entire Monay ecosystem
 */

import {
  LayoutDashboard,
  Users,
  CreditCard,
  Wallet,
  Settings,
  Shield,
  Building,
  DollarSign,
  Activity,
  Layers,
  BarChart3,
  FileText,
  Bell,
  AlertCircle,
  Database,
  Globe,
  Zap,
  Link,
  Server,
  GitBranch,
  TrendingUp,
  UserCheck,
  Lock,
  CheckCircle,
  XCircle,
  Package,
  Coins,
  ArrowLeftRight,
  Receipt,
  Calculator,
  PieChart,
  BookOpen,
  HeadphonesIcon,
  MessageSquare,
  AlertTriangle,
  Clock,
  Plus,
  Minus,
  type LucideIcon
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  badgeColor?: string;
  description?: string;
  children?: NavigationItem[];
  requiredRole?: string[];
  enabled?: boolean;
}

export interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
}

export const navigationConfig: NavigationSection[] = [
  {
    id: 'overview',
    title: 'OVERVIEW',
    items: [
      {
        id: 'platform',
        label: 'Platform Overview',
        path: '/platform',
        icon: Activity,
        badge: 'SUPER ADMIN',
        badgeColor: 'bg-gradient-to-r from-blue-500 to-purple-500',
        description: 'System health and real-time metrics'
      },
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        description: 'Key metrics and analytics'
      }
    ]
  },
  {
    id: 'platform-management',
    title: 'PLATFORM MANAGEMENT',
    items: [
      {
        id: 'tenants',
        label: 'Tenant Management',
        path: '/tenants',
        icon: Building,
        description: 'Multi-tenant configuration',
        children: [
          {
            id: 'tenant-list',
            label: 'All Tenants',
            path: '/tenants',
            icon: Building
          },
          {
            id: 'tenant-onboarding',
            label: 'Onboarding',
            path: '/tenants/onboarding',
            icon: UserCheck
          },
          {
            id: 'tenant-billing',
            label: 'Billing',
            path: '/tenants/billing',
            icon: Receipt
          }
        ]
      },
      {
        id: 'system-health',
        label: 'System Health',
        path: '/platform/health',
        icon: Server,
        description: 'Service status and monitoring',
        children: [
          {
            id: 'services',
            label: 'Services',
            path: '/platform/health/services',
            icon: Server
          },
          {
            id: 'infrastructure',
            label: 'Infrastructure',
            path: '/platform/health/infrastructure',
            icon: Database
          },
          {
            id: 'performance',
            label: 'Performance',
            path: '/monitoring',
            icon: TrendingUp
          }
        ]
      },
      {
        id: 'configuration',
        label: 'Configuration',
        path: '/settings',
        icon: Settings,
        description: 'System configuration'
      }
    ]
  },
  {
    id: 'user-access',
    title: 'USER & ACCESS MANAGEMENT',
    items: [
      {
        id: 'users',
        label: 'User Management',
        path: '/users-management',
        icon: Users,
        description: 'All user accounts',
        children: [
          {
            id: 'enterprise-users',
            label: 'Enterprise Users',
            path: '/users-management/enterprise',
            icon: Building
          },
          {
            id: 'consumer-users',
            label: 'Consumer Users',
            path: '/users-management/consumer',
            icon: Users
          },
          {
            id: 'admin-users',
            label: 'Admin Users',
            path: '/users-management/admin',
            icon: Shield
          },
          {
            id: 'roles-permissions',
            label: 'Roles & Permissions',
            path: '/users-management/roles',
            icon: Lock
          }
        ]
      },
      {
        id: 'organizations',
        label: 'Organizations',
        path: '/organizations',
        icon: Building,
        description: 'Enterprise organizations'
      }
    ]
  },
  {
    id: 'payment-providers',
    title: 'PAYMENT PROVIDERS',
    items: [
      {
        id: 'tempo',
        label: 'Tempo (100K TPS)',
        path: '/tempo-management',
        icon: Zap,
        badge: 'PRIMARY',
        badgeColor: 'bg-blue-600',
        description: 'High-speed blockchain rails',
        children: [
          {
            id: 'tempo-config',
            label: 'Configuration',
            path: '/tempo-management/config',
            icon: Settings
          },
          {
            id: 'tempo-wallets',
            label: 'Wallets',
            path: '/tempo-management/wallets',
            icon: Wallet
          },
          {
            id: 'tempo-transactions',
            label: 'Transactions',
            path: '/tempo-management/transactions',
            icon: ArrowLeftRight
          }
        ]
      },
      {
        id: 'circle',
        label: 'Circle USDC',
        path: '/circle-management',
        icon: Globe,
        badge: 'FALLBACK',
        badgeColor: 'bg-purple-600',
        description: 'USDC stablecoin provider',
        children: [
          {
            id: 'circle-config',
            label: 'Configuration',
            path: '/circle-management/config',
            icon: Settings
          },
          {
            id: 'circle-wallets',
            label: 'Wallets',
            path: '/circle-management/wallets',
            icon: Wallet
          },
          {
            id: 'circle-settlements',
            label: 'Settlements',
            path: '/circle-management/settlements',
            icon: Calculator
          }
        ]
      },
      {
        id: 'stripe',
        label: 'Stripe',
        path: '/providers/stripe',
        icon: CreditCard,
        description: 'Card payments & issuing',
        children: [
          {
            id: 'stripe-payments',
            label: 'Payments',
            path: '/providers/stripe/payments',
            icon: CreditCard
          },
          {
            id: 'stripe-issuing',
            label: 'Card Issuing',
            path: '/providers/stripe/issuing',
            icon: CreditCard
          }
        ]
      },
      {
        id: 'monay-fiat',
        label: 'Monay Fiat Rails',
        path: '/providers/monay-fiat',
        icon: DollarSign,
        description: 'ACH, Wire, GPS Banking',
        children: [
          {
            id: 'ach',
            label: 'ACH Transfers',
            path: '/providers/monay-fiat/ach',
            icon: ArrowLeftRight
          },
          {
            id: 'wire',
            label: 'Wire Transfers',
            path: '/providers/monay-fiat/wire',
            icon: ArrowLeftRight
          }
        ]
      },
      {
        id: 'provider-comparison',
        label: 'Provider Comparison',
        path: '/providers',
        icon: Layers,
        description: 'Compare all providers'
      }
    ]
  },
  {
    id: 'compliance-risk',
    title: 'COMPLIANCE & RISK',
    items: [
      {
        id: 'compliance',
        label: 'Compliance Dashboard',
        path: '/compliance',
        icon: Shield,
        description: 'KYC/AML monitoring',
        children: [
          {
            id: 'kyc-aml',
            label: 'KYC/AML',
            path: '/compliance/kyc-aml',
            icon: UserCheck
          },
          {
            id: 'sanctions',
            label: 'Sanctions Screening',
            path: '/compliance/sanctions',
            icon: XCircle
          },
          {
            id: 'reporting',
            label: 'Regulatory Reporting',
            path: '/compliance/reporting',
            icon: FileText
          }
        ]
      },
      {
        id: 'business-rules',
        label: 'Business Rules Engine',
        path: '/business-rules',
        icon: GitBranch,
        description: 'BRF configuration',
        children: [
          {
            id: 'rule-sets',
            label: 'Rule Sets',
            path: '/business-rules/sets',
            icon: Package
          },
          {
            id: 'rule-testing',
            label: 'Testing',
            path: '/business-rules/testing',
            icon: CheckCircle
          }
        ]
      },
      {
        id: 'fraud-detection',
        label: 'Fraud Detection',
        path: '/compliance/fraud',
        icon: AlertTriangle,
        description: 'Real-time fraud monitoring'
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        path: '/audit',
        icon: BookOpen,
        description: 'System audit trails'
      }
    ]
  },
  {
    id: 'financial-operations',
    title: 'FINANCIAL OPERATIONS',
    items: [
      {
        id: 'transactions',
        label: 'All Transactions',
        path: '/transactions',
        icon: ArrowLeftRight,
        description: 'Transaction management'
      },
      {
        id: 'treasury',
        label: 'Treasury Management',
        path: '/financial/treasury',
        icon: Coins,
        description: 'Liquidity and reserves',
        children: [
          {
            id: 'liquidity',
            label: 'Liquidity Pool',
            path: '/financial/treasury/liquidity',
            icon: Coins
          },
          {
            id: 'reserves',
            label: 'Reserves',
            path: '/financial/treasury/reserves',
            icon: Database
          }
        ]
      },
      {
        id: 'settlements',
        label: 'Settlements',
        path: '/financial/settlements',
        icon: Calculator,
        description: 'Settlement & reconciliation',
        children: [
          {
            id: 'pending',
            label: 'Pending',
            path: '/financial/settlements/pending',
            icon: Clock
          },
          {
            id: 'completed',
            label: 'Completed',
            path: '/financial/settlements/completed',
            icon: CheckCircle
          }
        ]
      },
      {
        id: 'billing-analytics',
        label: 'Billing & Analytics',
        path: '/billing-analytics',
        icon: Receipt,
        description: 'Revenue and billing'
      },
      {
        id: 'fee-management',
        label: 'Fee Management',
        path: '/financial/fees',
        icon: Calculator,
        description: 'Fee structure configuration'
      }
    ]
  },
  {
    id: 'blockchain-operations',
    title: 'BLOCKCHAIN OPERATIONS',
    items: [
      {
        id: 'smart-contracts',
        label: 'Smart Contracts',
        path: '/blockchain/contracts',
        icon: FileText,
        description: 'Contract management',
        children: [
          {
            id: 'evm-contracts',
            label: 'EVM (Base/Polygon)',
            path: '/blockchain/contracts/evm',
            icon: FileText
          },
          {
            id: 'solana-programs',
            label: 'Solana Programs',
            path: '/blockchain/contracts/solana',
            icon: FileText
          }
        ]
      },
      {
        id: 'cross-chain-bridge',
        label: 'Cross-Chain Bridge',
        path: '/blockchain/bridge',
        icon: Link,
        description: 'Bridge operations'
      },
      {
        id: 'gas-management',
        label: 'Gas Management',
        path: '/blockchain/gas',
        icon: Zap,
        description: 'Gas fee optimization'
      },
      {
        id: 'token-management',
        label: 'Token Management',
        path: '/blockchain/tokens',
        icon: Coins,
        description: 'Token operations',
        children: [
          {
            id: 'minting',
            label: 'Minting',
            path: '/blockchain/tokens/mint',
            icon: Plus
          },
          {
            id: 'burning',
            label: 'Burning',
            path: '/blockchain/tokens/burn',
            icon: Minus
          },
          {
            id: 'supply',
            label: 'Supply Management',
            path: '/blockchain/tokens/supply',
            icon: BarChart3
          }
        ]
      },
      {
        id: 'wallet-infrastructure',
        label: 'Wallet Infrastructure',
        path: '/wallet',
        icon: Wallet,
        description: 'Wallet management'
      }
    ]
  },
  {
    id: 'analytics-reporting',
    title: 'ANALYTICS & REPORTING',
    items: [
      {
        id: 'analytics',
        label: 'Analytics Dashboard',
        path: '/analytics',
        icon: BarChart3,
        description: 'Business intelligence'
      },
      {
        id: 'transaction-analytics',
        label: 'Transaction Analytics',
        path: '/analytics/transactions',
        icon: TrendingUp,
        description: 'Transaction insights'
      },
      {
        id: 'user-analytics',
        label: 'User Analytics',
        path: '/analytics/users',
        icon: Users,
        description: 'User behavior & growth'
      },
      {
        id: 'revenue-analytics',
        label: 'Revenue Analytics',
        path: '/analytics/revenue',
        icon: DollarSign,
        description: 'Revenue tracking'
      },
      {
        id: 'performance-metrics',
        label: 'Performance Metrics',
        path: '/analytics/performance',
        icon: Activity,
        description: 'System performance'
      },
      {
        id: 'reports',
        label: 'Reports',
        path: '/analytics/reports',
        icon: FileText,
        description: 'Generate reports'
      }
    ]
  },
  {
    id: 'support-operations',
    title: 'SUPPORT & OPERATIONS',
    items: [
      {
        id: 'support-tickets',
        label: 'Support Tickets',
        path: '/support/tickets',
        icon: HeadphonesIcon,
        description: 'Customer support'
      },
      {
        id: 'alerts',
        label: 'System Alerts',
        path: '/alerts',
        icon: Bell,
        description: 'Alert management'
      },
      {
        id: 'notifications',
        label: 'Notifications',
        path: '/support/notifications',
        icon: MessageSquare,
        description: 'System notifications'
      },
      {
        id: 'incidents',
        label: 'Incidents',
        path: '/support/incidents',
        icon: AlertCircle,
        description: 'Incident management'
      }
    ]
  }
];

// Helper function to get all paths for route generation
export function getAllNavigationPaths(): string[] {
  const paths: string[] = [];

  const extractPaths = (items: NavigationItem[]) => {
    items.forEach(item => {
      paths.push(item.path);
      if (item.children) {
        extractPaths(item.children);
      }
    });
  };

  navigationConfig.forEach(section => {
    extractPaths(section.items);
  });

  return paths;
}

// Helper function to find active navigation item
export function findActiveNavItem(pathname: string): NavigationItem | null {
  let foundItem: NavigationItem | null = null;

  const searchItems = (items: NavigationItem[]) => {
    for (const item of items) {
      if (item.path === pathname) {
        foundItem = item;
        return;
      }
      if (item.children) {
        searchItems(item.children);
      }
    }
  };

  navigationConfig.forEach(section => {
    if (!foundItem) {
      searchItems(section.items);
    }
  });

  return foundItem;
}

// Helper function to get breadcrumbs
export function getBreadcrumbs(pathname: string): NavigationItem[] {
  const breadcrumbs: NavigationItem[] = [];

  const findPath = (items: NavigationItem[], parents: NavigationItem[] = []): boolean => {
    for (const item of items) {
      const currentPath = [...parents, item];

      if (item.path === pathname) {
        breadcrumbs.push(...currentPath);
        return true;
      }

      if (item.children) {
        if (findPath(item.children, currentPath)) {
          return true;
        }
      }
    }
    return false;
  };

  navigationConfig.forEach(section => {
    if (breadcrumbs.length === 0) {
      section.items.forEach(item => {
        if (breadcrumbs.length === 0) {
          findPath([item]);
        }
      });
    }
  });

  return breadcrumbs;
}