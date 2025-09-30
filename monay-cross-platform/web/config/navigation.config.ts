/**
 * Navigation Configuration for Monay Consumer Wallet
 * The First U.S.-Centric Super App
 */

import {
  Wallet,
  Send,
  ArrowDownCircle,
  ArrowUpCircle,
  CreditCard,
  History,
  User,
  Settings,
  Home,
  DollarSign,
  Bitcoin,
  ArrowLeftRight,
  QrCode,
  Calendar,
  FileText,
  Building,
  Landmark,
  Receipt,
  Coins,
  TrendingUp,
  Shield,
  Plane,
  Car,
  Train,
  ShoppingCart,
  Heart,
  GraduationCap,
  Gamepad2,
  Building2,
  PiggyBank,
  Smartphone,
  Wifi,
  Bell,
  Lock,
  Globe,
  HelpCircle,
  UserPlus,
  Users,
  Briefcase,
  Zap,
  Gift,
  Target,
  Clock,
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
  requiredAuth?: boolean;
  enabled?: boolean;
  isNew?: boolean;
  isPremium?: boolean;
}

export interface NavigationSection {
  id: string;
  title: string;
  items: NavigationItem[];
}

export const navigationConfig: NavigationSection[] = [
  {
    id: 'main',
    title: 'MAIN',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: Home,
        description: 'Your financial overview',
        requiredAuth: true
      },
      {
        id: 'wallet',
        label: 'Wallet',
        path: '/wallet',
        icon: Wallet,
        description: 'Multi-currency balances',
        requiredAuth: true,
        children: [
          {
            id: 'balances',
            label: 'Balances',
            path: '/wallet/balances',
            icon: DollarSign
          },
          {
            id: 'fiat',
            label: 'Fiat Currency',
            path: '/wallet/fiat',
            icon: DollarSign
          },
          {
            id: 'crypto',
            label: 'Cryptocurrency',
            path: '/wallet/crypto',
            icon: Bitcoin
          },
          {
            id: 'stablecoins',
            label: 'Stablecoins',
            path: '/wallet/stablecoins',
            icon: Coins
          }
        ]
      },
      {
        id: 'transactions',
        label: 'Transactions',
        path: '/transactions',
        icon: History,
        description: 'Transaction history',
        requiredAuth: true
      }
    ]
  },
  {
    id: 'payments',
    title: 'PAYMENTS',
    items: [
      {
        id: 'send',
        label: 'Send Money',
        path: '/send',
        icon: Send,
        description: 'Send to anyone',
        requiredAuth: true,
        children: [
          {
            id: 'send-p2p',
            label: 'Person to Person',
            path: '/send/p2p',
            icon: Users
          },
          {
            id: 'send-international',
            label: 'International',
            path: '/send/international',
            icon: Globe
          },
          {
            id: 'send-qr',
            label: 'QR Payment',
            path: '/send/qr',
            icon: QrCode
          },
          {
            id: 'send-business',
            label: 'Business Payment',
            path: '/send/business',
            icon: Briefcase
          }
        ]
      },
      {
        id: 'request',
        label: 'Request Money',
        path: '/payment-requests',
        icon: FileText,
        description: 'Request & invoices',
        requiredAuth: true,
        children: [
          {
            id: 'request-create',
            label: 'Create Request',
            path: '/payment-requests/create',
            icon: UserPlus
          },
          {
            id: 'request-pending',
            label: 'Pending Requests',
            path: '/payment-requests/pending',
            icon: Clock
          },
          {
            id: 'invoices',
            label: 'Invoices',
            path: '/invoices',
            icon: FileText
          }
        ]
      },
      {
        id: 'bills',
        label: 'Bill Pay',
        path: '/bills',
        icon: Receipt,
        description: 'Pay your bills',
        requiredAuth: true,
        children: [
          {
            id: 'bills-utilities',
            label: 'Utilities',
            path: '/bills/utilities',
            icon: Zap
          },
          {
            id: 'bills-rent',
            label: 'Rent/Mortgage',
            path: '/bills/rent',
            icon: Home
          },
          {
            id: 'bills-subscriptions',
            label: 'Subscriptions',
            path: '/bills/subscriptions',
            icon: Calendar
          }
        ]
      },
      {
        id: 'scheduled',
        label: 'Scheduled Payments',
        path: '/payments/scheduled',
        icon: Calendar,
        description: 'Recurring & future payments',
        requiredAuth: true
      }
    ]
  },
  {
    id: 'cards',
    title: 'CARDS',
    items: [
      {
        id: 'cards',
        label: 'My Cards',
        path: '/cards',
        icon: CreditCard,
        description: 'Manage your cards',
        requiredAuth: true,
        children: [
          {
            id: 'virtual-cards',
            label: 'Virtual Cards',
            path: '/cards/virtual',
            icon: Smartphone
          },
          {
            id: 'physical-cards',
            label: 'Physical Cards',
            path: '/cards/physical',
            icon: CreditCard
          },
          {
            id: 'card-controls',
            label: 'Card Controls',
            path: '/cards/controls',
            icon: Settings
          },
          {
            id: 'card-limits',
            label: 'Spending Limits',
            path: '/cards/limits',
            icon: Target
          },
          {
            id: 'disputes',
            label: 'Disputes',
            path: '/cards/disputes',
            icon: Shield
          }
        ]
      }
    ]
  },
  {
    id: 'banking',
    title: 'BANKING',
    items: [
      {
        id: 'add-money',
        label: 'Add Money',
        path: '/deposits',
        icon: ArrowDownCircle,
        description: 'Deposit funds',
        requiredAuth: true,
        children: [
          {
            id: 'bank-transfer',
            label: 'Bank Transfer',
            path: '/deposits/bank',
            icon: Building
          },
          {
            id: 'card-deposit',
            label: 'Card Deposit',
            path: '/deposits/card',
            icon: CreditCard
          },
          {
            id: 'direct-deposit',
            label: 'Direct Deposit',
            path: '/deposits/direct',
            icon: Landmark
          }
        ]
      },
      {
        id: 'withdraw',
        label: 'Withdraw',
        path: '/withdraw',
        icon: ArrowUpCircle,
        description: 'Cash out funds',
        requiredAuth: true,
        children: [
          {
            id: 'withdraw-bank',
            label: 'To Bank Account',
            path: '/withdraw/bank',
            icon: Building
          },
          {
            id: 'withdraw-atm',
            label: 'ATM Withdrawal',
            path: '/withdraw/atm',
            icon: Landmark
          }
        ]
      },
      {
        id: 'accounts',
        label: 'Bank Accounts',
        path: '/accounts',
        icon: Building,
        description: 'Linked accounts',
        requiredAuth: true
      },
      {
        id: 'statements',
        label: 'Statements',
        path: '/statements',
        icon: FileText,
        description: 'Account statements',
        requiredAuth: true
      }
    ]
  },
  {
    id: 'crypto',
    title: 'CRYPTO',
    items: [
      {
        id: 'buy-sell',
        label: 'Buy/Sell Crypto',
        path: '/crypto/trade',
        icon: Bitcoin,
        description: 'Trade cryptocurrency',
        requiredAuth: true,
        children: [
          {
            id: 'buy-crypto',
            label: 'Buy',
            path: '/crypto/buy',
            icon: ArrowDownCircle
          },
          {
            id: 'sell-crypto',
            label: 'Sell',
            path: '/crypto/sell',
            icon: ArrowUpCircle
          }
        ]
      },
      {
        id: 'swap',
        label: 'Swap',
        path: '/crypto/swap',
        icon: ArrowLeftRight,
        description: 'Exchange tokens',
        requiredAuth: true
      },
      {
        id: 'defi',
        label: 'DeFi',
        path: '/crypto/defi',
        icon: Coins,
        description: 'Decentralized finance',
        requiredAuth: true,
        isPremium: true,
        children: [
          {
            id: 'lending',
            label: 'Lending',
            path: '/crypto/defi/lending',
            icon: TrendingUp
          },
          {
            id: 'borrowing',
            label: 'Borrowing',
            path: '/crypto/defi/borrowing',
            icon: PiggyBank
          }
        ]
      },
      {
        id: 'staking',
        label: 'Staking',
        path: '/crypto/staking',
        icon: TrendingUp,
        description: 'Earn rewards',
        requiredAuth: true,
        isPremium: true
      },
      {
        id: 'nft',
        label: 'NFT Wallet',
        path: '/crypto/nft',
        icon: Gift,
        description: 'NFT collection',
        requiredAuth: true,
        isNew: true
      }
    ]
  },
  {
    id: 'services',
    title: 'SUPER APP SERVICES',
    items: [
      {
        id: 'travel',
        label: 'Travel',
        path: '/services/travel',
        icon: Plane,
        description: 'Book travel',
        children: [
          {
            id: 'flights',
            label: 'Flights',
            path: '/services/travel/flights',
            icon: Plane
          },
          {
            id: 'hotels',
            label: 'Hotels',
            path: '/services/travel/hotels',
            icon: Building2
          },
          {
            id: 'car-rental',
            label: 'Car Rental',
            path: '/services/travel/cars',
            icon: Car
          }
        ]
      },
      {
        id: 'transport',
        label: 'Transportation',
        path: '/services/transport',
        icon: Car,
        description: 'Get around',
        children: [
          {
            id: 'rideshare',
            label: 'Rideshare',
            path: '/services/transport/ride',
            icon: Car
          },
          {
            id: 'transit',
            label: 'Public Transit',
            path: '/services/transport/transit',
            icon: Train
          },
          {
            id: 'tolls',
            label: 'Tolls & Parking',
            path: '/services/transport/tolls',
            icon: Receipt
          },
          {
            id: 'ev-charging',
            label: 'EV Charging',
            path: '/services/transport/ev',
            icon: Zap,
            isNew: true
          }
        ]
      },
      {
        id: 'shopping',
        label: 'Shopping',
        path: '/services/shopping',
        icon: ShoppingCart,
        description: 'Shop & save',
        children: [
          {
            id: 'deals',
            label: 'Deals',
            path: '/services/shopping/deals',
            icon: Gift
          },
          {
            id: 'cashback',
            label: 'Cashback',
            path: '/services/shopping/cashback',
            icon: DollarSign
          },
          {
            id: 'merchants',
            label: 'Merchants',
            path: '/services/shopping/merchants',
            icon: Building2
          }
        ]
      },
      {
        id: 'healthcare',
        label: 'Healthcare',
        path: '/services/healthcare',
        icon: Heart,
        description: 'Health services',
        children: [
          {
            id: 'medical-bills',
            label: 'Medical Bills',
            path: '/services/healthcare/bills',
            icon: Receipt
          },
          {
            id: 'pharmacy',
            label: 'Pharmacy',
            path: '/services/healthcare/pharmacy',
            icon: Heart
          },
          {
            id: 'hsa-fsa',
            label: 'HSA/FSA',
            path: '/services/healthcare/hsa-fsa',
            icon: PiggyBank
          }
        ]
      },
      {
        id: 'education',
        label: 'Education',
        path: '/services/education',
        icon: GraduationCap,
        description: 'Education payments',
        children: [
          {
            id: 'tuition',
            label: 'Tuition',
            path: '/services/education/tuition',
            icon: GraduationCap
          },
          {
            id: 'student-loans',
            label: 'Student Loans',
            path: '/services/education/loans',
            icon: FileText
          },
          {
            id: 'scholarships',
            label: 'Scholarships',
            path: '/services/education/scholarships',
            icon: Gift
          }
        ]
      },
      {
        id: 'entertainment',
        label: 'Entertainment',
        path: '/services/entertainment',
        icon: Gamepad2,
        description: 'Fun & entertainment',
        children: [
          {
            id: 'events',
            label: 'Event Tickets',
            path: '/services/entertainment/events',
            icon: Calendar
          },
          {
            id: 'streaming',
            label: 'Streaming',
            path: '/services/entertainment/streaming',
            icon: Wifi
          },
          {
            id: 'gaming',
            label: 'Gaming',
            path: '/services/entertainment/gaming',
            icon: Gamepad2
          }
        ]
      },
      {
        id: 'government',
        label: 'Government',
        path: '/services/government',
        icon: Landmark,
        description: 'Government services',
        children: [
          {
            id: 'benefits',
            label: 'Benefits (SNAP/TANF)',
            path: '/services/government/benefits',
            icon: Shield
          },
          {
            id: 'tax-payments',
            label: 'Tax Payments',
            path: '/services/government/tax',
            icon: Receipt
          },
          {
            id: 'unemployment',
            label: 'Unemployment',
            path: '/services/government/unemployment',
            icon: Briefcase
          },
          {
            id: 'social-security',
            label: 'Social Security',
            path: '/services/government/social-security',
            icon: Shield
          }
        ]
      }
    ]
  },
  {
    id: 'profile',
    title: 'PROFILE & SETTINGS',
    items: [
      {
        id: 'profile',
        label: 'My Profile',
        path: '/profile',
        icon: User,
        description: 'Personal information',
        requiredAuth: true,
        children: [
          {
            id: 'personal-info',
            label: 'Personal Info',
            path: '/profile/personal',
            icon: User
          },
          {
            id: 'verification',
            label: 'Verification',
            path: '/profile/verification',
            icon: Shield
          },
          {
            id: 'limits',
            label: 'Account Limits',
            path: '/profile/limits',
            icon: Target
          }
        ]
      },
      {
        id: 'security',
        label: 'Security',
        path: '/settings/security',
        icon: Lock,
        description: 'Security settings',
        requiredAuth: true,
        children: [
          {
            id: 'mpin',
            label: 'MPIN',
            path: '/settings/security/mpin',
            icon: Lock
          },
          {
            id: 'biometrics',
            label: 'Biometrics',
            path: '/settings/security/biometrics',
            icon: Shield
          },
          {
            id: 'two-factor',
            label: 'Two-Factor Auth',
            path: '/settings/security/2fa',
            icon: Lock
          }
        ]
      },
      {
        id: 'notifications',
        label: 'Notifications',
        path: '/notifications',
        icon: Bell,
        description: 'Alert preferences',
        requiredAuth: true
      },
      {
        id: 'preferences',
        label: 'Preferences',
        path: '/settings',
        icon: Settings,
        description: 'App settings',
        requiredAuth: true,
        children: [
          {
            id: 'language',
            label: 'Language',
            path: '/settings/language',
            icon: Globe
          },
          {
            id: 'currency',
            label: 'Currency',
            path: '/settings/currency',
            icon: DollarSign
          },
          {
            id: 'theme',
            label: 'Theme',
            path: '/settings/theme',
            icon: Sun
          }
        ]
      },
      {
        id: 'help',
        label: 'Help & Support',
        path: '/help',
        icon: HelpCircle,
        description: 'Get help'
      }
    ]
  }
];

// Helper functions (same as Admin)
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