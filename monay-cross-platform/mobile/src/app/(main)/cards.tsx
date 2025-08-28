import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Card {
  id: string;
  type: 'debit' | 'credit' | 'virtual';
  cardNumber: string;
  expiryDate: string;
  holderName: string;
  balance?: number;
  creditLimit?: number;
  isActive: boolean;
  gradient: string[];
}

export default function CardsScreen() {
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - replace with real data from API
  const cards: Card[] = [
    {
      id: '1',
      type: 'debit',
      cardNumber: '**** **** **** 4532',
      expiryDate: '12/26',
      holderName: 'John Doe',
      balance: 2547.83,
      isActive: true,
      gradient: ['#667eea', '#764ba2'],
    },
    {
      id: '2',
      type: 'credit',
      cardNumber: '**** **** **** 8901',
      expiryDate: '09/27',
      holderName: 'John Doe',
      creditLimit: 5000,
      balance: 1250.45,
      isActive: true,
      gradient: ['#f093fb', '#f5576c'],
    },
    {
      id: '3',
      type: 'virtual',
      cardNumber: '**** **** **** 2345',
      expiryDate: '03/25',
      holderName: 'John Doe',
      balance: 500.00,
      isActive: false,
      gradient: ['#4facfe', '#00f2fe'],
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: Implement actual refresh logic
    setTimeout(() => setRefreshing(false), 2000);
  };

  const renderCard = (card: Card) => (
    <LinearGradient
      key={card.id}
      colors={card.gradient}
      style={styles.card}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardType}>
          {card.type.charAt(0).toUpperCase() + card.type.slice(1)} Card
        </Text>
        <View style={styles.cardStatus}>
          <View style={[styles.statusDot, { backgroundColor: card.isActive ? Colors.success : Colors.warning }]} />
          <Text style={styles.statusText}>
            {card.isActive ? 'Active' : 'Inactive'}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardNumber}>{card.cardNumber}</Text>
        <View style={styles.cardDetails}>
          <View>
            <Text style={styles.cardLabel}>Card Holder</Text>
            <Text style={styles.cardValue}>{card.holderName}</Text>
          </View>
          <View>
            <Text style={styles.cardLabel}>Expires</Text>
            <Text style={styles.cardValue}>{card.expiryDate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        {card.type === 'credit' ? (
          <>
            <Text style={styles.balanceLabel}>Available Credit</Text>
            <Text style={styles.balanceAmount}>
              ${(card.creditLimit! - card.balance!).toFixed(2)}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.balanceLabel}>Balance</Text>
            <Text style={styles.balanceAmount}>${card.balance?.toFixed(2)}</Text>
          </>
        )}
      </View>
    </LinearGradient>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Cards</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardsContainer}>
          {cards.map(renderCard)}
        </View>

        {/* Card Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Card Actions</Text>
          
          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="lock-closed" size={24} color={Colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Block/Unblock Card</Text>
              <Text style={styles.actionSubtitle}>Temporarily disable your card</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="settings" size={24} color={Colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Card Settings</Text>
              <Text style={styles.actionSubtitle}>Change PIN, limits, and preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="receipt" size={24} color={Colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Transaction History</Text>
              <Text style={styles.actionSubtitle}>View all card transactions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionItem}>
            <View style={styles.actionIcon}>
              <Ionicons name="add-circle" size={24} color={Colors.primary} />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Request New Card</Text>
              <Text style={styles.actionSubtitle}>Order a replacement or additional card</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  addButton: {
    padding: 8,
  },
  cardsContainer: {
    paddingHorizontal: 20,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 16,
    minHeight: 200,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  cardType: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.9,
  },
  cardStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: Colors.white,
    fontSize: 12,
    opacity: 0.9,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
  },
  cardNumber: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 20,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardLabel: {
    color: Colors.white,
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  cardValue: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  balanceLabel: {
    color: Colors.white,
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  balanceAmount: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  actionSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});