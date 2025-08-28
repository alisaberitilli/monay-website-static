import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data - replace with real data from API
  const balance = 2547.83;
  const recentTransactions = [
    { id: '1', type: 'expense', amount: -45.50, description: 'Grocery Store', date: 'Today' },
    { id: '2', type: 'income', amount: 1200.00, description: 'Salary', date: 'Yesterday' },
    { id: '3', type: 'expense', amount: -23.99, description: 'Netflix', date: '2 days ago' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Implement actual refresh logic
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good morning</Text>
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={Colors.walletCardGradient}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add" size={20} color={Colors.white} />
              <Text style={styles.actionText}>Add Money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="send" size={20} color={Colors.white} />
              <Text style={styles.actionText}>Send</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.quickActionItem}>
              <Ionicons name="send" size={28} color={Colors.primary} />
              <Text style={styles.quickActionText}>Send Money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Ionicons name="qr-code" size={28} color={Colors.primary} />
              <Text style={styles.quickActionText}>QR Pay</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Ionicons name="phone-portrait" size={28} color={Colors.primary} />
              <Text style={styles.quickActionText}>Mobile Top-up</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionItem}>
              <Ionicons name="receipt" size={28} color={Colors.primary} />
              <Text style={styles.quickActionText}>Bill Pay</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.recentTransactions}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {recentTransactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionIcon}>
                <Ionicons 
                  name={transaction.type === 'income' ? 'arrow-down' : 'arrow-up'} 
                  size={20} 
                  color={transaction.type === 'income' ? Colors.income : Colors.expense} 
                />
              </View>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionDescription}>{transaction.description}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text 
                style={[
                  styles.transactionAmount,
                  { color: transaction.type === 'income' ? Colors.income : Colors.expense }
                ]}
              >
                {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
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
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  logoutButton: {
    padding: 8,
  },
  balanceCard: {
    margin: 20,
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  balanceLabel: {
    color: Colors.white,
    fontSize: 16,
    opacity: 0.9,
  },
  balanceAmount: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  cardActions: {
    flexDirection: 'row',
    marginTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  actionText: {
    color: Colors.white,
    marginLeft: 8,
    fontWeight: '500',
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionItem: {
    width: '23%',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 12,
    color: Colors.textPrimary,
    textAlign: 'center',
    marginTop: 8,
  },
  recentTransactions: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: Colors.primary,
    fontWeight: '500',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  transactionDate: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});