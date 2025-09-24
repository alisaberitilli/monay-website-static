import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api, clearCache } from '@/lib/api';

interface BillingMetrics {
  current_month: {
    base_fee_cents: number;
    usage_fees_cents: number;
    computation_fees_cents: number;
    overage_fees_cents: number;
    discount_cents: number;
    total_cents: number;
    transaction_count: number;
    wallet_count: number;
    storage_gb: number;
    api_calls: number;
    payment_method: string;
  };
  previous_month: {
    total_cents: number;
    transaction_count: number;
  };
  billing_tier: {
    name: string;
    monthly_base_fee_cents: number;
    included_transactions: number;
    included_wallets: number;
    overage_transaction_price_cents: number;
    overage_wallet_price_cents: number;
  };
  usage_trend: Array<{
    date: string;
    transactions: number;
    amount_cents: number;
  }>;
  savings?: {
    amount_cents: number;
    percentage: number;
    message: string;
  };
}

interface PaymentHistory {
  id: string;
  amount_cents: number;
  payment_method: string;
  status: string;
  created_at: string;
  transaction_id?: string;
}

interface BillingStore {
  // State
  metrics: BillingMetrics | null;
  paymentHistory: PaymentHistory[];
  loading: boolean;
  error: string | null;
  processing: boolean;
  selectedPaymentMethod: 'USDXM' | 'USDC' | 'USDT';

  // Actions
  setMetrics: (metrics: BillingMetrics | null) => void;
  setPaymentHistory: (history: PaymentHistory[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setProcessing: (processing: boolean) => void;
  setSelectedPaymentMethod: (method: 'USDXM' | 'USDC' | 'USDT') => void;

  // Async Actions
  loadBillingMetrics: () => Promise<void>;
  loadPaymentHistory: () => Promise<void>;
  processPayment: (amount?: number) => Promise<boolean>;
  downloadInvoice: (month: string) => Promise<void>;
  calculateUSDXMDiscount: (amount: number) => number;
  refreshBilling: () => Promise<void>;
}

// Payment method types
export type PaymentMethod = 'USDXM' | 'USDC' | 'USDT';

export const useBillingStore = create<BillingStore>()(
  persist(
    (set, get) => ({
      // Initial State
      metrics: null,
      paymentHistory: [],
      loading: false,
      error: null,
      processing: false,
      selectedPaymentMethod: 'USDXM',

      // Basic Actions
      setMetrics: (metrics) => set({ metrics, error: null }),
      setPaymentHistory: (history) => set({ paymentHistory: history }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setProcessing: (processing) => set({ processing }),
      setSelectedPaymentMethod: (method) => set({ selectedPaymentMethod: method }),

      // Load Billing Metrics
      loadBillingMetrics: async () => {
        set({ loading: true, error: null });

        try {
          const data = await api.get<BillingMetrics>('/api/billing/current', {
            cache: true,
            cacheTTL: 60000 // Cache for 1 minute
          });
          set({ metrics: data, error: null });
        } catch (err: any) {
          console.error('Failed to load billing metrics:', err);
          set({ error: err.message || 'Failed to load billing information' });
        } finally {
          set({ loading: false });
        }
      },

      // Load Payment History
      loadPaymentHistory: async () => {
        try {
          const data = await api.get('/api/billing/history', {
            cache: true,
            cacheTTL: 120000 // Cache for 2 minutes
          });
          set({ paymentHistory: data.history || [] });
        } catch (err) {
          console.error('Failed to load payment history:', err);
        }
      },

      // Process Payment
      processPayment: async (customAmount?: number) => {
        const { metrics, selectedPaymentMethod, processing } = get();
        if (processing) return false;

        const amount = customAmount || metrics?.current_month.total_cents || 0;
        if (amount <= 0) {
          set({ error: 'Invalid payment amount' });
          return false;
        }

        set({ processing: true, error: null });

        try {
          const data = await api.post('/api/billing/payment', {
            amount_cents: amount,
            payment_method: selectedPaymentMethod,
          });

          // Clear billing cache after successful payment
          clearCache('/api/billing');

          // Reload billing metrics after successful payment
          await get().loadBillingMetrics();
          await get().loadPaymentHistory();

          return true;
        } catch (err: any) {
          console.error('Payment failed:', err);
          set({ error: err.message || 'Payment processing failed' });
          return false;
        } finally {
          set({ processing: false });
        }
      },

      // Download Invoice
      downloadInvoice: async (month: string) => {
        try {
          await api.download(`/api/billing/invoice/${month}`, `invoice-${month}.pdf`);
        } catch (err: any) {
          console.error('Failed to download invoice:', err);
          set({ error: 'Failed to download invoice' });
        }
      },

      // Calculate USDXM Discount
      calculateUSDXMDiscount: (amount: number) => {
        return Math.floor(amount * 0.1); // 10% discount
      },

      // Refresh All Billing Data
      refreshBilling: async () => {
        const { loading } = get();
        if (loading) return;

        await Promise.all([
          get().loadBillingMetrics(),
          get().loadPaymentHistory()
        ]);
      }
    }),
    {
      name: 'billing-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedPaymentMethod: state.selectedPaymentMethod,
        paymentHistory: state.paymentHistory.slice(0, 10) // Keep last 10 for cache
      }),
    }
  )
);

// Helper hooks for common selectors
export const useBillingMetrics = () => useBillingStore((state) => state.metrics);
export const usePaymentHistory = () => useBillingStore((state) => state.paymentHistory);
export const useBillingLoading = () => useBillingStore((state) => state.loading);
export const useBillingError = () => useBillingStore((state) => state.error);
export const usePaymentProcessing = () => useBillingStore((state) => state.processing);
export const useSelectedPaymentMethod = () => useBillingStore((state) => state.selectedPaymentMethod);

// Computed values hook
export const useBillingCalculations = () => {
  const metrics = useBillingMetrics();
  const selectedMethod = useSelectedPaymentMethod();
  const calculateDiscount = useBillingStore((state) => state.calculateUSDXMDiscount);

  const currentTotal = metrics?.current_month.total_cents || 0;
  const discount = selectedMethod === 'USDXM' ? calculateDiscount(currentTotal) : 0;
  const finalAmount = currentTotal - discount;

  return {
    currentTotal,
    discount,
    finalAmount,
    savingsPercentage: selectedMethod === 'USDXM' ? 10 : 0
  };
};