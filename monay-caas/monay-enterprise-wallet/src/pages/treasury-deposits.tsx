'use client';

import { UnifiedPaymentGateway, PaymentConfig } from '@monay/shared-ui';
import { useRouter } from 'next/router';
import { useState } from 'react';
// import Layout from '../components/Layout'; // TODO: Create Layout component

export default function TreasuryDepositsPage() {
  const router = useRouter();
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const config: PaymentConfig = {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    walletType: 'enterprise',
    getAuthToken: () => {
      // Get auth token from your auth system
      if (typeof window !== 'undefined') {
        return localStorage.getItem('enterpriseAuthToken') || localStorage.getItem('authToken');
      }
      return null;
    }
  };

  const handleSuccess = (data: any) => {
    console.log('Enterprise deposit successful:', data);
    setNotification({
      type: 'success',
      message: `Successfully deposited $${data.amount} to enterprise treasury. Transaction ID: ${data.transactionId}`
    });

    // Refresh treasury balance or redirect
    setTimeout(() => {
      router.push('/treasury');
    }, 3000);
  };

  const handleError = (error: any) => {
    console.error('Enterprise deposit failed:', error);
    setNotification({
      type: 'error',
      message: error.message || 'Transaction failed. Please contact support.'
    });
  };

  return (
    <div> {/* TODO: Wrap in Layout component when implemented */}
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Add Funds to Treasury</h1>
            <p className="text-gray-400">
              Deposit funds to your enterprise treasury for operations and payments
            </p>
          </div>

          {notification && (
            <div className={`mb-6 p-4 rounded-lg ${
              notification.type === 'success'
                ? 'bg-green-900 text-green-100 border border-green-700'
                : 'bg-red-900 text-red-100 border border-red-700'
            }`}>
              {notification.message}
            </div>
          )}

          <div className="bg-gray-800 rounded-lg p-1">
            <UnifiedPaymentGateway
              mode="deposit"
              config={config}
              onSuccess={handleSuccess}
              onError={handleError}
              theme="dark"
              className="bg-gray-800"
            />
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={() => router.push('/treasury')}
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              ← Back to Treasury Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}