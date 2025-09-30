'use client';

import { useState } from 'react';
import { Zap, Droplets, Flame, Wifi, Phone, DollarSign, Calendar, Clock, AlertCircle, CheckCircle, CreditCard, Download, Upload, TrendingUp, FileText } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';

interface UtilityAccount {
  id: string;
  provider: string;
  accountNumber: string;
  serviceType: 'electricity' | 'gas' | 'water' | 'internet' | 'phone' | 'sewer' | 'trash';
  serviceAddress: string;
  isActive: boolean;
  lastBillAmount: number;
  lastBillDate: string;
  nextDueDate: string;
  averageMonthlyUsage: number;
  currentBalance: number;
  autopayEnabled: boolean;
}

interface Bill {
  id: string;
  accountId: string;
  provider: string;
  serviceType: string;
  billDate: string;
  dueDate: string;
  amount: number;
  usage: number;
  usageUnit: string;
  status: 'paid' | 'pending' | 'overdue' | 'processing';
  paymentMethod?: string;
  paidDate?: string;
}

interface PaymentMethod {
  id: string;
  type: 'bank' | 'card' | 'digital_wallet';
  name: string;
  accountNumber: string;
  isDefault: boolean;
}

interface UsageData {
  month: string;
  usage: number;
  cost: number;
  average: number;
}

