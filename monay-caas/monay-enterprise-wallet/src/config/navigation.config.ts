/**
 * Navigation Configuration for Monay Enterprise Wallet
 * Enterprise treasury and payment management platform
 */

import {
  LayoutDashboard,
  Wallet,
  Coins,
  ArrowLeftRight,
  Users,
  Settings,
  FileText,
  Shield,
  Building,
  DollarSign,
  TrendingUp,
  PieChart,
  GitBranch,
  Key,
  Webhook,
  Code,
  CheckCircle,
  UserCheck,
  Calculator,
  Globe,
  Briefcase,
  Receipt,
  CreditCard,
  Target,
  Clock,
  AlertCircle,
  BarChart3,
  Package,
  Layers,
  Database,
  Activity,
  BookOpen,
  HelpCircle,
  Bell,
  Lock,
  Link,
  Send,
  Plus,
  Minus,
  RefreshCw,
  History,
  Gift,
  UserPlus,
  Sun,
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
  isPremium?: boolean;
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
        id: 'dashboard',
        label: 'Treasury Dashboard',
        path: '/treasury',
        icon: LayoutDashboard,
        description: 'Enterprise treasury overview'
      },
      {
        id: 'positions',
        label: 'Cash Positions',
        path: '/treasury/positions',
        icon: PieChart,
        description: 'Real-time positions'
      },
      {
        id: 'liquidity',
        label: 'Liquidity Management',
        path: '/treasury/liquidity',
        icon: TrendingUp,
        description: 'Liquidity pools & reserves'
      }
    ]
  },
  {
    id: 'token-management',
    title: 'TOKEN MANAGEMENT',
    items: [
      {
        id: 'tokens',
        label: 'Token Operations',
        path: '/tokens',
        icon: Coins,
        description: 'Manage your tokens',
        children: [
          {
            id: 'create-token',
            label: 'Create Token',
            path: '/tokens/create',
            icon: Plus,
            badge: 'NEW',
            badgeColor: 'bg-green-500'
          },
          {
            id: 'manage-tokens',
            label: 'Manage Tokens',
            path: '/tokens/manage',
            icon: Settings
          },
          {
            id: 'mint',
            label: 'Mint Tokens',
            path: '/tokens/mint',
            icon: Plus,
            requiredRole: ['TREASURY_ADMIN']
          },
          {
            id: 'burn',
            label: 'Burn Tokens',
            path: '/tokens/burn',
            icon: Minus,
            requiredRole: ['TREASURY_ADMIN']
          },
          {
            id: 'supply',
            label: 'Supply Management',
            path: '/tokens/supply',
            icon: BarChart3
          }
        ]
      },
      {
        id: 'distribution',
        label: 'Distribution',
        path: '/tokens/distribution',
        icon: GitBranch,
        description: 'Token distribution controls',
        children: [
          {
            id: 'rules',
            label: 'Distribution Rules',
            path: '/tokens/distribution/rules',
            icon: Shield
          },
          {
            id: 'schedules',
            label: 'Vesting Schedules',
            path: '/tokens/distribution/vesting',
            icon: Clock
          },
          {
            id: 'airdrops',
            label: 'Airdrops',
            path: '/tokens/distribution/airdrops',
            icon: Gift
          }
        ]
      },
      {
        id: 'cross-chain',
        label: 'Cross-Chain Bridge',
        path: '/tokens/bridge',
        icon: Link,
        description: 'Bridge between chains',
        children: [
          {
            id: 'bridge-transfer',
            label: 'Bridge Transfer',
            path: '/tokens/bridge/transfer',
            icon: ArrowLeftRight
          },
          {
            id: 'bridge-history',
            label: 'Bridge History',
            path: '/tokens/bridge/history',
            icon: Clock
          }
        ]
      }
    ]
  },
  {
    id: 'payments',
    title: 'PAYMENTS & TRANSFERS',
    items: [
      {
        id: 'invoice-first',
        label: 'Invoice-First Payments',
        path: '/invoices',
        icon: FileText,
        description: 'Invoice-based payment system',
        badge: 'PRIMARY',
        badgeColor: 'bg-green-500',
        children: [
          {
            id: 'create-invoice',
            label: 'Create Invoice',
            path: '/invoices/create',
            icon: Plus
          },
          {
            id: 'invoice-wallets',
            label: 'Invoice Wallets',
            path: '/invoices/wallets',
            icon: Wallet,
            description: 'Ephemeral wallet generation'
          },
          {
            id: 'pending-invoices',
            label: 'Pending Invoices',
            path: '/invoices/pending',
            icon: Clock
          },
          {
            id: 'invoice-history',
            label: 'Invoice History',
            path: '/invoices/history',
            icon: History
          },
          {
            id: 'invoice-templates',
            label: 'Invoice Templates',
            path: '/invoices/templates',
            icon: FileText
          }
        ]
      },
      {
        id: 'payments',
        label: 'Direct Payments',
        path: '/payments',
        icon: Send,
        description: 'Traditional payments',
        children: [
          {
            id: 'single-payment',
            label: 'Single Payment',
            path: '/payments/single',
            icon: Send
          },
          {
            id: 'bulk-payments',
            label: 'Bulk Payments',
            path: '/payments/bulk',
            icon: Layers,
            badge: 'BATCH',
            badgeColor: 'bg-blue-500'
          },
          {
            id: 'scheduled',
            label: 'Scheduled Payments',
            path: '/payments/scheduled',
            icon: Clock
          },
          {
            id: 'recurring',
            label: 'Recurring Payments',
            path: '/payments/recurring',
            icon: RefreshCw
          }
        ]
      },
      {
        id: 'payroll',
        label: 'Payroll',
        path: '/payments/payroll',
        icon: Users,
        description: 'Employee payments',
        children: [
          {
            id: 'payroll-runs',
            label: 'Payroll Runs',
            path: '/payments/payroll/runs',
            icon: Calculator
          },
          {
            id: 'payroll-employees',
            label: 'Employee List',
            path: '/payments/payroll/employees',
            icon: Users
          },
          {
            id: 'payroll-reports',
            label: 'Payroll Reports',
            path: '/payments/payroll/reports',
            icon: FileText
          }
        ]
      },
      {
        id: 'vendors',
        label: 'Vendor Payments',
        path: '/payments/vendors',
        icon: Building,
        description: 'Supplier payments',
        children: [
          {
            id: 'vendor-list',
            label: 'Vendor List',
            path: '/payments/vendors/list',
            icon: Building
          },
          {
            id: 'vendor-invoices',
            label: 'Invoices',
            path: '/payments/vendors/invoices',
            icon: FileText
          },
          {
            id: 'vendor-approvals',
            label: 'Pending Approvals',
            path: '/payments/vendors/approvals',
            icon: CheckCircle
          }
        ]
      },
      {
        id: 'cross-border',
        label: 'Cross-Border',
        path: '/payments/international',
        icon: Globe,
        description: 'International transfers',
        children: [
          {
            id: 'swift',
            label: 'SWIFT Transfers',
            path: '/payments/international/swift',
            icon: Globe
          },
          {
            id: 'fx-rates',
            label: 'FX Rates',
            path: '/payments/international/fx',
            icon: TrendingUp
          }
        ]
      }
    ]
  },
  {
    id: 'wallet-operations',
    title: 'WALLET OPERATIONS',
    items: [
      {
        id: 'corporate-wallets',
        label: 'Corporate Wallets',
        path: '/wallets/corporate',
        icon: Wallet,
        description: 'Main corporate wallets',
        children: [
          {
            id: 'wallet-overview',
            label: 'Overview',
            path: '/wallets/corporate/overview',
            icon: Wallet
          },
          {
            id: 'wallet-create',
            label: 'Create Wallet',
            path: '/wallets/corporate/create',
            icon: Plus
          },
          {
            id: 'wallet-settings',
            label: 'Wallet Settings',
            path: '/wallets/corporate/settings',
            icon: Settings
          }
        ]
      },
      {
        id: 'department-wallets',
        label: 'Department Wallets',
        path: '/wallets/departments',
        icon: Briefcase,
        description: 'Sub-wallets by department',
        children: [
          {
            id: 'dept-list',
            label: 'Department List',
            path: '/wallets/departments/list',
            icon: Briefcase
          },
          {
            id: 'dept-allocations',
            label: 'Allocations',
            path: '/wallets/departments/allocations',
            icon: PieChart
          }
        ]
      },
      {
        id: 'multi-sig',
        label: 'Multi-Signature',
        path: '/wallets/multisig',
        icon: Lock,
        description: 'Multi-sig controls',
        children: [
          {
            id: 'signers',
            label: 'Signers',
            path: '/wallets/multisig/signers',
            icon: Users
          },
          {
            id: 'pending-signatures',
            label: 'Pending Signatures',
            path: '/wallets/multisig/pending',
            icon: Clock
          },
          {
            id: 'policies',
            label: 'Signing Policies',
            path: '/wallets/multisig/policies',
            icon: Shield
          }
        ]
      },
      {
        id: 'spending-limits',
        label: 'Spending Controls',
        path: '/wallets/limits',
        icon: Target,
        description: 'Limits & approvals',
        children: [
          {
            id: 'limit-rules',
            label: 'Limit Rules',
            path: '/wallets/limits/rules',
            icon: Shield
          },
          {
            id: 'approval-workflows',
            label: 'Approval Workflows',
            path: '/wallets/limits/approvals',
            icon: GitBranch
          }
        ]
      }
    ]
  },
  {
    id: 'compliance',
    title: 'COMPLIANCE & REPORTING',
    items: [
      {
        id: 'kyb',
        label: 'KYB Verification',
        path: '/compliance/kyb',
        icon: UserCheck,
        description: 'Business verification',
        children: [
          {
            id: 'kyb-status',
            label: 'Verification Status',
            path: '/compliance/kyb/status',
            icon: CheckCircle
          },
          {
            id: 'kyb-documents',
            label: 'Documents',
            path: '/compliance/kyb/documents',
            icon: FileText
          }
        ]
      },
      {
        id: 'transaction-monitoring',
        label: 'Transaction Monitoring',
        path: '/compliance/monitoring',
        icon: Activity,
        description: 'Real-time monitoring',
        children: [
          {
            id: 'alerts',
            label: 'Compliance Alerts',
            path: '/compliance/monitoring/alerts',
            icon: AlertCircle
          },
          {
            id: 'review-queue',
            label: 'Review Queue',
            path: '/compliance/monitoring/review',
            icon: Clock
          }
        ]
      },
      {
        id: 'reports',
        label: 'Reports',
        path: '/compliance/reports',
        icon: FileText,
        description: 'Compliance reports',
        children: [
          {
            id: 'transaction-reports',
            label: 'Transaction Reports',
            path: '/compliance/reports/transactions',
            icon: BarChart3
          },
          {
            id: 'regulatory-reports',
            label: 'Regulatory Reports',
            path: '/compliance/reports/regulatory',
            icon: Shield
          },
          {
            id: 'tax-documents',
            label: 'Tax Documents',
            path: '/compliance/reports/tax',
            icon: Receipt
          }
        ]
      },
      {
        id: 'audit',
        label: 'Audit Trail',
        path: '/compliance/audit',
        icon: BookOpen,
        description: 'Complete audit logs'
      }
    ]
  },
  {
    id: 'integrations',
    title: 'INTEGRATIONS & API',
    items: [
      {
        id: 'api-keys',
        label: 'API Keys',
        path: '/integrations/api-keys',
        icon: Key,
        description: 'Manage API access',
        children: [
          {
            id: 'create-key',
            label: 'Create Key',
            path: '/integrations/api-keys/create',
            icon: Plus
          },
          {
            id: 'key-management',
            label: 'Key Management',
            path: '/integrations/api-keys/manage',
            icon: Key
          }
        ]
      },
      {
        id: 'webhooks',
        label: 'Webhooks',
        path: '/integrations/webhooks',
        icon: Webhook,
        description: 'Event notifications',
        children: [
          {
            id: 'webhook-config',
            label: 'Configuration',
            path: '/integrations/webhooks/config',
            icon: Settings
          },
          {
            id: 'webhook-logs',
            label: 'Webhook Logs',
            path: '/integrations/webhooks/logs',
            icon: FileText
          }
        ]
      },
      {
        id: 'sdk',
        label: 'SDK & Documentation',
        path: '/integrations/sdk',
        icon: Code,
        description: 'Developer resources',
        children: [
          {
            id: 'sdk-docs',
            label: 'Documentation',
            path: '/integrations/sdk/docs',
            icon: BookOpen
          },
          {
            id: 'sdk-examples',
            label: 'Code Examples',
            path: '/integrations/sdk/examples',
            icon: Code
          },
          {
            id: 'sdk-playground',
            label: 'API Playground',
            path: '/integrations/sdk/playground',
            icon: Package
          }
        ]
      },
      {
        id: 'connected-apps',
        label: 'Connected Apps',
        path: '/integrations/apps',
        icon: Layers,
        description: 'Third-party integrations'
      }
    ]
  },
  {
    id: 'analytics',
    title: 'ANALYTICS & INSIGHTS',
    items: [
      {
        id: 'treasury-analytics',
        label: 'Treasury Analytics',
        path: '/analytics/treasury',
        icon: PieChart,
        description: 'Treasury insights'
      },
      {
        id: 'payment-analytics',
        label: 'Payment Analytics',
        path: '/analytics/payments',
        icon: BarChart3,
        description: 'Payment trends'
      },
      {
        id: 'token-analytics',
        label: 'Token Analytics',
        path: '/analytics/tokens',
        icon: TrendingUp,
        description: 'Token performance'
      },
      {
        id: 'custom-reports',
        label: 'Custom Reports',
        path: '/analytics/custom',
        icon: FileText,
        description: 'Build custom reports'
      }
    ]
  },
  {
    id: 'team',
    title: 'TEAM MANAGEMENT',
    items: [
      {
        id: 'team-members',
        label: 'Team Members',
        path: '/team/users',
        icon: Users,
        description: 'Manage team access',
        children: [
          {
            id: 'invite-members',
            label: 'Invite Members',
            path: '/team/users/invite',
            icon: UserPlus
          },
          {
            id: 'member-list',
            label: 'Member List',
            path: '/team/users/list',
            icon: Users
          }
        ]
      },
      {
        id: 'roles',
        label: 'Roles & Permissions',
        path: '/team/roles',
        icon: Shield,
        description: 'Access control',
        children: [
          {
            id: 'role-management',
            label: 'Role Management',
            path: '/team/roles/manage',
            icon: Shield
          },
          {
            id: 'permissions',
            label: 'Permissions',
            path: '/team/roles/permissions',
            icon: Lock
          }
        ]
      },
      {
        id: 'workflows',
        label: 'Approval Workflows',
        path: '/team/workflows',
        icon: GitBranch,
        description: 'Approval processes',
        children: [
          {
            id: 'workflow-templates',
            label: 'Templates',
            path: '/team/workflows/templates',
            icon: FileText
          },
          {
            id: 'workflow-builder',
            label: 'Workflow Builder',
            path: '/team/workflows/builder',
            icon: GitBranch
          }
        ]
      },
      {
        id: 'activity-logs',
        label: 'Activity Logs',
        path: '/team/activity',
        icon: Activity,
        description: 'Team activity tracking'
      }
    ]
  },
  {
    id: 'settings',
    title: 'SETTINGS',
    items: [
      {
        id: 'enterprise-settings',
        label: 'Enterprise Settings',
        path: '/settings/enterprise',
        icon: Building,
        description: 'Company configuration'
      },
      {
        id: 'treasury-settings',
        label: 'Treasury Settings',
        path: '/settings/treasury',
        icon: Settings,
        description: 'Treasury configuration'
      },
      {
        id: 'notifications',
        label: 'Notifications',
        path: '/settings/notifications',
        icon: Bell,
        description: 'Alert preferences'
      },
      {
        id: 'security',
        label: 'Security',
        path: '/settings/security',
        icon: Lock,
        description: 'Security settings'
      },
      {
        id: 'help',
        label: 'Help & Support',
        path: '/help',
        icon: HelpCircle,
        description: 'Get assistance'
      }
    ]
  }
];

// Helper functions (same as other configs)
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