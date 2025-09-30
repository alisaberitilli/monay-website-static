'use client';

import { useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Send,
  Filter,
  Search,
  ShoppingBasket,
  Film,
  Car,
  HelpCircle
} from 'lucide-react';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function TransactionsPage() {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data - replace with real data from API
  const transactions: Transaction[] = [
    {
      id: '1',
      type: 'expense',
      amount: -45.50,
      description: 'Whole Foods Market',
      category: 'Groceries',
      date: '2024-01-15',
      status: 'completed',
    },
    {
      id: '2',
      type: 'income',
      amount: 1200.00,
      description: 'Salary Payment',
      category: 'Income',
      date: '2024-01-14',
      status: 'completed',
    },
    {
      id: '3',
      type: 'expense',
      amount: -23.99,
      description: 'Netflix Subscription',
      category: 'Entertainment',
      date: '2024-01-13',
      status: 'completed',
    },
    {
      id: '4',
      type: 'transfer',
      amount: -500.00,
      description: 'Transfer to John Doe',
      category: 'Transfer',
      date: '2024-01-12',
      status: 'completed',
    },
    {
      id: '5',
      type: 'expense',
      amount: -89.99,
      description: 'Gas Station',
      category: 'Transportation',
      date: '2024-01-11',
      status: 'completed',
    },
    {
      id: '6',
      type: 'income',
      amount: 50.00,
      description: 'Cashback Reward',
      category: 'Rewards',
      date: '2024-01-10',
      status: 'completed',
    },
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesFilter = filter === 'all' || transaction.type === filter;
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getTransactionIcon = (type: string, category: string) => {
    switch (type) {
      case 'income':
        return ArrowDown;
      case 'expense':
        switch (category) {
          case 'Groceries':
            return ShoppingBasket;
          case 'Entertainment':
            return Film;
          case 'Transportation':
            return Car;
          default:
            return ArrowUp;
        }
      case 'transfer':
        return Send;
      default:
        return HelpCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
          <Filter className="h-4 w-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search transactions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'all' 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('income')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'income' 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Income
        </button>
        <button
          onClick={() => setFilter('expense')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            filter === 'expense' 
              ? 'bg-primary-500 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Expenses
        </button>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-lg font-medium mb-2">No transactions found</div>
            <div className="text-sm">Try adjusting your search or filter criteria</div>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredTransactions.map((transaction) => {
              const IconComponent = getTransactionIcon(transaction.type, transaction.category);
              return (
                <div key={transaction.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`rounded-full p-3 ${
                      transaction.type === 'income' 
                        ? 'bg-green-100' 
                        : transaction.type === 'expense' 
                        ? 'bg-red-100' 
                        : 'bg-blue-100'
                    }`}>
                      <IconComponent className={`h-5 w-5 ${
                        transaction.type === 'income' 
                          ? 'text-green-600' 
                          : transaction.type === 'expense' 
                          ? 'text-red-600' 
                          : 'text-blue-600'
                      }`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {transaction.description}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {transaction.category} • {transaction.date}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded-full capitalize mt-1 ${getStatusColor(transaction.status)}`}>
                        {transaction.status}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}