export default function UtilitiesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'bills' | 'usage' | 'payments' | 'support'>('overview');
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);

  const accounts: UtilityAccount[] = [
    {
      id: '1',
      provider: 'Pacific Electric',
      accountNumber: '****-5678',
      serviceType: 'electricity',
      serviceAddress: '123 Main St, City, ST 12345',
      isActive: true,
      lastBillAmount: 145.67,
      lastBillDate: '2024-09-15',
      nextDueDate: '2024-10-10',
      averageMonthlyUsage: 850,
      currentBalance: 0,
      autopayEnabled: true
    },
    {
      id: '2',
      provider: 'Metro Gas Company',
      accountNumber: '****-3456',
      serviceType: 'gas',
      serviceAddress: '123 Main St, City, ST 12345',
      isActive: true,
      lastBillAmount: 78.32,
      lastBillDate: '2024-09-12',
      nextDueDate: '2024-10-12',
      averageMonthlyUsage: 45,
      currentBalance: 78.32,
      autopayEnabled: false
    },
    {
      id: '3',
      provider: 'City Water & Sewer',
      accountNumber: '****-7890',
      serviceType: 'water',
      serviceAddress: '123 Main St, City, ST 12345',
      isActive: true,
      lastBillAmount: 89.45,
      lastBillDate: '2024-09-20',
      nextDueDate: '2024-10-20',
      averageMonthlyUsage: 4500,
      currentBalance: 89.45,
      autopayEnabled: false
    },
    {
      id: '4',
      provider: 'SpeedNet Internet',
      accountNumber: '****-2468',
      serviceType: 'internet',
      serviceAddress: '123 Main St, City, ST 12345',
      isActive: true,
      lastBillAmount: 79.99,
      lastBillDate: '2024-09-25',
      nextDueDate: '2024-10-25',
      averageMonthlyUsage: 0,
      currentBalance: 0,
      autopayEnabled: true
    }
  ];

  const bills: Bill[] = [
    {
      id: '1',
      accountId: '1',
      provider: 'Pacific Electric',
      serviceType: 'electricity',
      billDate: '2024-09-15',
      dueDate: '2024-10-10',
      amount: 145.67,
      usage: 875,
      usageUnit: 'kWh',
      status: 'paid',
      paymentMethod: 'Auto-pay',
      paidDate: '2024-10-09'
    },
    {
      id: '2',
      accountId: '2',
      provider: 'Metro Gas Company',
      serviceType: 'gas',
      billDate: '2024-09-12',
      dueDate: '2024-10-12',
      amount: 78.32,
      usage: 48,
      usageUnit: 'therms',
      status: 'pending'
    },
    {
      id: '3',
      accountId: '3',
      provider: 'City Water & Sewer',
      serviceType: 'water',
      billDate: '2024-09-20',
      dueDate: '2024-10-20',
      amount: 89.45,
      usage: 4800,
      usageUnit: 'gallons',
      status: 'pending'
    },
    {
      id: '4',
      accountId: '4',
      provider: 'SpeedNet Internet',
      serviceType: 'internet',
      billDate: '2024-09-25',
      dueDate: '2024-10-25',
      amount: 79.99,
      usage: 0,
      usageUnit: '',
      status: 'paid',
      paymentMethod: 'Auto-pay',
      paidDate: '2024-10-24'
    }
  ];

  const paymentMethods: PaymentMethod[] = [
    {
      id: '1',
      type: 'bank',
      name: 'Chase Checking',
      accountNumber: '****-1234',
      isDefault: true
    },
    {
      id: '2',
      type: 'card',
      name: 'Visa Credit Card',
      accountNumber: '****-5678',
      isDefault: false
    },
    {
      id: '3',
      type: 'digital_wallet',
      name: 'PayPal',
      accountNumber: 'user@example.com',
      isDefault: false
    }
  ];

  const usageData: UsageData[] = [
    { month: 'Jan', usage: 920, cost: 158.30, average: 850 },
    { month: 'Feb', usage: 875, cost: 148.75, average: 850 },
    { month: 'Mar', usage: 798, cost: 135.45, average: 850 },
    { month: 'Apr', usage: 756, cost: 128.20, average: 850 },
    { month: 'May', usage: 834, cost: 141.78, average: 850 },
    { month: 'Jun', usage: 952, cost: 161.84, average: 850 },
    { month: 'Jul', usage: 1125, cost: 191.25, average: 850 },
    { month: 'Aug', usage: 1089, cost: 185.13, average: 850 },
    { month: 'Sep', usage: 875, cost: 148.75, average: 850 }
  ];

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'electricity': return Zap;
      case 'gas': return Flame;
      case 'water': return Droplets;
      case 'internet': return Wifi;
      case 'phone': return Phone;
      default: return AlertCircle;
    }
  };

  const getServiceColor = (serviceType: string) => {
    switch (serviceType) {
      case 'electricity': return 'text-yellow-600';
      case 'gas': return 'text-blue-600';
      case 'water': return 'text-cyan-600';
      case 'internet': return 'text-green-600';
      case 'phone': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'overdue': return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'processing': return <Clock className="h-5 w-5 text-blue-600" />;
      default: return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const totalMonthlyBill = accounts.reduce((sum, account) => sum + account.lastBillAmount, 0);
  const totalBalance = accounts.reduce((sum, account) => sum + account.currentBalance, 0);
  const pendingBills = bills.filter(bill => bill.status === 'pending').length;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Utilities</h1>
          <p className="text-gray-600">Manage your utility accounts, bills, and payments in one place</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          {[
            { id: 'overview', label: 'Overview', icon: DollarSign },
            { id: 'bills', label: 'Bills & Payments', icon: FileText },
            { id: 'usage', label: 'Usage Analytics', icon: TrendingUp },
            { id: 'payments', label: 'Payment Methods', icon: CreditCard },
            { id: 'support', label: 'Support', icon: Phone }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">${totalMonthlyBill.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Monthly Total</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-600">${totalBalance.toFixed(2)}</div>
                <div className="text-sm text-gray-600">Total Balance Due</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">{pendingBills}</div>
                <div className="text-sm text-gray-600">Pending Bills</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <CheckCircle className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{accounts.filter(a => a.autopayEnabled).length}</div>
                <div className="text-sm text-gray-600">Auto-pay Enabled</div>
              </div>
            </div>

            {/* Active Accounts */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">My Utility Accounts</h3>
              <div className="space-y-4">
                {accounts.map(account => {
                  const ServiceIcon = getServiceIcon(account.serviceType);
                  const serviceColor = getServiceColor(account.serviceType);

                  return (
                    <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4 flex-1">
                          <ServiceIcon className={`h-8 w-8 ${serviceColor}`} />
                          <div>
                            <h4 className="font-semibold">{account.provider}</h4>
                            <div className="text-sm text-gray-600">
                              <div>{account.serviceType.charAt(0).toUpperCase() + account.serviceType.slice(1)} • {account.accountNumber}</div>
                              <div>{account.serviceAddress}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-6">
                          <div className="text-center">
                            <div className="text-lg font-bold">${account.lastBillAmount}</div>
                            <div className="text-sm text-gray-600">Last Bill</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-lg font-bold ${account.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              ${account.currentBalance.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600">Balance</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium">{account.nextDueDate}</div>
                            <div className="text-sm text-gray-600">Due Date</div>
                          </div>
                        </div>

                        <div className="ml-6 space-y-2">
                          {account.currentBalance > 0 && (
                            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                              Pay Now
                            </button>
                          )}
                          <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            View Details
                          </button>
                          {account.autopayEnabled && (
                            <div className="text-center">
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                Auto-pay ON
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab('bills')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-center"
                >
                  <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="font-medium">Pay Bills</div>
                  <div className="text-sm text-gray-600">Make payments</div>
                </button>
                <button
                  onClick={() => setActiveTab('usage')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors text-center"
                >
                  <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="font-medium">View Usage</div>
                  <div className="text-sm text-gray-600">Track consumption</div>
                </button>
                <button
                  onClick={() => setActiveTab('payments')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors text-center"
                >
                  <CreditCard className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="font-medium">Payment Methods</div>
                  <div className="text-sm text-gray-600">Manage cards & accounts</div>
                </button>
                <button
                  onClick={() => setActiveTab('support')}
                  className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-colors text-center"
                >
                  <Phone className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                  <div className="font-medium">Get Support</div>
                  <div className="text-sm text-gray-600">Contact providers</div>
                </button>
              </div>
            </div>

            {/* Upcoming Bills Alert */}
            {pendingBills > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-start">
                  <AlertCircle className="h-6 w-6 text-yellow-600 mt-1 mr-3" />
                  <div>
                    <h3 className="font-semibold text-yellow-800 mb-2">Upcoming Bills</h3>
                    <p className="text-sm text-yellow-700">
                      You have {pendingBills} pending bill{pendingBills > 1 ? 's' : ''} with a total of ${totalBalance.toFixed(2)} due.
                      Set up auto-pay to avoid late fees.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bills Tab */}
        {activeTab === 'bills' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Bills</h3>
              <div className="space-y-4">
                {bills.map(bill => {
                  const ServiceIcon = getServiceIcon(bill.serviceType);
                  const serviceColor = getServiceColor(bill.serviceType);

                  return (
                    <div key={bill.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-4 flex-1">
                          <ServiceIcon className={`h-8 w-8 ${serviceColor}`} />
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              {getStatusIcon(bill.status)}
                              <h4 className="font-semibold">{bill.provider}</h4>
                              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(bill.status)}`}>
                                {bill.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600">
                              <div>Bill Date: {bill.billDate} • Due: {bill.dueDate}</div>
                              {bill.usage > 0 && (
                                <div>Usage: {bill.usage} {bill.usageUnit}</div>
                              )}
                              {bill.paidDate && (
                                <div>Paid: {bill.paidDate} via {bill.paymentMethod}</div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-xl font-bold">${bill.amount}</div>
                          <div className="space-y-2 mt-2">
                            {bill.status === 'pending' && (
                              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                Pay Now
                              </button>
                            )}
                            <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Electricity Usage Trend</h3>
              <div className="h-64 flex items-end justify-between space-x-2">
                {usageData.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gray-200 rounded-t relative" style={{ height: '200px' }}>
                      <div
                        className="bg-blue-500 rounded-t absolute bottom-0 w-full"
                        style={{ height: `${(data.usage / 1200) * 100}%` }}
                      ></div>
                      <div
                        className="bg-red-300 absolute bottom-0 w-full opacity-50"
                        style={{ height: `${(data.average / 1200) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-center mt-2">
                      <div className="font-medium">{data.month}</div>
                      <div className="text-gray-600">{data.usage} kWh</div>
                      <div className="text-green-600">${data.cost}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-center mt-4 space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                  Actual Usage
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-300 rounded mr-2"></div>
                  Average
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <Zap className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">875</div>
                <div className="text-sm text-gray-600">kWh This Month</div>
                <div className="text-xs text-green-600 mt-1">3% below average</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">$148.75</div>
                <div className="text-sm text-gray-600">This Month's Cost</div>
                <div className="text-xs text-green-600 mt-1">$5.10 savings</div>
              </div>
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold">$1,789</div>
                <div className="text-sm text-gray-600">Year to Date</div>
                <div className="text-xs text-red-600 mt-1">2% above last year</div>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Payment Methods</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Add Payment Method
                </button>
              </div>
              <div className="space-y-4">
                {paymentMethods.map(method => (
                  <div key={method.id} className={`border-2 rounded-lg p-4 ${
                    method.isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-8 w-8 text-gray-400" />
                        <div>
                          <h4 className="font-medium">{method.name}</h4>
                          <div className="text-sm text-gray-600">
                            {method.type.charAt(0).toUpperCase() + method.type.slice(1).replace('_', ' ')} • {method.accountNumber}
                          </div>
                        </div>
                        {method.isDefault && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            DEFAULT
                          </span>
                        )}
                      </div>
                      <div className="space-x-2">
                        {!method.isDefault && (
                          <button className="px-3 py-1 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors">
                            Set as Default
                          </button>
                        )}
                        <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Auto-pay Settings</h3>
              <div className="space-y-4">
                {accounts.map(account => {
                  const ServiceIcon = getServiceIcon(account.serviceType);
                  const serviceColor = getServiceColor(account.serviceType);

                  return (
                    <div key={account.id} className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <ServiceIcon className={`h-6 w-6 ${serviceColor}`} />
                        <div>
                          <h4 className="font-medium">{account.provider}</h4>
                          <div className="text-sm text-gray-600">{account.serviceType}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs rounded ${
                          account.autopayEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {account.autopayEnabled ? 'ON' : 'OFF'}
                        </span>
                        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
                          {account.autopayEnabled ? 'Disable' : 'Enable'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Support Tab */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Contact Your Providers</h3>
              <div className="space-y-4">
                {accounts.map(account => {
                  const ServiceIcon = getServiceIcon(account.serviceType);
                  const serviceColor = getServiceColor(account.serviceType);

                  return (
                    <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <ServiceIcon className={`h-8 w-8 ${serviceColor}`} />
                          <div>
                            <h4 className="font-semibold">{account.provider}</h4>
                            <div className="text-sm text-gray-600">
                              {account.serviceType.charAt(0).toUpperCase() + account.serviceType.slice(1)} Service
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                            <Phone className="h-4 w-4 mr-2" />
                            Call Support
                          </button>
                          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            Live Chat
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Emergency Contacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Gas Emergency</h4>
                  <p className="text-sm text-red-700 mb-2">
                    If you smell gas, leave immediately and call from a safe location
                  </p>
                  <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Call Emergency Line
                  </button>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Power Outage</h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    Report power outages and check restoration status
                  </p>
                  <button className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                    Report Outage
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}