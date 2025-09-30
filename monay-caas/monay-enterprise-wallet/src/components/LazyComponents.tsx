import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

// Helper function to create lazy components with loading state
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback = <LoadingSpinner />
) {
  return dynamic(importFunc, {
    loading: () => fallback,
    ssr: false
  });
}

// Lazy load heavy chart components
export const LazyLineChart = lazyLoad(
  () => import('recharts').then(mod => ({ default: mod.LineChart as any }))
);

export const LazyBarChart = lazyLoad(
  () => import('recharts').then(mod => ({ default: mod.BarChart as any }))
);

export const LazyAreaChart = lazyLoad(
  () => import('recharts').then(mod => ({ default: mod.AreaChart as any }))
);

export const LazyPieChart = lazyLoad(
  () => import('recharts').then(mod => ({ default: mod.PieChart as any }))
);

// Lazy load modal components
// TODO: Uncomment when components are implemented
// export const LazyTransactionModal = lazyLoad(
//   () => import('./TransactionModal').then(mod => ({ default: mod.default }))
// );

// export const LazyWalletModal = lazyLoad(
//   () => import('./WalletModal').then(mod => ({ default: mod.default }))
// );

// export const LazyComplianceModal = lazyLoad(
//   () => import('./ComplianceModal').then(mod => ({ default: mod.default }))
// );

// Lazy load form components
// TODO: Uncomment when components are implemented
// export const LazyPaymentForm = lazyLoad(
//   () => import('./PaymentForm').then(mod => ({ default: mod.default }))
// );

// export const LazyTokenCreationForm = lazyLoad(
//   () => import('./TokenCreationForm').then(mod => ({ default: mod.default }))
// );

// export const LazyKYCForm = lazyLoad(
//   () => import('./KYCForm').then(mod => ({ default: mod.default }))
// );

// Lazy load data-heavy components
// TODO: Uncomment when components are implemented
// export const LazyTransactionTable = lazyLoad(
//   () => import('./TransactionTable').then(mod => ({ default: mod.default }))
// );

// export const LazyWalletGrid = lazyLoad(
//   () => import('./WalletGrid').then(mod => ({ default: mod.default }))
// );

// TODO: Uncomment when component is implemented
// export const LazyComplianceReports = lazyLoad(
//   () => import('./ComplianceReports').then(mod => ({ default: mod.default }))
// );

// Lazy load third-party integrations
// TODO: Install and uncomment when needed
// export const LazyStripeElements = lazyLoad(
//   () => import('@stripe/react-stripe-js').then(mod => ({ default: mod.Elements as any }))
// );

// export const LazyWalletConnect = lazyLoad(
//   () => import('@walletconnect/ethereum-provider').then(mod => ({ default: mod.default as any }))
// );

// Lazy load invoice management (large component)
export const LazyEnhancedInvoiceManagement = lazyLoad(
  () => import('./EnhancedInvoiceManagement').then(mod => ({ default: mod.default }))
);

// Lazy load analytics dashboard
export const LazyAnalyticsDashboard = lazyLoad(
  () => import('./AnalyticsDashboard').then(mod => ({ default: mod.default }))
);

// Lazy load file upload components
// TODO: Uncomment when components are implemented
// export const LazyFileUploader = lazyLoad(
//   () => import('./FileUploader').then(mod => ({ default: mod.default }))
// );

// // Lazy load data export components
// export const LazyDataExporter = lazyLoad(
//   () => import('./DataExporter').then(mod => ({ default: mod.default }))
// );

// Prefetch helper for critical components
export const prefetchComponent = (componentName: string) => {
  switch (componentName) {
    case 'TransactionTable':
      // TODO: Uncomment when TransactionTable component is implemented
      // import('./TransactionTable');
      break;
    case 'WalletGrid':
      // TODO: Uncomment when WalletGrid component is implemented
      // import('./WalletGrid');
      break;
    case 'EnhancedInvoiceManagement':
      import('./EnhancedInvoiceManagement');
      break;
    case 'PaymentReconciliation':
      import('./PaymentReconciliation');
      break;
    case 'FraudDetectionSettings':
      import('./FraudDetectionSettings');
      break;
    default:
      break;
  }
};

// Bundle splitting for vendors
export const LazyRechartsBundle = lazyLoad(
  () => import('recharts').then(mod => ({
    default: () => {
      // Re-export all recharts components
      return {
        LineChart: mod.LineChart,
        BarChart: mod.BarChart,
        AreaChart: mod.AreaChart,
        PieChart: mod.PieChart,
        ResponsiveContainer: mod.ResponsiveContainer,
        XAxis: mod.XAxis,
        YAxis: mod.YAxis,
        CartesianGrid: mod.CartesianGrid,
        Tooltip: mod.Tooltip,
        Legend: mod.Legend,
        Line: mod.Line,
        Bar: mod.Bar,
        Area: mod.Area,
        Pie: mod.Pie,
        Cell: mod.Cell
      } as any;
    }
  }))
);