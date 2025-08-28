'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Send, 
  ArrowDown, 
  ArrowUp, 
  Eye, 
  EyeOff,
  Smartphone,
  FileText,
  CreditCard,
  DollarSign,
  QrCode,
  Wallet,
  TrendingUp,
  Users,
  Activity,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  icon?: string;
}

import DashboardLayout from '@/components/DashboardLayout';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [showBalance, setShowBalance] = useState(true);
  const [balance, setBalance] = useState(12450.75);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  
  // Fetch real balance on component mount
  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const response = await fetch('/api/wallet/balance');
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };
  
  // Clear all mock data - start with actual zeros
  const monthlyIncome = 0;
  const monthlyExpense = 0;
  const savings = balance;
  
  // No mock transactions - start with empty transaction list
  const recentTransactions: Transaction[] = [];

  const quickActions = [
    { name: 'Send', icon: Send, gradient: 'from-blue-500 to-cyan-500', path: '/send' },
    { name: 'Request', icon: ArrowDown, gradient: 'from-purple-500 to-pink-500', path: '/request-money' },
    { name: 'Top Up', icon: Plus, gradient: 'from-orange-500 to-red-500', path: '/add-money' },
    { name: 'Bills', icon: FileText, gradient: 'from-green-500 to-emerald-500', path: '/transactions' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Good morning, {user?.firstName}! 👋
            </h1>
            <p className="text-gray-600 mt-1">Here's your financial overview</p>
          </div>
          <button 
            onClick={() => router.push('/add-money')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-medium hover:shadow-lg transition-all">
            + Add Money
          </button>
        </div>

        {/* Main Balance Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 text-white">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -mr-48 -mt-48"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full -ml-40 -mb-40"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-white/80 text-sm font-medium mb-2">Total Balance</p>
                <div className="flex items-center space-x-4">
                  <h2 className="text-5xl font-bold">
                    {showBalance ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '•••••••'}
                  </h2>
                  <button
                    onClick={() => setShowBalance(!showBalance)}
                    className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  >
                    {showBalance ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {showBalance && (
                  <p className="text-white/70 text-sm mt-2">
                    <span className="text-green-300">↑ 12.5%</span> from last month
                  </p>
                )}
              </div>
              
              <div className="text-right">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2 inline-block">
                  <p className="text-xs text-white/80">Card Number</p>
                  <p className="font-mono">•••• 4532</p>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <ArrowDownLeft className="h-4 w-4 text-green-300" />
                  <p className="text-xs text-white/80">Income</p>
                </div>
                <p className="text-xl font-bold">${monthlyIncome.toLocaleString()}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <ArrowUpRight className="h-4 w-4 text-red-300" />
                  <p className="text-xs text-white/80">Expenses</p>
                </div>
                <p className="text-xl font-bold">${monthlyExpense.toLocaleString()}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                <div className="flex items-center space-x-2 mb-1">
                  <Wallet className="h-4 w-4 text-yellow-300" />
                  <p className="text-xs text-white/80">Savings</p>
                </div>
                <p className="text-xl font-bold">${savings.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-4 gap-4">
                {quickActions.map((action) => (
                  <button
                    key={action.name}
                    onClick={() => router.push(action.path)}
                    className="group relative bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                    <div className="relative z-10">
                      <div className={`w-12 h-12 bg-gradient-to-br ${action.gradient} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-700 group-hover:text-white">{action.name}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                <button className="text-purple-600 font-medium hover:text-purple-700">View All</button>
              </div>
              
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl">
                        {transaction.icon}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{transaction.date}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-semibold text-lg ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">{transaction.category}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spending Overview Chart */}
            <div className="bg-white rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Spending Overview</h3>
                <select className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-1 border-0">
                  <option>This Month</option>
                  <option>Last Month</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
              
              {/* Spending Categories with Visual Bars */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Shopping</span>
                    <span className="text-sm font-semibold text-gray-900">$1,450</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Food & Dining</span>
                    <span className="text-sm font-semibold text-gray-900">$825</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Transport</span>
                    <span className="text-sm font-semibold text-gray-900">$520</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Entertainment</span>
                    <span className="text-sm font-semibold text-gray-900">$340</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Others</span>
                    <span className="text-sm font-semibold text-gray-900">$235</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div className="bg-gradient-to-r from-gray-500 to-gray-600 h-3 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                </div>
                
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total Spent</span>
                    <span className="text-lg font-bold text-gray-900">$3,370</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Cards */}
            <div className="bg-white rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">My Cards</h3>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <p className="text-xs text-white/80 mb-1">Balance</p>
                    <p className="text-2xl font-bold">$2,547.83</p>
                  </div>
                  <div className="w-12 h-8 bg-white/20 rounded flex items-center justify-center">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </div>
                <div className="font-mono text-sm mb-4">•••• •••• •••• 4532</div>
                <div className="flex justify-between text-xs">
                  <span>John Doe</span>
                  <span>12/26</span>
                </div>
              </div>
              
              <button className="w-full mt-4 py-3 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-purple-600 hover:text-purple-600 transition-colors">
                + Add New Card
              </button>
            </div>

            {/* Goals */}
            <div className="bg-white rounded-3xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Savings Goals</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Vacation Fund</span>
                    <span className="text-gray-600">$2,400 / $5,000</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">New Laptop</span>
                    <span className="text-gray-600">$800 / $2,000</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Emergency Fund</span>
                    <span className="text-gray-600">$8,000 / $10,000</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" style={{ width: '80%' }}></div>
                  </div>
                </div>
              </div>
              
              <button className="w-full mt-6 py-3 bg-purple-50 text-purple-600 rounded-2xl font-medium hover:bg-purple-100 transition-colors">
                Create New Goal
              </button>
            </div>

            {/* Insights */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                  <Activity className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Monthly Insight</h3>
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed">
                You've saved <span className="font-semibold text-green-600">23% more</span> this month compared to last month. 
                Keep up the great work! Consider increasing your emergency fund goal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}