import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  category: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export default function TransactionsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');

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
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Implement actual refresh logic
    setTimeout(() => setRefreshing(false), 2000);
  };

  const getTransactionIcon = (type: string, category: string) => {
    switch (type) {
      case 'income':
        return 'arrow-down-circle';
      case 'expense':
        switch (category) {
          case 'Groceries':
            return 'basket';
          case 'Entertainment':
            return 'film';
          case 'Transportation':
            return 'car';
          default:
            return 'arrow-up-circle';
        }
      case 'transfer':
        return 'swap-horizontal';
      default:
        return 'help-circle';
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons 
          name={getTransactionIcon(item.type, item.category)} 
          size={24} 
          color={item.type === 'income' ? Colors.income : Colors.expense} 
        />
      </View>
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionCategory}>{item.category}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <View style={styles.transactionRight}>
        <Text 
          style={[
            styles.transactionAmount,
            { color: item.type === 'income' ? Colors.income : Colors.expense }
          ]}
        >
          {item.type === 'income' ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: Colors.success + '20' }]}>
          <Text style={[styles.statusText, { color: Colors.success }]}>
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transactions</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeFilterTab]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterTabText, filter === 'all' && styles.activeFilterTabText]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'income' && styles.activeFilterTab]}
          onPress={() => setFilter('income')}
        >
          <Text style={[styles.filterTabText, filter === 'income' && styles.activeFilterTabText]}>
            Income
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'expense' && styles.activeFilterTab]}
          onPress={() => setFilter('expense')}
        >
          <Text style={[styles.filterTabText, filter === 'expense' && styles.activeFilterTabText]}>
            Expenses
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  filterButton: {
    padding: 8,
  },
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: Colors.surface,
  },
  activeFilterTab: {
    backgroundColor: Colors.primary,
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  activeFilterTabText: {
    color: Colors.white,
  },
  list: {
    paddingHorizontal: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  transactionCategory: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.textHint,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
});