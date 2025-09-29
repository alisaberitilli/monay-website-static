import { useState, useEffect } from 'react';

interface WalletData {
  balance: number;
  currency: string;
  status: string;
  mode: 'mock' | 'postgresql';
}

interface TransactionData {
  transactions: any[];
  summary: {
    totalIncome: number;
    totalExpenses: number;
    transactionCount: number;
  };
}

interface SpendingData {
  categories: Array<{
    name: string;
    amount: number;
    percentage: number;
  }>;
  totalSpending: number;
}

export function useWalletData(userId: string = 'user123') {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData | null>(null);
  const [spending, setSpending] = useState<SpendingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch wallet balance
  const fetchWalletBalance = async () => {
    try {
      const response = await fetch('/api/wallet/balance');
      if (!response.ok) throw new Error('Failed to fetch wallet balance');
      const data = await response.json();
      setWalletData(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch wallet');
      return null;
    }
  };

  // Fetch transactions
  const fetchTransactions = async (limit: number = 10) => {
    try {
      const response = await fetch(`/api/transactions?userId=${userId}&limit=${limit}`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data = await response.json();
      setTransactions(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
      return null;
    }
  };

  // Fetch spending analytics
  const fetchSpending = async (days: number = 30) => {
    try {
      const response = await fetch(`/api/analytics/spending?userId=${userId}&days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch spending data');
      const data = await response.json();
      setSpending(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch spending');
      return null;
    }
  };

  // Add money to wallet
  const addMoney = async (amount: number, paymentMethodId: string) => {
    try {
      const response = await fetch('/api/payments/add-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          paymentMethodId,
          userId
        })
      });
      
      if (!response.ok) throw new Error('Failed to add money');
      
      const data = await response.json();
      
      // Refresh wallet balance after successful payment
      await fetchWalletBalance();
      await fetchTransactions();
      
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add money');
    }
  };

  // Create a new transaction
  const createTransaction = async (transactionData: {
    type: 'deposit' | 'withdrawal' | 'transfer' | 'payment';
    amount: number;
    description: string;
    metadata?: any;
  }) => {
    try {
      if (!walletData) throw new Error('Wallet not loaded');
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletId: 'wallet123', // This should come from walletData
          ...transactionData,
          status: 'completed'
        })
      });
      
      if (!response.ok) throw new Error('Failed to create transaction');
      
      const data = await response.json();
      
      // Refresh data after transaction
      await fetchWalletBalance();
      await fetchTransactions();
      await fetchSpending();
      
      return data;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create transaction');
    }
  };

  // Initial data fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchWalletBalance(),
          fetchTransactions(),
          fetchSpending()
        ]);
      } catch (err) {
        console.error('Error fetching wallet data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, [userId]);

  // Refresh all data
  const refresh = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchWalletBalance(),
      fetchTransactions(),
      fetchSpending()
    ]);
    setIsLoading(false);
  };

  return {
    walletData,
    transactions,
    spending,
    isLoading,
    error,
    refresh,
    addMoney,
    createTransaction,
    fetchWalletBalance,
    fetchTransactions,
    fetchSpending
  };
}