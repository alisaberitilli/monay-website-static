'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { UnifiedPaymentGateway, PaymentConfig } from '@monay/shared-ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DepositsPage() {
  const router = useRouter();
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const config: PaymentConfig = {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    walletType: 'consumer',
    getAuthToken: () => {
      // Get auth token from your auth system
      if (typeof window !== 'undefined') {
        return localStorage.getItem('authToken');
      }
      return null;
    }
  };

  const handleSuccess = (data: any) => {
    console.log('Deposit successful:', data);
    setNotification({
      type: 'success',
      message: `Successfully deposited $${data.amount}. Transaction ID: ${data.transactionId}`
    });

    // Optional: Redirect to dashboard or refresh balance
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  const handleError = (error: any) => {
    console.error('Deposit failed:', error);
    setNotification({
      type: 'error',
      message: error.message || 'Transaction failed. Please try again.'
    });
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Add Money to Your Wallet</h1>

        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${
            notification.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {notification.message}
          </div>
        )}

        <UnifiedPaymentGateway
          mode="deposit"
          config={config}
          onSuccess={handleSuccess}
          onError={handleError}
          theme="light"
        />
        </div>
      </div>
    </DashboardLayout>
  );
}