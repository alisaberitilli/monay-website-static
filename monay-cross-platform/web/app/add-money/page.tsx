'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import UnifiedPaymentGateway from '@/components/UnifiedPaymentGateway';
import {
  TrendingUp,
  Shield,
  Check,
  Clock,
  DollarSign,
  ArrowRight
} from 'lucide-react';

export default function AddMoneyPage() {
  const [currentBalance, setCurrentBalance] = useState(12450.75);
  const [recentTransfers, setRecentTransfers] = useState([
    { id: '1', amount: 500, date: '2 days ago', method: 'Monay Pay - Card', status: 'completed', provider: 'monay-fiat' },
    { id: '2', amount: 1000, date: '5 days ago', method: 'Stripe - ACH', status: 'completed', provider: 'stripe' },
    { id: '3', amount: 250, date: '1 week ago', method: 'Circle - USDC', status: 'completed', provider: 'circle' },
    { id: '4', amount: 750, date: '2 weeks ago', method: 'Dwolla - FedNow', status: 'completed', provider: 'dwolla' },
  ]);

  const handleSuccess = (transaction: any) => {
    // Update balance
    setCurrentBalance(prev => prev + transaction.amount);

    // Add to recent transfers
    const newTransfer = {
      id: Date.now().toString(),
      amount: transaction.amount,
      date: 'Just now',
      method: `${transaction.provider} - ${transaction.method}`,
      status: 'completed',
      provider: transaction.provider
    };

    setRecentTransfers(prev => [newTransfer, ...prev.slice(0, 3)]);
  };

  const handleError = (error: string) => {
    console.error('Payment error:', error);
  };

  // Fetch actual balance from backend
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem('token');

        // Skip fetching if no token available (user not authenticated)
        if (!token) {
          console.log('No authentication token found, using default balance');
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/balance`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentBalance(data.balance || data.availableBalance || 0);
        } else if (response.status === 401 || response.status === 403) {
          console.log('Authentication failed, using default balance');
          // Don't show error for auth failures in demo mode
        } else {
          console.error('Failed to fetch balance:', response.status);
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        // Continue with default balance in case of network errors
      }
    };

    fetchBalance();
  }, []);

  const getProviderColor = (provider: string) => {
    switch(provider) {
      case 'monay-fiat': return 'purple';
      case 'circle': return 'blue';
      case 'dwolla': return 'green';
      case 'stripe': return 'indigo';
      default: return 'gray';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Money</h1>
            <p className="text-gray-600 mt-2">Choose from multiple payment providers to top up your wallet</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4 text-white">
            <p className="text-sm text-white/80 mb-1">Current Balance</p>
            <p className="text-2xl font-bold">${currentBalance.toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Section - Unified Payment Gateway */}
          <div className="lg:col-span-2">
            <UnifiedPaymentGateway
              walletType="consumer"
              transactionType="deposit"
              userId="user123" // This should come from auth context
              currentBalance={currentBalance}
              onSuccess={handleSuccess}
              onError={handleError}
            />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Security Info */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <Shield className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Bank-Level Security</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                All payment providers use industry-standard encryption and security measures.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">256-bit SSL encryption</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">PCI DSS compliant</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Multi-provider redundancy</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-gray-700">Real-time fraud detection</span>
                </div>
              </div>
            </div>

            {/* Recent Transfers */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Top-ups</h3>
              <div className="space-y-3">
                {recentTransfers.map((transfer) => (
                  <div key={transfer.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">+${transfer.amount}</p>
                      <p className="text-sm text-gray-500">{transfer.date}</p>
                      <p className="text-xs text-gray-400">{transfer.method}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 bg-${getProviderColor(transfer.provider)}-100 text-${getProviderColor(transfer.provider)}-700 text-xs font-medium rounded-full`}>
                        {transfer.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-purple-600 font-medium text-sm hover:text-purple-700 transition-colors">
                View All Transaction History
              </button>
            </div>

            {/* Payment Providers Info */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Providers</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Monay Pay</span>
                  <span className="text-gray-500">Lowest fees</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Circle USDC</span>
                  <span className="text-gray-500">Crypto rails</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Dwolla</span>
                  <span className="text-gray-500">Instant transfers</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Stripe</span>
                  <span className="text-gray-500">Global coverage</span>
                </div>
              </div>
            </div>

            {/* Promo Section */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl p-6 text-white">
              <div className="flex items-center space-x-3 mb-3">
                <TrendingUp className="h-6 w-6" />
                <h3 className="text-lg font-semibold">Multi-Provider Benefits</h3>
              </div>
              <p className="text-sm text-white/90 mb-4">
                Choose the best payment method for your needs. Lower fees with ACH, instant with FedNow, or global with cards.
              </p>
              <button className="w-full py-2 bg-white/20 backdrop-blur-sm rounded-xl text-white font-medium hover:bg-white/30 transition-all">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}