'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Filter,
  Download,
  Search,
  Calendar,
  ChevronDown
} from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface Transaction {
  id: string;
  user_id: string;
  user_name: string;
  user_role?: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  payment_method?: 'USDXM' | 'USDC' | 'USDT' | 'card';
  is_family_transaction?: boolean;
  icon?: string;
}

interface FamilyMember {
  id: string;
  name: string;
  role: 'primary' | 'admin' | 'member' | 'viewer';
  avatar?: string;
}

export default function FamilyTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'transfer'>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isInFamilyGroup, setIsInFamilyGroup] = useState(false);

  useEffect(() => {
    loadTransactions();
    checkFamilyMembership();
  }, [dateRange, selectedMember]);

  const checkFamilyMembership = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/groups/my-membership`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.membership && data.membership.group_type === 'household') {
          setIsInFamilyGroup(true);
          loadFamilyMembers(data.membership.group_id);
        }
      }
    } catch (error) {
      console.error('Failed to check family membership:', error);
    }
  };

  const loadFamilyMembers = async (groupId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/groups/${groupId}/members`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFamilyMembers(data.members || []);
      }
    } catch (error) {
      console.error('Failed to load family members:', error);
    }
  };

  const loadTransactions = async () => {
    try {
      const params = new URLSearchParams({
        period: dateRange,
        ...(selectedMember !== 'all' && { member_id: selectedMember }),
        include_family: isInFamilyGroup ? 'true' : 'false'
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/transactions?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const filteredTransactions = transactions
    .filter(tx => filter === 'all' || tx.type === filter)
    .filter(tx => !searchQuery ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const totalIncome = filteredTransactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = filteredTransactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.type === 'income') {
      return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
    } else if (transaction.type === 'expense') {
      return <ArrowUpRight className="w-5 h-5 text-red-600" />;
    }
    return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse"></div>
        <div className="h-96 bg-gray-100 rounded-xl animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {isInFamilyGroup ? 'Family Transactions' : 'Transactions'}
          </h2>
          {isInFamilyGroup && (
            <Badge className="bg-purple-100 text-purple-700">
              <Users className="w-3 h-3 mr-1" />
              Family View
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 mb-1">Total Income</p>
            <p className="text-2xl font-bold text-green-700">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600 mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpense)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={isInFamilyGroup ? "Search transactions, categories, or family members..." : "Search transactions..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex gap-2">
            {/* Date Range */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                {dateRange === 'week' && 'This Week'}
                {dateRange === 'month' && 'This Month'}
                {dateRange === 'quarter' && 'This Quarter'}
                {dateRange === 'year' && 'This Year'}
                <ChevronDown className="w-4 h-4" />
              </Button>

              {showFilters && (
                <div className="absolute top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-2">
                  {['week', 'month', 'quarter', 'year'].map(range => (
                    <button
                      key={range}
                      onClick={() => {
                        setDateRange(range as any);
                        setShowFilters(false);
                      }}
                      className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-50 ${
                        dateRange === range ? 'bg-purple-50 text-purple-700' : ''
                      }`}
                    >
                      This {range.charAt(0).toUpperCase() + range.slice(1)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Transaction Type Filter */}
            <div className="flex gap-2">
              {(['all', 'income', 'expense', 'transfer'] as const).map(type => (
                <Button
                  key={type}
                  variant={filter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(type)}
                  className={filter === type ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Button>
              ))}
            </div>

            {/* Family Member Filter (if in family group) */}
            {isInFamilyGroup && familyMembers.length > 0 && (
              <select
                value={selectedMember}
                onChange={(e) => setSelectedMember(e.target.value)}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
              >
                <option value="all">All Members</option>
                {familyMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.role === 'primary' && '(Primary)'}
                  </option>
                ))}
              </select>
            )}

            {/* Export Button */}
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Transactions List */}
      <Card className="p-6">
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No transactions found</p>
              <p className="text-sm text-gray-400 mt-2">
                {isInFamilyGroup
                  ? "Family transactions will appear here"
                  : "Your transactions will appear here"}
              </p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    {getTransactionIcon(transaction)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.description}
                      {transaction.is_family_transaction && (
                        <Badge className="ml-2 text-xs bg-purple-100 text-purple-700">
                          {transaction.user_name}
                        </Badge>
                      )}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-500">{transaction.category}</p>
                      <span className="text-gray-300">•</span>
                      <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                      {transaction.payment_method === 'USDXM' && (
                        <>
                          <span className="text-gray-300">•</span>
                          <Badge className="text-xs bg-green-100 text-green-700">
                            USDXM -10%
                          </Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`font-semibold text-lg ${
                    transaction.type === 'income'
                      ? 'text-green-600'
                      : transaction.type === 'expense'
                      ? 'text-red-600'
                      : 'text-blue-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : transaction.type === 'expense' ? '-' : ''}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </p>
                  <Badge className={`text-xs ${
                    transaction.status === 'completed' ? 'bg-green-100 text-green-700' :
                    transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}