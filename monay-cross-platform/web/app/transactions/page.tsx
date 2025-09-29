'use client';

import { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter } from 'next/navigation';
import { 
  Search,
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  ChevronRight,
  ShoppingBag,
  Coffee,
  Car,
  Home,
  Briefcase,
  GameController2,
  Music,
  Heart,
  Plane,
  Zap,
  Phone,
  Gift,
  BookOpen,
  Pizza,
  Shirt,
  Dumbbell,
  Camera,
  Tv,
  Package,
  PieChart
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  merchant: string;
  category: string;
  amount: number;
  date: string;
  time: string;
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: string;
  icon?: any;
  description?: string;
  recipientPhone?: string;
  transactionId?: string;
  rawAmount?: number;
  createdAt?: string;
}

interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netFlow: number;
  transactionCount: number;
}

export default function TransactionsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all');
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('month');
  const [showFilters, setShowFilters] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    netFlow: 0,
    transactionCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentLimit, setCurrentLimit] = useState(50);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  // Map categories to icons
  const getCategoryIcon = (category: string, type: 'income' | 'expense') => {
    if (type === 'income') {
      return Briefcase;
    }
    const categoryLower = category.toLowerCase();
    if (categoryLower.includes('food') || categoryLower.includes('dining')) return Coffee;
    if (categoryLower.includes('shopping')) return ShoppingBag;
    if (categoryLower.includes('transport')) return Car;
    if (categoryLower.includes('entertainment')) return Tv;
    if (categoryLower.includes('health') || categoryLower.includes('fitness')) return Dumbbell;
    if (categoryLower.includes('travel')) return Plane;
    if (categoryLower.includes('bills') || categoryLower.includes('utilities')) return Zap;
    if (categoryLower.includes('transfer') || categoryLower.includes('payment')) return ArrowUpRight;
    return Package;
  };

  // Fetch transactions
  const fetchTransactions = async (limit?: number) => {
    try {
      const params = new URLSearchParams({
        type: selectedType,
        category: selectedCategory,
        dateRange,
        limit: (limit || currentLimit).toString()
      });
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/transactions?${params}`);
      const data = await response.json();
      
      if (response.ok) {
        // Add icons to transactions
        const transactionsWithIcons = data.transactions.map((t: Transaction) => ({
          ...t,
          icon: getCategoryIcon(t.category, t.type)
        }));
        
        setTransactions(transactionsWithIcons);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more transactions
  const loadMore = async () => {
    setLoadingMore(true);
    const newLimit = currentLimit + 50;
    setCurrentLimit(newLimit);
    await fetchTransactions(newLimit);
  };

  // Export transactions
  const exportTransactions = async () => {
    try {
      const response = await fetch('/api/transactions/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user123',
          format: 'csv',
          dateRange
        })
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export transactions:', error);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedType, selectedCategory, dateRange, searchQuery]);

  const mockTransactions: Transaction[] = [
    { id: '1', type: 'expense', merchant: 'Starbucks Coffee', category: 'Food & Dining', amount: 12.50, date: 'Today', time: '9:30 AM', status: 'completed', paymentMethod: 'Card ending 8912', icon: Coffee, description: 'Morning coffee' },
    { id: '2', type: 'expense', merchant: 'Amazon Prime', category: 'Shopping', amount: 89.99, date: 'Today', time: '2:15 PM', status: 'completed', paymentMethod: 'Card ending 8912', icon: ShoppingBag },
    { id: '3', type: 'income', merchant: 'Salary - Tech Corp', category: 'Income', amount: 5000.00, date: 'Yesterday', time: '12:00 AM', status: 'completed', paymentMethod: 'Direct Deposit', icon: Briefcase },
    { id: '4', type: 'expense', merchant: 'Uber', category: 'Transport', amount: 24.30, date: 'Yesterday', time: '6:45 PM', status: 'completed', paymentMethod: 'Card ending 3456', icon: Car },
    { id: '5', type: 'expense', merchant: 'Netflix', category: 'Entertainment', amount: 15.99, date: '2 days ago', time: '3:00 PM', status: 'completed', paymentMethod: 'Card ending 8912', icon: Tv },
    { id: '6', type: 'expense', merchant: 'Whole Foods Market', category: 'Groceries', amount: 142.67, date: '3 days ago', time: '4:30 PM', status: 'completed', paymentMethod: 'Card ending 8912', icon: ShoppingBag },
    { id: '7', type: 'expense', merchant: 'Gold\'s Gym', category: 'Health & Fitness', amount: 49.99, date: '4 days ago', time: '10:00 AM', status: 'completed', paymentMethod: 'Card ending 3456', icon: Dumbbell },
    { id: '8', type: 'income', merchant: 'Freelance Project', category: 'Income', amount: 1500.00, date: '5 days ago', time: '2:00 PM', status: 'completed', paymentMethod: 'Bank Transfer', icon: Briefcase },
    { id: '9', type: 'expense', merchant: 'Apple Store', category: 'Electronics', amount: 199.00, date: '6 days ago', time: '11:30 AM', status: 'completed', paymentMethod: 'Card ending 8912', icon: Phone },
    { id: '10', type: 'expense', merchant: 'Delta Airlines', category: 'Travel', amount: 450.00, date: '1 week ago', time: '8:00 AM', status: 'completed', paymentMethod: 'Card ending 8912', icon: Plane },
  ];

  // Use real transactions if available, otherwise show mock data
  const displayTransactions = transactions.length > 0 ? transactions : mockTransactions;

  const categories = [
    { name: 'All Categories', value: 'all', count: transactions.length },
    { name: 'Food & Dining', value: 'food', count: 15 },
    { name: 'Shopping', value: 'shopping', count: 12 },
    { name: 'Transport', value: 'transport', count: 8 },
    { name: 'Entertainment', value: 'entertainment', count: 6 },
    { name: 'Bills & Utilities', value: 'bills', count: 5 },
    { name: 'Health & Fitness', value: 'health', count: 3 },
  ];

  // Use real summary if available
  const stats = summary.transactionCount > 0 ? summary : {
    totalIncome: 6500.00,
    totalExpenses: 2043.44,
    netFlow: 4456.56,
    transactionCount: mockTransactions.length
  };

  // Filtering is now done server-side, but we keep this for mock data
  const filteredTransactions = displayTransactions;

  const groupedTransactions = filteredTransactions.reduce((groups: any, transaction) => {
    const date = transaction.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {});

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-2">View and manage all your transactions</p>
          </div>
          
          <button 
            onClick={exportTransactions}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-all flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Income</p>
              <ArrowDownLeft className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${stats.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <ArrowUpRight className="h-4 w-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${stats.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-white/80">Net Flow</p>
              <ArrowUpRight className="h-4 w-4" />
            </div>
            <p className="text-2xl font-bold">
              +${stats.netFlow.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Transactions</p>
              <Calendar className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.transactionCount}</p>
          </div>
        </div>

        {/* Spending by Category Pie Chart */}
        <div className="bg-white rounded-3xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Spending by Category</h3>
            <PieChart className="h-5 w-5 text-purple-600" />
          </div>
          
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
            {/* Pie Chart */}
            <div className="relative w-64 h-64">
              <svg width="256" height="256" viewBox="0 0 256 256">
                {(() => {
                  // Calculate spending by category
                  const categorySpending: Record<string, number> = {};
                  const categoryColors: Record<string, string> = {
                    'Food & Dining': '#10B981', // green
                    'Shopping': '#8B5CF6', // purple
                    'Transport': '#3B82F6', // blue
                    'Entertainment': '#F59E0B', // amber
                    'Health & Fitness': '#EC4899', // pink
                    'Bills & Utilities': '#6366F1', // indigo
                    'Travel': '#14B8A6', // teal
                    'Groceries': '#84CC16', // lime
                    'Electronics': '#EF4444', // red
                    'Income': '#059669', // emerald
                    'Other': '#6B7280' // gray
                  };
                  
                  displayTransactions
                    .filter(t => t.type === 'expense')
                    .forEach(t => {
                      const category = t.category || 'Other';
                      categorySpending[category] = (categorySpending[category] || 0) + Math.abs(t.amount);
                    });
                  
                  const total = Object.values(categorySpending).reduce((sum, val) => sum + val, 0);
                  
                  if (total === 0) {
                    return (
                      <g>
                        <circle cx="128" cy="128" r="100" fill="#F3F4F6" />
                        <text x="128" y="128" textAnchor="middle" dominantBaseline="middle" 
                              className="text-gray-500 text-sm">
                          No expense data
                        </text>
                      </g>
                    );
                  }
                  
                  let currentAngle = -90; // Start from top
                  const segments: JSX.Element[] = [];
                  const labels: JSX.Element[] = [];
                  
                  Object.entries(categorySpending)
                    .sort((a, b) => b[1] - a[1])
                    .forEach(([category, amount], index) => {
                      const percentage = (amount / total) * 100;
                      const angle = (percentage / 100) * 360;
                      const isHovered = hoveredSegment === category;
                      
                      // Debug logging
                      console.log('Category:', category, 'Color:', categoryColors[category]);
                      
                      // Calculate path for pie segment
                      const startAngleRad = (currentAngle * Math.PI) / 180;
                      const endAngleRad = ((currentAngle + angle) * Math.PI) / 180;
                      
                      const x1 = 128 + (isHovered ? 105 : 100) * Math.cos(startAngleRad);
                      const y1 = 128 + (isHovered ? 105 : 100) * Math.sin(startAngleRad);
                      const x2 = 128 + (isHovered ? 105 : 100) * Math.cos(endAngleRad);
                      const y2 = 128 + (isHovered ? 105 : 100) * Math.sin(endAngleRad);
                      
                      const largeArc = angle > 180 ? 1 : 0;
                      
                      const pathData = [
                        `M 128 128`,
                        `L ${x1} ${y1}`,
                        `A ${isHovered ? 105 : 100} ${isHovered ? 105 : 100} 0 ${largeArc} 1 ${x2} ${y2}`,
                        `Z`
                      ].join(' ');
                      
                      segments.push(
                        <path
                          key={category}
                          d={pathData}
                          fill={categoryColors[category] || '#6B7280'}
                          stroke="white"
                          strokeWidth="2"
                          style={{
                            fill: categoryColors[category] || '#6B7280',
                            filter: isHovered ? 'brightness(1.1)' : 'brightness(1)',
                            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                            transformOrigin: '128px 128px',
                            transition: 'all 0.2s'
                          }}
                          onMouseEnter={() => setHoveredSegment(category)}
                          onMouseLeave={() => setHoveredSegment(null)}
                        />
                      );
                      
                      // Add percentage label if segment is large enough
                      if (percentage > 5) {
                        const labelAngle = currentAngle + angle / 2;
                        const labelAngleRad = (labelAngle * Math.PI) / 180;
                        const labelX = 128 + 60 * Math.cos(labelAngleRad);
                        const labelY = 128 + 60 * Math.sin(labelAngleRad);
                        
                        labels.push(
                          <text
                            key={`label-${category}`}
                            x={labelX}
                            y={labelY}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            className="text-white text-xs font-semibold pointer-events-none"
                            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
                          >
                            {percentage.toFixed(0)}%
                          </text>
                        );
                      }
                      
                      currentAngle += angle;
                    });
                  
                  return (
                    <g>
                      {segments}
                      {labels}
                    </g>
                  );
                })()}
              </svg>
              
              {/* Center hole for donut effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-full w-32 h-32 flex flex-col items-center justify-center shadow-inner">
                  <p className="text-xs text-gray-500">Total Spent</p>
                  <p className="text-xl font-bold text-gray-900">
                    ${displayTransactions
                      .filter(t => t.type === 'expense')
                      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                      .toFixed(0)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex flex-col space-y-2">
              {(() => {
                const categorySpending: Record<string, number> = {};
                const categoryColors: Record<string, string> = {
                  'Food & Dining': '#10B981',
                  'Shopping': '#8B5CF6',
                  'Transport': '#3B82F6',
                  'Entertainment': '#F59E0B',
                  'Health & Fitness': '#EC4899',
                  'Bills & Utilities': '#6366F1',
                  'Travel': '#14B8A6',
                  'Groceries': '#84CC16',
                  'Electronics': '#EF4444',
                  'Income': '#059669',
                  'Other': '#6B7280'
                };
                
                displayTransactions
                  .filter(t => t.type === 'expense')
                  .forEach(t => {
                    const category = t.category || 'Other';
                    categorySpending[category] = (categorySpending[category] || 0) + Math.abs(t.amount);
                  });
                
                return Object.entries(categorySpending)
                  .sort((a, b) => b[1] - a[1])
                  .slice(0, 8)
                  .map(([category, amount]) => (
                    <div
                      key={category}
                      className="flex items-center space-x-3 cursor-pointer transition-all hover:scale-105"
                      onMouseEnter={() => setHoveredSegment(category)}
                      onMouseLeave={() => setHoveredSegment(null)}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: categoryColors[category] || '#6B7280' }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{category}</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        ${amount.toFixed(0)}
                      </p>
                    </div>
                  ));
              })()}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Filters</h3>
              
              {/* Transaction Type */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Type</p>
                <div className="space-y-2">
                  <button
                    onClick={() => setSelectedType('all')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      selectedType === 'all' 
                        ? 'bg-purple-50 text-purple-700 font-medium' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    All Transactions
                  </button>
                  <button
                    onClick={() => setSelectedType('income')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      selectedType === 'income' 
                        ? 'bg-green-50 text-green-700 font-medium' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Income Only
                  </button>
                  <button
                    onClick={() => setSelectedType('expense')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                      selectedType === 'expense' 
                        ? 'bg-red-50 text-red-700 font-medium' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Expenses Only
                  </button>
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <p className="text-sm font-medium text-gray-700 mb-3">Category</p>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      onClick={() => setSelectedCategory(category.value)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all flex justify-between items-center ${
                        selectedCategory === category.value 
                          ? 'bg-purple-50 text-purple-700 font-medium' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <span>{category.name}</span>
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{category.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">Date Range</p>
                <div className="space-y-2">
                  {['today', 'week', 'month', 'year'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range as any)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all capitalize ${
                        dateRange === range 
                          ? 'bg-purple-50 text-purple-700 font-medium' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {range === 'today' ? 'Today' : `This ${range}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="bg-white rounded-3xl p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading transactions...</p>
              </div>
            )}

            {/* Transactions by Date */}
            {!loading && (
            <div className="space-y-6">
              {Object.entries(groupedTransactions).map(([date, transactions]: [string, any]) => (
                <div key={date} className="bg-white rounded-3xl p-6">
                  <h4 className="text-sm font-medium text-gray-600 mb-4">{date}</h4>
                  
                  <div className="space-y-3">
                    {transactions.map((transaction: Transaction) => {
                      const Icon = transaction.icon;
                      return (
                        <div 
                          key={transaction.id} 
                          className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer group"
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                              transaction.type === 'income' 
                                ? 'bg-gradient-to-br from-green-100 to-emerald-100' 
                                : 'bg-gradient-to-br from-purple-100 to-pink-100'
                            }`}>
                              {Icon && <Icon className={`h-6 w-6 ${
                                transaction.type === 'income' ? 'text-green-600' : 'text-purple-600'
                              }`} />}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{transaction.merchant}</p>
                              <div className="flex items-center space-x-3 text-sm text-gray-500">
                                <span>{transaction.time}</span>
                                <span>•</span>
                                <span>{transaction.paymentMethod}</span>
                                {transaction.description && (
                                  <>
                                    <span>•</span>
                                    <span>{transaction.description}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className={`font-semibold text-lg ${
                                transaction.type === 'income' ? 'text-green-600' : 'text-gray-900'
                              }`}>
                                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                              </p>
                              <p className={`text-xs ${
                                transaction.status === 'completed' ? 'text-green-600' :
                                transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {transaction.status}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* No transactions message */}
              {!loading && displayTransactions.length === 0 && (
                <div className="bg-white rounded-3xl p-12 text-center">
                  <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No transactions found</h3>
                  <p className="text-gray-600 mb-6">Try adjusting your filters or make your first transaction</p>
                  <button 
                    onClick={() => router.push('/send')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                    Send Money
                  </button>
                </div>
              )}
            </div>
            )}

            {/* Load More Button */}
            {!loading && displayTransactions.length >= currentLimit && (
              <div className="flex justify-center mt-8">
                <button 
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50">
                  {loadingMore ? 'Loading...' : 'Load More Transactions'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}