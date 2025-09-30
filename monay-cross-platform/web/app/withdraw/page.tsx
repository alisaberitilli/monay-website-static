'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import UnifiedPaymentGateway from '@/components/UnifiedPaymentGateway';
import {
  Wallet,
  Shield,
  Check,
  Info,
  AlertTriangle,
  Clock,
  DollarSign,
  ArrowDownToLine,
  CreditCard,
  Building2
} from 'lucide-react';

export default function WithdrawPage() {
  const [currentBalance, setCurrentBalance] = useState(12450.75);
  const [availableBalance, setAvailableBalance] = useState(12450.75);
  const [pendingWithdrawals, setPendingWithdrawals] = useState(0);
  const [recentWithdrawals, setRecentWithdrawals] = useState([
    { id: '1', amount: 1000, date: '3 days ago', method: 'Monay Pay - ACH', status: 'completed', provider: 'monay-fiat' },
    { id: '2', amount: 500, date: '1 week ago', method: 'Stripe - Wire', status: 'completed', provider: 'stripe' },
    { id: '3', amount: 2500, date: '2 weeks ago', method: 'Dwolla - FedNow', status: 'completed', provider: 'dwolla' },
    { id: '4', amount: 750, date: '3 weeks ago', method: 'Circle - Wire', status: 'completed', provider: 'circle' },
  ]);

  const [linkedAccounts, setLinkedAccounts] = useState([
    { id: '1', type: 'bank', name: 'Chase Checking ****1234', isDefault: true, verified: true },
    { id: '2', type: 'bank', name: 'Wells Fargo ****5678', isDefault: false, verified: true },
    { id: '3', type: 'card', name: 'Visa Debit ****9012', isDefault: false, verified: true },
  ]);

  const handleSuccess = (transaction: any) => {
    // Update balance
    setCurrentBalance(prev => prev - transaction.amount);
    setAvailableBalance(prev => prev - transaction.amount);

    // Add to recent withdrawals
    const newWithdrawal = {
      id: Date.now().toString(),
      amount: transaction.amount,
      date: 'Just now',
      method: `${transaction.provider} - ${transaction.method}`,
      status: 'pending',
      provider: transaction.provider
    };

    setRecentWithdrawals(prev => [newWithdrawal, ...prev.slice(0, 3)]);
    setPendingWithdrawals(prev => prev + transaction.amount);
  };

  const handleError = (error: string) => {
    console.error('Withdrawal error:', error);
  };

  // Fetch actual balance from backend
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/wallet/balance`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setCurrentBalance(data.balance || 0);
          setAvailableBalance(data.availableBalance || data.balance || 0);
          setPendingWithdrawals(data.pendingWithdrawals || 0);
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error);
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

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'completed': return 'green';
      case 'pending': return 'yellow';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Withdraw Money</h1>
            <p className="text-gray-600 mt-2">Transfer funds from your wallet to your bank account</p>
          </div>

          <div className="flex space-x-4">
            <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4 text-white">
              <p className="text-sm text-white/80 mb-1">Available Balance</p>
              <p className="text-2xl font-bold">${availableBalance.toFixed(2)}</p>
            </div>
            {pendingWithdrawals > 0 && (
              <div className="bg-yellow-100 rounded-2xl p-4">
                <p className="text-sm text-yellow-700 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">${pendingWithdrawals.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Section - Unified Payment Gateway */}
          <div className="lg:col-span-2">
            <UnifiedPaymentGateway
              walletType="consumer"
              transactionType="withdrawal"
              userId="user123" // This should come from auth context
              currentBalance={availableBalance}
              onSuccess={handleSuccess}
              onError={handleError}
            />

            {/* Linked Accounts */}
            <div className="mt-6 bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Linked Accounts</h3>
              <div className="space-y-3">
                {linkedAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      {account.type === 'bank' ? (
                        <Building2 className="h-5 w-5 text-gray-600" />
                      ) : (
                        <CreditCard className="h-5 w-5 text-gray-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{account.name}</p>
                        {account.isDefault && (
                          <span className="text-xs text-purple-600">Default account</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {account.verified && (
                        <span className="flex items-center text-xs text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-medium hover:bg-purple-100 transition-colors">
                + Add Bank Account
              </button>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Withdrawal Limits */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <Info className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Withdrawal Limits</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Daily limit:</span>
                  <span className="font-medium text-gray-900">$50,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Weekly limit:</span>
                  <span className="font-medium text-gray-900">$250,000</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Monthly limit:</span>
                  <span className="font-medium text-gray-900">$1,000,000</span>
                </div>
              </div>
              <div className="mt-4 p-3 bg-blue-100 rounded-xl">
                <p className="text-xs text-blue-700">
                  Limits may vary based on your account verification level and chosen payment provider.
                </p>
              </div>
            </div>

            {/* Processing Times */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Times</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    FedNow/RTP
                  </span>
                  <span className="font-medium text-green-600">&lt; 60 seconds</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    Card Transfer
                  </span>
                  <span className="font-medium text-blue-600">Instant</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    ACH Transfer
                  </span>
                  <span className="font-medium text-yellow-600">1-3 days</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                    Wire Transfer
                  </span>
                  <span className="font-medium text-orange-600">3-5 days</span>
                </div>
              </div>
            </div>

            {/* Recent Withdrawals */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Withdrawals</h3>
              <div className="space-y-3">
                {recentWithdrawals.map((withdrawal) => (
                  <div key={withdrawal.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">-${withdrawal.amount}</p>
                      <p className="text-sm text-gray-500">{withdrawal.date}</p>
                      <p className="text-xs text-gray-400">{withdrawal.method}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 bg-${getStatusColor(withdrawal.status)}-100 text-${getStatusColor(withdrawal.status)}-700 text-xs font-medium rounded-full`}>
                        {withdrawal.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 text-purple-600 font-medium text-sm hover:text-purple-700 transition-colors">
                View All Withdrawals
              </button>
            </div>

            {/* Security Notice */}
            <div className="bg-yellow-50 rounded-3xl p-6">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-900 mb-2">Security Notice</p>
                  <p className="text-yellow-700">
                    All withdrawals are monitored for fraud prevention. Large or unusual withdrawals may require additional verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}