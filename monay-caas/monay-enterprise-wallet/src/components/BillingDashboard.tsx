'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, CreditCard, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import { useToast } from './ToastNotification';
import {
  useBillingStore,
  useBillingMetrics,
  useBillingLoading,
  useBillingError,
  usePaymentProcessing,
  useSelectedPaymentMethod,
  useBillingCalculations,
  useNotificationActions
} from '@/stores';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function BillingDashboard() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { success: showSuccess, error: showError } = useToast();
  const { success, error, info } = useNotificationActions();

  // Use Zustand store
  const metrics = useBillingMetrics();
  const loading = useBillingLoading();
  const billingError = useBillingError();
  const processing = usePaymentProcessing();
  const paymentMethod = useSelectedPaymentMethod();
  const { currentTotal, discount, finalAmount, savingsPercentage } = useBillingCalculations();

  const {
    loadBillingMetrics,
    processPayment,
    setSelectedPaymentMethod,
    downloadInvoice,
    refreshBilling,
    calculateUSDXMDiscount
  } = useBillingStore();

  useEffect(() => {
    loadBillingMetrics();
  }, [loadBillingMetrics]);

  // Show error notification if billing error exists
  useEffect(() => {
    if (billingError) {
      error('Billing Error', billingError);
    }
  }, [billingError, error]);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const handlePayment = async () => {
    const amount = metrics?.current_month.total_cents || 0;

    if (amount <= 0) {
      showError('Payment Error', 'Invalid payment amount');
      return;
    }

    const result = await processPayment(amount);

    if (result) {
      success('Payment Successful', `Your payment of ${formatCurrency(finalAmount)} has been processed`);
      setShowPaymentModal(false);
    } else {
      showError('Payment Failed', billingError || 'Please try again');
    }
  };

  const handleDownloadInvoice = async (month: string) => {
    info('Downloading', 'Preparing your invoice...');
    await downloadInvoice(month);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Failed to load billing information</p>
      </div>
    );
  }

  const usageChartData = {
    labels: metrics.usage_trend.map(d => new Date(d.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Daily Transactions',
        data: metrics.usage_trend.map(d => d.transactions),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
      },
    ],
  };

  // These values now come from useBillingCalculations hook
  // const currentTotal, discount, finalAmount, savingsPercentage are already available

  return (
    <div className="space-y-6">
      {/* Billing Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Current Month</h3>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentTotal)}</p>
          {metrics.current_month.payment_method === 'USDXM' && (
            <div className="mt-2">
              <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                USDXM Discount: -{formatCurrency(metrics.current_month.discount_cents)}
              </span>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Transactions</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.current_month.transaction_count.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            of {metrics.billing_tier.included_transactions.toLocaleString()} included
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Active Wallets</h3>
            <CreditCard className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {metrics.current_month.wallet_count.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            of {metrics.billing_tier.included_wallets.toLocaleString()} included
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">Billing Tier</h3>
            <AlertCircle className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-lg font-bold text-gray-900 capitalize">
            {metrics.billing_tier.name.replace('_', ' ')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Base: {formatCurrency(metrics.billing_tier.monthly_base_fee_cents)}/mo
          </p>
        </div>
      </div>

      {/* Cost Breakdown */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Cost Breakdown</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Base Subscription</span>
            <span className="font-medium">{formatCurrency(metrics.current_month.base_fee_cents)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Usage Fees</span>
            <span className="font-medium">{formatCurrency(metrics.current_month.usage_fees_cents)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Computation Units</span>
            <span className="font-medium">{formatCurrency(metrics.current_month.computation_fees_cents)}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-gray-600">Overages</span>
            <span className="font-medium text-orange-600">
              {formatCurrency(metrics.current_month.overage_fees_cents)}
            </span>
          </div>
          {metrics.current_month.discount_cents > 0 && (
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-green-600">USDXM Discount (10%)</span>
              <span className="font-medium text-green-600">
                -{formatCurrency(metrics.current_month.discount_cents)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center py-3 text-lg font-semibold">
            <span>Total Due</span>
            <span>{formatCurrency(metrics.current_month.total_cents)}</span>
          </div>
        </div>
      </div>

      {/* Usage Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold mb-4">Transaction Trend (30 Days)</h2>
        <div className="h-64">
          <Line
            data={usageChartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Make Payment</h2>
          <button
            onClick={() => window.open('/billing/history')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            Download Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => {
              setSelectedPaymentMethod('USDXM');
              setShowPaymentModal(true);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'USDXM'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">USDXM</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                10% OFF
              </span>
            </div>
            <p className="text-sm text-gray-600">USD eXpress Monay</p>
            <p className="text-lg font-bold mt-2">
              {formatCurrency(currentTotal - calculateUSDXMDiscount(currentTotal))}
            </p>
          </button>

          <button
            onClick={() => {
              setSelectedPaymentMethod('USDC');
              setShowPaymentModal(true);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'USDC'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">USDC</span>
            </div>
            <p className="text-sm text-gray-600">USD Coin</p>
            <p className="text-lg font-bold mt-2">{formatCurrency(currentTotal)}</p>
          </button>

          <button
            onClick={() => {
              setSelectedPaymentMethod('USDT');
              setShowPaymentModal(true);
            }}
            className={`p-4 rounded-lg border-2 transition-all ${
              paymentMethod === 'USDT'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold">USDT</span>
            </div>
            <p className="text-sm text-gray-600">Tether USD</p>
            <p className="text-lg font-bold mt-2">{formatCurrency(currentTotal)}</p>
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Save 10% with USDXM!</p>
              <p className="text-xs">
                Pay with USD eXpress Monay (USDXM) and automatically receive a 10% discount on your bill.
                Current savings: {formatCurrency(calculateUSDXMDiscount(currentTotal))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Payment</h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Amount</span>
                <span className="font-medium">{formatCurrency(currentTotal)}</span>
              </div>
              
              {paymentMethod === 'USDXM' && (
                <div className="flex justify-between items-center text-green-600">
                  <span>USDXM Discount (10%)</span>
                  <span className="font-medium">-{formatCurrency(calculateUSDXMDiscount(currentTotal))}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t">
                <span>Total to Pay</span>
                <span>{formatCurrency(paymentMethod === 'USDXM' ? currentTotal - calculateUSDXMDiscount(currentTotal) : currentTotal)}</span>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                <p className="font-medium">{paymentMethod}</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePayment}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}