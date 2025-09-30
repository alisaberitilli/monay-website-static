'use client';

import { useState } from 'react';
import {
  Wallet,
  Heart,
  CreditCard,
  DollarSign,
  Calendar,
  Receipt,
  Upload,
  FileText,
  CheckCircle,
  Shield,
  PlusCircle,
  TrendingUp,
  Clock,
  Star,
  MapPin
} from 'lucide-react';

interface HSAFSAAccount {
  type: 'HSA' | 'FSA';
  balance: number;
  annualLimit: number;
  contributed: number;
  employerContribution: number;
  rolloverAmount: number;
  expirationDate?: string;
}

interface Transaction {
  id: string;
  date: string;
  merchant: string;
  amount: number;
  category: string;
  status: 'approved' | 'pending' | 'denied';
  receiptRequired: boolean;
  receiptUploaded: boolean;
}

interface EligibleProvider {
  id: string;
  name: string;
  category: string;
  address: string;
  rating: number;
  acceptsHSA: boolean;
  acceptsFSA: boolean;
  distance: number;
}

export default function HSAFSAWalletPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'providers' | 'receipts'>('overview');

  const hsaAccount: HSAFSAAccount = {
    type: 'HSA',
    balance: 2847.50,
    annualLimit: 4300,
    contributed: 1500,
    employerContribution: 750,
    rolloverAmount: 597.50,
  };

  const fsaAccount: HSAFSAAccount = {
    type: 'FSA',
    balance: 1240.75,
    annualLimit: 3200,
    contributed: 1959.25,
    employerContribution: 0,
    rolloverAmount: 0,
    expirationDate: '2024-12-31'
  };

  const recentTransactions: Transaction[] = [
    {
      id: '1',
      date: '2024-01-15',
      merchant: 'CVS Pharmacy',
      amount: 45.67,
      category: 'Prescription',
      status: 'approved',
      receiptRequired: false,
      receiptUploaded: true
    },
    {
      id: '2',
      date: '2024-01-12',
      merchant: 'Dr. Sarah Johnson',
      amount: 150.00,
      category: 'Doctor Visit',
      status: 'pending',
      receiptRequired: true,
      receiptUploaded: false
    },
    {
      id: '3',
      date: '2024-01-10',
      merchant: 'Vision Center',
      amount: 280.50,
      category: 'Vision Care',
      status: 'approved',
      receiptRequired: true,
      receiptUploaded: true
    }
  ];

  const eligibleProviders: EligibleProvider[] = [
    {
      id: '1',
      name: 'CVS Pharmacy',
      category: 'Pharmacy',
      address: '123 Main St, San Francisco, CA',
      rating: 4.2,
      acceptsHSA: true,
      acceptsFSA: true,
      distance: 0.3
    },
    {
      id: '2',
      name: 'UCSF Medical Center',
      category: 'Hospital',
      address: '400 Parnassus Ave, San Francisco, CA',
      rating: 4.8,
      acceptsHSA: true,
      acceptsFSA: true,
      distance: 1.2
    },
    {
      id: '3',
      name: 'Walgreens',
      category: 'Pharmacy',
      address: '789 Market St, San Francisco, CA',
      rating: 4.0,
      acceptsHSA: true,
      acceptsFSA: true,
      distance: 0.7
    }
  ];

  const eligibleExpenses = [
    'Doctor visits and consultations',
    'Prescription medications',
    'Dental care and cleanings',
    'Vision care and eyewear',
    'Mental health services',
    'Physical therapy',
    'Medical devices and equipment',
    'Over-the-counter medications (with prescription)'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Wallet className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            HSA/FSA Wallet
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your Health Savings Account and Flexible Spending Account. Pay for eligible expenses instantly with your Monay wallet
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-lg">
            {(['overview', 'transactions', 'providers', 'receipts'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all capitalize ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Account Balances */}
            <div className="lg:col-span-2 space-y-6">
              {/* HSA Account */}
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Health Savings Account (HSA)</h2>
                  <div className="px-4 py-2 bg-green-100 text-green-800 rounded-xl font-semibold">
                    Tax-Free
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-6 bg-blue-50 rounded-2xl">
                    <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <p className="text-3xl font-bold text-gray-900">${hsaAccount.balance}</p>
                    <p className="text-sm text-gray-500">Current Balance</p>
                  </div>
                  <div className="text-center p-6 bg-green-50 rounded-2xl">
                    <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
                    <p className="text-3xl font-bold text-gray-900">${hsaAccount.contributed}</p>
                    <p className="text-sm text-gray-500">Your Contributions</p>
                  </div>
                  <div className="text-center p-6 bg-purple-50 rounded-2xl">
                    <PlusCircle className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                    <p className="text-3xl font-bold text-gray-900">${hsaAccount.employerContribution}</p>
                    <p className="text-sm text-gray-500">Employer Match</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Annual Contribution Progress</span>
                    <span>${hsaAccount.contributed + hsaAccount.employerContribution} / ${hsaAccount.annualLimit}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-500 h-3 rounded-full"
                      style={{ width: `${((hsaAccount.contributed + hsaAccount.employerContribution) / hsaAccount.annualLimit) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* FSA Account */}
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Flexible Spending Account (FSA)</h2>
                  <div className="px-4 py-2 bg-orange-100 text-orange-800 rounded-xl font-semibold">
                    Use It or Lose It
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-6 bg-orange-50 rounded-2xl">
                    <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-3" />
                    <p className="text-3xl font-bold text-gray-900">${fsaAccount.balance}</p>
                    <p className="text-sm text-gray-500">Available Balance</p>
                  </div>
                  <div className="text-center p-6 bg-red-50 rounded-2xl">
                    <Calendar className="h-8 w-8 text-red-600 mx-auto mb-3" />
                    <p className="text-lg font-bold text-gray-900">{fsaAccount.expirationDate}</p>
                    <p className="text-sm text-gray-500">Expires</p>
                  </div>
                  <div className="text-center p-6 bg-blue-50 rounded-2xl">
                    <Clock className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                    <p className="text-lg font-bold text-gray-900">11 months</p>
                    <p className="text-sm text-gray-500">Time Remaining</p>
                  </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="h-5 w-5 text-red-600" />
                    <span className="font-semibold text-red-800">Deadline Reminder</span>
                  </div>
                  <p className="text-sm text-red-700">
                    Don't forget to use your FSA funds before they expire! Plan your healthcare expenses wisely.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions & Info */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Pay with HSA/FSA</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-2xl transition-all">
                    <Upload className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Upload Receipt</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-2xl transition-all">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Request Reimbursement</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 p-4 bg-orange-50 hover:bg-orange-100 rounded-2xl transition-all">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                    <span className="font-medium text-gray-900">View Contribution Limits</span>
                  </button>
                </div>
              </div>

              {/* Eligible Expenses */}
              <div className="bg-white rounded-3xl shadow-2xl p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Eligible Expenses</h3>
                <div className="space-y-3">
                  {eligibleExpenses.slice(0, 6).map((expense, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">{expense}</span>
                    </div>
                  ))}
                  <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                    View Complete List →
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Transactions</h2>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Heart className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{transaction.merchant}</h4>
                        <p className="text-sm text-gray-500">{transaction.category} • {transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">${transaction.amount}</p>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        transaction.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : transaction.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>

                  {transaction.receiptRequired && !transaction.receiptUploaded && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3">
                      <div className="flex items-center space-x-2">
                        <Upload className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm font-medium text-yellow-800">Receipt Required</span>
                        <button className="ml-auto text-yellow-600 text-sm font-medium hover:text-yellow-700">
                          Upload Now
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Providers Tab */}
        {activeTab === 'providers' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">HSA/FSA Eligible Providers</h2>
            <div className="space-y-4">
              {eligibleProviders.map((provider) => (
                <div key={provider.id} className="border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-semibold text-gray-900">{provider.name}</h4>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm text-gray-600">{provider.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{provider.address}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{provider.distance} mi</span>
                        </div>
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-lg">
                          {provider.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="flex space-x-2 mb-2">
                        {provider.acceptsHSA && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-lg">
                            HSA
                          </span>
                        )}
                        {provider.acceptsFSA && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-lg">
                            FSA
                          </span>
                        )}
                      </div>
                      <button className="bg-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-all">
                        Visit & Pay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Receipts Tab */}
        {activeTab === 'receipts' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Receipt Management</h2>

            <div className="text-center py-12">
              <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Receipts</h3>
              <p className="text-gray-600 mb-6">
                Keep track of your healthcare expenses and ensure compliance with HSA/FSA regulations
              </p>
              <button className="bg-blue-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-all">
                <div className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload Receipt</span>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-6 bg-blue-50 rounded-2xl">
                <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Secure Storage</h4>
                <p className="text-sm text-gray-500">Your receipts are encrypted and securely stored</p>
              </div>
              <div className="text-center p-6 bg-green-50 rounded-2xl">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Auto-Verification</h4>
                <p className="text-sm text-gray-500">Automatic verification for eligible expenses</p>
              </div>
              <div className="text-center p-6 bg-purple-50 rounded-2xl">
                <FileText className="h-8 w-8 text-purple-600 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">Digital Records</h4>
                <p className="text-sm text-gray-500">Access your receipts anytime, anywhere</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}