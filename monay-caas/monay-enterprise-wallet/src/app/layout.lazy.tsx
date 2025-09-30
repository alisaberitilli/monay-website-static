import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy components
export const LazyDashboard = dynamic(
  () => import('./(dashboard)/dashboard/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <DashboardSkeleton />,
    ssr: false
  }
);

export const LazyTransactions = dynamic(
  () => import('./(dashboard)/transactions/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <TransactionsSkeleton />,
    ssr: false
  }
);

export const LazyWallets = dynamic(
  () => import('./(dashboard)/wallets/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <WalletsSkeleton />,
    ssr: false
  }
);

export const LazyCompliance = dynamic(
  () => import('./(dashboard)/compliance/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <ComplianceSkeleton />,
    ssr: false
  }
);

export const LazyPaymentSettings = dynamic(
  () => import('./(dashboard)/payment-settings/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <SettingsSkeleton />,
    ssr: false
  }
);

export const LazyReports = dynamic(
  () => import('./(dashboard)/reports/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <ReportsSkeleton />,
    ssr: false
  }
);

// Skeleton components for loading states
function DashboardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
        ))}
      </div>
      <div className="bg-gray-200 rounded-lg h-96"></div>
    </div>
  );
}

function TransactionsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-12 mb-4"></div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg h-16 mb-2"></div>
      ))}
    </div>
  );
}

function WalletsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
        ))}
      </div>
    </div>
  );
}

function ComplianceSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
      <div className="bg-gray-200 rounded-lg h-96"></div>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-200 rounded-lg h-24"></div>
        ))}
      </div>
    </div>
  );
}

function ReportsSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-200 rounded-lg h-12 mb-4"></div>
      <div className="bg-gray-200 rounded-lg h-96"></div>
    </div>
  );
}