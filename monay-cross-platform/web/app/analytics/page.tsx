'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Users,
  Calendar,
  Download,
  Filter,
  BarChart3,
  PieChart,
  Activity,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const stats = {
    totalIncome: 8500.00,
    totalExpenses: 5738.49,
    netSavings: 2761.51,
    incomeChange: 12.5,
    expenseChange: -8.3,
    savingsChange: 23.7
  };

  const monthlyData = [
    { month: 'Jan', income: 4200, expenses: 3100 },
    { month: 'Feb', income: 4500, expenses: 3400 },
    { month: 'Mar', income: 4800, expenses: 3200 },
    { month: 'Apr', income: 5200, expenses: 3800 },
    { month: 'May', income: 5500, expenses: 4200 },
    { month: 'Jun', income: 6000, expenses: 4500 },
  ];

  const categories = [
    { name: 'Shopping', amount: 1450.50, percentage: 25.3, icon: ShoppingBag, color: 'from-purple-500 to-pink-500', trend: 'up' },
    { name: 'Food & Dining', amount: 1225.75, percentage: 21.4, icon: Coffee, color: 'from-blue-500 to-cyan-500', trend: 'down' },
    { name: 'Transport', amount: 920.00, percentage: 16.0, icon: Car, color: 'from-green-500 to-emerald-500', trend: 'stable' },
    { name: 'Housing', amount: 1800.00, percentage: 31.4, icon: Home, color: 'from-orange-500 to-red-500', trend: 'stable' },
    { name: 'Entertainment', amount: 342.24, percentage: 5.9, icon: Users, color: 'from-indigo-500 to-purple-500', trend: 'up' },
  ];

  const recentInsights = [
    { id: 1, type: 'warning', message: 'Your shopping expenses increased by 23% this month', icon: TrendingUp },
    { id: 2, type: 'success', message: 'You saved $500 more than last month', icon: DollarSign },
    { id: 3, type: 'info', message: 'Set up a budget to track your spending better', icon: Activity },
  ];

  const getMaxValue = () => Math.max(...monthlyData.map(d => Math.max(d.income, d.expenses)));
  const maxValue = getMaxValue();

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">Track your financial performance and spending patterns</p>
          </div>
          
          {/* Time Range Selector */}
          <div className="flex space-x-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === 'week' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === 'month' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === 'year' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Year
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center">
                <ArrowDownLeft className="h-6 w-6 text-green-600" />
              </div>
              <span className={`text-sm font-medium flex items-center ${
                stats.incomeChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.incomeChange >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                {Math.abs(stats.incomeChange)}%
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-2">Total Income</p>
            <p className="text-3xl font-bold text-gray-900">
              ${stats.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-orange-100 rounded-2xl flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-red-600" />
              </div>
              <span className={`text-sm font-medium flex items-center ${
                stats.expenseChange <= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stats.expenseChange <= 0 ? <TrendingDown className="h-4 w-4 mr-1" /> : <TrendingUp className="h-4 w-4 mr-1" />}
                {Math.abs(stats.expenseChange)}%
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-2">Total Expenses</p>
            <p className="text-3xl font-bold text-gray-900">
              ${stats.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <DollarSign className="h-6 w-6" />
              </div>
              <span className="text-sm font-medium flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                {stats.savingsChange}%
              </span>
            </div>
            <p className="text-white/80 text-sm mb-2">Net Savings</p>
            <p className="text-3xl font-bold">
              ${stats.netSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Income vs Expenses Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Income vs Expenses</h3>
              <button className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                <Download className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            {/* Bar Chart */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Income</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Expenses</span>
                  </div>
                </div>
              </div>

              <div className="relative h-64">
                <div className="absolute inset-0 flex items-end justify-between space-x-2">
                  {monthlyData.map((data, index) => (
                    <div key={data.month} className="flex-1 flex flex-col items-center">
                      <div className="w-full flex space-x-1 items-end mb-2" style={{ height: '200px' }}>
                        <div 
                          className="flex-1 bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-500 hover:opacity-80"
                          style={{ height: `${(data.income / maxValue) * 100}%` }}
                        ></div>
                        <div 
                          className="flex-1 bg-gradient-to-t from-red-500 to-red-400 rounded-t-lg transition-all duration-500 hover:opacity-80"
                          style={{ height: `${(data.expenses / maxValue) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{data.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Spending by Category */}
          <div className="bg-white rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending by Category</h3>
            
            <div className="space-y-4">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <div 
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`cursor-pointer transition-all ${
                      selectedCategory === category.name ? 'scale-105' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          <p className="text-xs text-gray-500">{category.percentage}% of total</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${category.amount}</p>
                        {category.trend === 'up' && (
                          <span className="text-xs text-red-600 flex items-center justify-end">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            12%
                          </span>
                        )}
                        {category.trend === 'down' && (
                          <span className="text-xs text-green-600 flex items-center justify-end">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            8%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`bg-gradient-to-r ${category.color} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="w-full mt-6 py-3 text-purple-600 font-medium hover:bg-purple-50 rounded-2xl transition-all">
              View Detailed Report
            </button>
          </div>
        </div>

        {/* Insights & Recommendations */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights & Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentInsights.map((insight) => {
              const Icon = insight.icon;
              return (
                <div key={insight.id} className="bg-white rounded-2xl p-4">
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      insight.type === 'warning' ? 'bg-yellow-100' :
                      insight.type === 'success' ? 'bg-green-100' : 'bg-blue-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        insight.type === 'warning' ? 'text-yellow-600' :
                        insight.type === 'success' ? 'text-green-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <p className="text-sm text-gray-700">{insight.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}